import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import "./horizon-hero-section.css";

gsap.registerPlugin(ScrollTrigger);

// Don't re-measure pins when the mobile URL bar shows/hides — prevents jumps/jank.
ScrollTrigger.config({ ignoreMobileResize: true });

/** Lower the scene budget on phones / coarse pointers so the hero stays smooth. */
function getQuality() {
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const isMobile = (typeof window !== "undefined" && window.innerWidth < 768) || coarse;
  return {
    isMobile,
    stars: isMobile ? 1800 : 5000,
    layers: isMobile ? 2 : 3,
    dpr: Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, isMobile ? 1.5 : 2),
    bloom: isMobile ? 0.55 : 0.8,
  };
}

export interface HorizonHeroScene {
  /** Big display word(s) for this scene. */
  title: string;
  /** Two supporting lines shown under the title. */
  lines: [string, string];
}

export interface HorizonHeroCta {
  label: string;
  onClick?: () => void;
}

export interface HorizonHeroProps {
  /** Scenes scrolled through (camera flies between them). Defaults to OFF GRID copy. */
  scenes?: HorizonHeroScene[];
  /** Vertical brand label, top-left. */
  sideLabel?: string;
  /** Primary CTA (filled), shown on the first scene. */
  primaryCta?: HorizonHeroCta;
  /** Secondary CTA (ghost), shown on the first scene. */
  secondaryCta?: HorizonHeroCta;
}

// Camera waypoints — one per scene. The rig eases between these on scroll.
const CAMERA_POSITIONS = [
  { x: 0, y: 30, z: 300 },
  { x: 0, y: 40, z: -50 },
  { x: 0, y: 50, z: -700 },
];

const DEFAULT_SCENES: HorizonHeroScene[] = [
  { title: "OFF GRID\u00AE", lines: ["Play Different. Live Off Grid.", "When comfort meets movement."] },
  { title: "IN MOTION", lines: ["Gritty. Product-focused.", "Engineered for the way you move."] },
  { title: "EST. MANILA", lines: ["Progress over perfection.", "Premium Filipino sportswear."] },
];

