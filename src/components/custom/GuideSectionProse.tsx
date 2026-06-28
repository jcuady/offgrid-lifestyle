import { useMemo } from "react";

type Segment = { type: "p"; text: string } | { type: "ol"; items: string[] };

/** Split admin body text into paragraphs vs numbered steps (`1) …` or `1. …`). */
function segmentGuideBody(body: string): Segment[] {
  const rawLines = body
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const segments: Segment[] = [];
  let listBuf: string[] = [];
  let paraBuf: string[] = [];

  const flushList = () => {
    if (listBuf.length) {
      segments.push({ type: "ol", items: [...listBuf] });
      listBuf = [];
    }
  };
  const flushPara = () => {
    if (paraBuf.length) {
      segments.push({ type: "p", text: paraBuf.join(" ") });
      paraBuf = [];
    }
  };

  for (const line of rawLines) {
    const m = line.match(/^(\d+)[).]\s+(.*)$/);
    if (m) {
      flushPara();
      listBuf.push(m[2].trim());
    } else {
      flushList();
      paraBuf.push(line);
    }
  }
  flushList();
  flushPara();
  return segments;
}

export function GuideSectionProse({ body }: { body: string }) {
  const segments = useMemo(() => segmentGuideBody(body), [body]);

  if (segments.length === 0) {
    return (
      <p className="font-sans text-sm italic leading-relaxed text-offgrid-green/50">
        Full guide copy will appear here once it is published.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {segments.map((seg, i) =>
        seg.type === "p" ? (
          <p
            key={`p-${i}`}
            className="max-w-3xl font-sans text-[15px] leading-[1.65] text-offgrid-green/85 md:text-base"
          >
            {seg.text}
          </p>
        ) : (
          <ol key={`ol-${i}`} className="max-w-3xl list-none space-y-3 p-0">
            {seg.items.map((item, j) => (
              <li
                key={j}
                className="group relative flex items-stretch gap-4 overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white p-4 transition-colors hover:border-offgrid-lime/40 sm:gap-5 sm:p-5"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 w-1 bg-offgrid-green/10 transition-colors group-hover:bg-offgrid-lime"
                />
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl bg-offgrid-green font-display text-sm font-black tabular-nums text-offgrid-cream transition-colors group-hover:bg-offgrid-lime sm:h-11 sm:w-11"
                  aria-hidden
                >
                  {String(j + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1 self-center">
                  <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-offgrid-green/40">
                    Step {String(j + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-0.5 font-sans text-[15px] leading-[1.6] text-offgrid-green/85 md:text-base">
                    {item}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
