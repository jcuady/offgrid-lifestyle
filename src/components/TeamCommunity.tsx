import { motion } from "motion/react";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { sectionPaddingCream, siteContainer } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/offgridlifestyle.ph/", icon: <Instagram className="h-4 w-4" /> },
  { label: "Facebook", href: "https://www.facebook.com/offgridlifestyleph/", icon: <Facebook className="h-4 w-4" /> },
];

// Inline athlete faces with a hover quote (CSS popover — no tooltip dependency).
// Stock portraits; swap for real community photos when available.
const FACES = [
  {
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces",
    alt: "OFF GRID community member",
    quote: "Our whole pickleball crew reps OFF GRID now. The custom kits came out clean.",
    name: "Marco D.",
  },
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces",
    alt: "OFF GRID team captain",
    quote: "Easiest team order I've done — design help, sizing, and tracked delivery.",
    name: "Bea R.",
  },
];

// Sample teams — placeholders. Replace labels/wordmarks with real partner teams.
const TEAMS = [
  { name: "Manila Smash", sport: "Pickleball" },
  { name: "Fairway Co.", sport: "Golf" },
  { name: "Takbo MNL", sport: "Running" },
  { name: "Barangay Ball", sport: "Basketball" },
];

function FaceChip({ face }: { face: (typeof FACES)[number] }) {
  return (
    <span className="group relative mx-1.5 inline-block align-middle">
      <span className="relative block h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm transition-all duration-300 group-hover:w-28 sm:h-14 sm:w-14">
        <img src={face.src} alt={face.alt} loading="lazy" className="h-full w-full object-cover" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-60 -translate-x-1/2 translate-y-1 rounded-2xl border border-offgrid-green/10 bg-white p-4 text-left opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
        <span className="block text-sm font-medium leading-relaxed text-offgrid-green/85">&ldquo;{face.quote}&rdquo;</span>
        <span className="mt-2 block font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-offgrid-green/55">
          {face.name}
        </span>
      </span>
    </span>
  );
}

export function TeamCommunity() {
  const navigate = useNavigate();

  return (
    <section className={cn(sectionPaddingCream, "overflow-hidden bg-offgrid-cream")}>
      <div className={siteContainer}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="mb-8 flex justify-center">
            <span className="rounded-full bg-offgrid-green/[0.06] px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/70">
              Our Community
            </span>
          </div>

          <h2 className="mx-auto max-w-4xl text-center font-display text-3xl font-black leading-[1.05] tracking-tight text-offgrid-green sm:text-4xl lg:text-5xl">
            We make it easy for{" "}
            <FaceChip face={FACES[0]} />{" "}
            teams and their{" "}
            <FaceChip face={FACES[1]} />{" "}
            players to design, order, and rep custom gear.
          </h2>

          {/* Trusted-by teams — wordmark flips to reveal the sport on hover */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-offgrid-green/10 bg-offgrid-green/10 sm:grid-cols-4">
            {TEAMS.map((team) => (
              <div key={team.name} className="group relative h-24 overflow-hidden bg-white">
                <div className="absolute inset-0 flex items-center justify-center px-4 transition-all duration-300 ease-out group-hover:-translate-y-10 group-hover:opacity-0">
                  <span className="text-center font-display text-base font-black uppercase tracking-tight text-offgrid-green/35">
                    {team.name}
                  </span>
                </div>
                <div className="absolute inset-0 flex translate-y-10 flex-col items-center justify-center px-4 text-center opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-offgrid-lime">
                    {team.sport}
                  </span>
                  <span className="mt-1 font-display text-sm font-bold text-offgrid-green">{team.name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Conversion + social */}
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              type="button"
              size="lg"
              className="group h-14 w-full px-8 text-base sm:w-auto"
              onClick={() => navigate("/shop")}
            >
              Shop the collection
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-14 w-full px-8 text-base sm:w-auto"
              onClick={() => navigate("/custom")}
            >
              Start a team order
            </Button>
          </div>

          <div className="mt-10 flex flex-col items-center gap-4">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-offgrid-green/45">
              Follow the movement
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`OffGrid Lifestyle on ${social.label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-offgrid-green/20 text-offgrid-green transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