export const Component: React.FC<HorizonHeroProps> = ({
  scenes = DEFAULT_SCENES,
  sideLabel = "EST. MANILA, PH",
  primaryCta,
  secondaryCta,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  const smoothCameraPos = useRef({ ...CAMERA_POSITIONS[0] });

  const [currentSection, setCurrentSection] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const totalSections = scenes.length;

  // Mutable WebGL scene bag — intentionally untyped (Three.js internals).
  const threeRefs = useRef<any>({
    scene: null,
    camera: null,
    renderer: null,
    composer: null,
    stars: [],
    nebula: null,
    mountains: [],
    animationId: null,
  });

  // ── Three.js setup ────────────────────────────────────────────────────────
  useEffect(() => {
    const createStarField = () => {
      const refs = threeRefs.current;
      const starCount = refs.quality.stars;

      for (let i = 0; i < refs.quality.layers; i++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        for (let j = 0; j < starCount; j++) {
          const radius = 200 + Math.random() * 800;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(Math.random() * 2 - 1);

          positions[j * 3] = radius * Math.sin(phi) * Math.cos(theta);
          positions[j * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
          positions[j * 3 + 2] = radius * Math.cos(phi);

          // Brand-only star colors: mostly white, a minority electric blue.
          const color = new THREE.Color();
          if (Math.random() < 0.85) {
            color.setHSL(0, 0, 0.85 + Math.random() * 0.15);
          } else {
            color.setHSL(0.66, 1.0, 0.6);
          }

          colors[j * 3] = color.r;
          colors[j * 3 + 1] = color.g;
          colors[j * 3 + 2] = color.b;

          sizes[j] = Math.random() * 2 + 0.5;
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
          uniforms: {
            time: { value: 0 },
            depth: { value: i },
          },
          vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            uniform float depth;

            void main() {
              vColor = color;
              vec3 pos = position;

              float angle = time * 0.05 * (1.0 - depth * 0.3);
              mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
              pos.xy = rot * pos.xy;

              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_PointSize = size * (300.0 / -mvPosition.z);
              gl_Position = projectionMatrix * mvPosition;
            }
          `,
          fragmentShader: `
            varying vec3 vColor;

            void main() {
              float dist = length(gl_PointCoord - vec2(0.5));
              if (dist > 0.5) discard;

              float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
              gl_FragColor = vec4(vColor, opacity);
            }
          `,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const stars = new THREE.Points(geometry, material);
        refs.scene.add(stars);
        refs.stars.push(stars);
      }
    };

    const createNebula = () => {
      const refs = threeRefs.current;

      const geometry = new THREE.PlaneGeometry(8000, 4000, 100, 100);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          // Brand electric-blue nebula (deep blue -> electric blue), no off-brand pink.
          color1: { value: new THREE.Color(0x00068d) },
          color2: { value: new THREE.Color(0x000aff) },
          opacity: { value: 0.32 },
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vElevation;
          uniform float time;

          void main() {
            vUv = uv;
            vec3 pos = position;

            float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
            pos.z += elevation;
            vElevation = elevation;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform float opacity;
          uniform float time;
          varying vec2 vUv;
          varying float vElevation;

          void main() {
            float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
            vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);

            float alpha = opacity * (1.0 - length(vUv - 0.5) * 2.0);
            alpha *= 1.0 + vElevation * 0.01;

            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const nebula = new THREE.Mesh(geometry, material);
      nebula.position.z = -1050;
      nebula.rotation.x = 0;
      refs.scene.add(nebula);
      refs.nebula = nebula;
    };

    const createMountains = () => {
      const refs = threeRefs.current;

      // Near-black -> deep navy silhouette ramp (brand grayscale/blue, no teal).
      const layers = [
        { distance: -50, height: 60, color: 0x000000, opacity: 1 },
        { distance: -100, height: 80, color: 0x05060f, opacity: 0.85 },
        { distance: -150, height: 100, color: 0x070b22, opacity: 0.6 },
        { distance: -200, height: 120, color: 0x00068d, opacity: 0.35 },
      ];

      layers.forEach((layer, index) => {
        const points: THREE.Vector2[] = [];
        const segments = 50;

        for (let i = 0; i <= segments; i++) {
          const x = (i / segments - 0.5) * 1000;
          const y =
            Math.sin(i * 0.1) * layer.height +
            Math.sin(i * 0.05) * layer.height * 0.5 +
            Math.random() * layer.height * 0.2 -
            100;
          points.push(new THREE.Vector2(x, y));
        }

        points.push(new THREE.Vector2(5000, -300));
        points.push(new THREE.Vector2(-5000, -300));

        const shape = new THREE.Shape(points);
        const geometry = new THREE.ShapeGeometry(shape);
        const material = new THREE.MeshBasicMaterial({
          color: layer.color,
          transparent: true,
          opacity: layer.opacity,
          side: THREE.DoubleSide,
        });

        const mountain = new THREE.Mesh(geometry, material);
        mountain.position.z = layer.distance;
        mountain.position.y = layer.distance;
        mountain.userData = { baseZ: layer.distance, index };
        refs.scene.add(mountain);
        refs.mountains.push(mountain);
      });
    };

    const createAtmosphere = () => {
      const refs = threeRefs.current;

      const geometry = new THREE.SphereGeometry(600, 32, 32);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
        },
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;

          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          uniform float time;

          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            // Electric-blue rim glow.
            vec3 atmosphere = vec3(0.05, 0.1, 1.0) * intensity;

            float pulse = sin(time * 2.0) * 0.1 + 0.9;
            atmosphere *= pulse;

            gl_FragColor = vec4(atmosphere, intensity * 0.25);
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });

      const atmosphere = new THREE.Mesh(geometry, material);
      refs.scene.add(atmosphere);
    };

    const renderFrame = () => {
      const refs = threeRefs.current;
      if (!refs.running) return;
      refs.animationId = requestAnimationFrame(renderFrame);

      const time = Date.now() * 0.001;

      refs.stars.forEach((starField: THREE.Points) => {
        const mat = starField.material as THREE.ShaderMaterial;
        if (mat.uniforms) mat.uniforms.time.value = time;
      });

      if (refs.nebula) {
        const mat = refs.nebula.material as THREE.ShaderMaterial;
        if (mat.uniforms) mat.uniforms.time.value = time * 0.5;
      }

      if (refs.camera && refs.targetCameraX !== undefined) {
        const smoothingFactor = 0.05;

        smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * smoothingFactor;
        smoothCameraPos.current.y += (refs.targetCameraY - smoothCameraPos.current.y) * smoothingFactor;
        smoothCameraPos.current.z += (refs.targetCameraZ - smoothCameraPos.current.z) * smoothingFactor;

        const floatX = Math.sin(time * 0.1) * 2;
        const floatY = Math.cos(time * 0.15) * 1;

        refs.camera.position.x = smoothCameraPos.current.x + floatX;
        refs.camera.position.y = smoothCameraPos.current.y + floatY;
        refs.camera.position.z = smoothCameraPos.current.z;
        refs.camera.lookAt(0, 10, -600);
      }

      refs.mountains.forEach((mountain: THREE.Mesh, i: number) => {
        const parallaxFactor = 1 + i * 0.5;
        mountain.position.x = Math.sin(time * 0.1) * 2 * parallaxFactor;
        mountain.position.y = 50 + Math.cos(time * 0.15) * 1 * parallaxFactor;
      });

      if (refs.composer) refs.composer.render();
    };

    const startLoop = () => {
      const refs = threeRefs.current;
      if (!refs.running) {
        refs.running = true;
        renderFrame();
      }
    };

    const stopLoop = () => {
      const refs = threeRefs.current;
      refs.running = false;
      if (refs.animationId) cancelAnimationFrame(refs.animationId);
      refs.animationId = null;
    };

    const initThree = () => {
      const refs = threeRefs.current;
      refs.quality = getQuality();

      refs.scene = new THREE.Scene();
      refs.scene.fog = new THREE.FogExp2(0x000000, 0.00025);

      refs.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
      refs.camera.position.set(CAMERA_POSITIONS[0].x, CAMERA_POSITIONS[0].y, CAMERA_POSITIONS[0].z);

      // Start the rig parked on scene 0 so there's no intro jump before scroll.
      refs.targetCameraX = CAMERA_POSITIONS[0].x;
      refs.targetCameraY = CAMERA_POSITIONS[0].y;
      refs.targetCameraZ = CAMERA_POSITIONS[0].z;

      refs.renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current as HTMLCanvasElement,
        antialias: true,
        alpha: true,
      });
      refs.renderer.setSize(window.innerWidth, window.innerHeight);
      refs.renderer.setPixelRatio(refs.quality.dpr);
      refs.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      refs.renderer.toneMappingExposure = 0.5;

      refs.composer = new EffectComposer(refs.renderer);
      refs.composer.addPass(new RenderPass(refs.scene, refs.camera));
      refs.composer.addPass(
        new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), refs.quality.bloom, 0.4, 0.85),
      );

      createStarField();
      createNebula();
      createMountains();
      createAtmosphere();

      startLoop();
      setIsReady(true);
    };

    initThree();

    // Pause all GPU work whenever the hero is scrolled out of view.
    let observer: IntersectionObserver | null = null;
    if (containerRef.current && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) startLoop();
          else stopLoop();
        },
        { threshold: 0 },
      );
      observer.observe(containerRef.current);
    }

    const handleResize = () => {
      const refs = threeRefs.current;
      if (refs.camera && refs.renderer && refs.composer) {
        refs.camera.aspect = window.innerWidth / window.innerHeight;
        refs.camera.updateProjectionMatrix();
        refs.renderer.setSize(window.innerWidth, window.innerHeight);
        refs.composer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      const refs = threeRefs.current;
      stopLoop();
      if (observer) observer.disconnect();
      window.removeEventListener("resize", handleResize);

      refs.stars.forEach((starField: THREE.Points) => {
        starField.geometry.dispose();
        (starField.material as THREE.Material).dispose();
      });
      refs.mountains.forEach((mountain: THREE.Mesh) => {
        mountain.geometry.dispose();
        (mountain.material as THREE.Material).dispose();
      });
      if (refs.nebula) {
        refs.nebula.geometry.dispose();
        (refs.nebula.material as THREE.Material).dispose();
      }
      if (refs.renderer) refs.renderer.dispose();
    };
  }, []);

  // ── Intro animation (menu + progress) ─────────────────────────────────────
  useEffect(() => {
    if (!isReady) return;
    const ctx = gsap.context(() => {
      gsap.set([asideRef.current, progressRef.current], { visibility: "visible" });
      if (asideRef.current) {
        gsap.from(asideRef.current, { x: -40, opacity: 0, duration: 1, ease: "power3.out" });
      }
      if (progressRef.current) {
        gsap.from(progressRef.current, { opacity: 0, y: 40, duration: 1, ease: "power2.out", delay: 0.4 });
      }
    });
    return () => ctx.revert();
  }, [isReady]);

  // ── Per-scene title/subtitle entrance (replays on scene change) ────────────
  useEffect(() => {
    if (!isReady) return;
    const chars = titleRef.current?.querySelectorAll(".title-char");
    const lines = subtitleRef.current?.querySelectorAll(".subtitle-line");
    const ctx = gsap.context(() => {
      if (chars && chars.length) {
        gsap.fromTo(
          chars,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.04, ease: "power4.out" },
        );
      }
      if (lines && lines.length) {
        gsap.fromTo(
          lines,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.15 },
        );
      }
    });
    return () => ctx.revert();
  }, [currentSection, isReady]);

  // ── Scroll: GSAP ScrollTrigger pins the stage and scrubs the 3 scenes ──────
  useEffect(() => {
    if (!isReady) return;
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const segments = Math.max(totalSections - 1, 1);

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        // One viewport of scroll per scene → roomy, smooth scrubbed transitions.
        end: () => "+=" + window.innerHeight * totalSections,
        pin: stage,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;

          if (fillRef.current) fillRef.current.style.width = `${p * 100}%`;

          const section = Math.min(Math.floor(p * totalSections), totalSections - 1);
          setCurrentSection((prev) => (prev === section ? prev : section));

          // Ease the camera across waypoints; the animate() loop adds final smoothing.
          const t = p * segments;
          const idx = Math.min(Math.floor(t), segments - 1);
          const f = t - idx;
          const a = CAMERA_POSITIONS[idx] || CAMERA_POSITIONS[0];
          const b = CAMERA_POSITIONS[idx + 1] || a;

          const refs = threeRefs.current;
          refs.targetCameraX = a.x + (b.x - a.x) * f;
          refs.targetCameraY = a.y + (b.y - a.y) * f;
          refs.targetCameraZ = a.z + (b.z - a.z) * f;
        },
      });
    });

    // Layout settles (fonts/canvas) — make sure pin distance is measured correctly.
    const refreshId = window.setTimeout(() => ScrollTrigger.refresh(), 0);

    return () => {
      window.clearTimeout(refreshId);
      ctx.revert();
    };
  }, [isReady, totalSections]);

  const splitTitle = (text: string) =>
    text.split("").map((char, i) => (
      <span key={i} className="title-char">
        {char === " " ? "\u00A0" : char}
      </span>
    ));

  const scene = scenes[currentSection] ?? scenes[0];

  return (
    <div ref={containerRef} className="horizon-hero" aria-label="Hero">
      <div ref={stageRef} className="horizon-hero__stage">
        <canvas ref={canvasRef} className="horizon-hero__canvas" />
        <div className="horizon-hero__scrim" />

        <div className="horizon-hero__overlay">
          {/* Vertical brand label */}
          <div ref={asideRef} className="horizon-hero__aside" style={{ visibility: "hidden" }}>
            <div className="horizon-hero__aside-tick" />
            <div className="horizon-hero__aside-text">{sideLabel}</div>
          </div>

          {/* Centered content — re-keyed per scene so it animates in */}
          <div className="horizon-hero__content">
            <h1 ref={titleRef} key={`t-${currentSection}`} className="horizon-hero__title">
              {splitTitle(scene.title)}
            </h1>
            <div ref={subtitleRef} key={`s-${currentSection}`} className="horizon-hero__subtitle">
              <p className="subtitle-line">{scene.lines[0]}</p>
              <p className="subtitle-line">{scene.lines[1]}</p>
            </div>

            {currentSection === 0 && (primaryCta || secondaryCta) && (
              <div className="horizon-hero__cta-row">
                {primaryCta && (
                  <button type="button" className="horizon-hero__cta horizon-hero__cta--primary" onClick={primaryCta.onClick}>
                    {primaryCta.label}
                  </button>
                )}
                {secondaryCta && (
                  <button type="button" className="horizon-hero__cta horizon-hero__cta--ghost" onClick={secondaryCta.onClick}>
                    {secondaryCta.label}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Scroll progress + section counter (mono, no "scroll" label) */}
          <div ref={progressRef} className="horizon-hero__progress" style={{ visibility: "hidden" }}>
            <div className="horizon-hero__track">
              <div ref={fillRef} className="horizon-hero__fill" />
            </div>
            <div className="horizon-hero__counter">
              {String(currentSection + 1).padStart(2, "0")} / {String(totalSections).padStart(2, "0")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Component;
