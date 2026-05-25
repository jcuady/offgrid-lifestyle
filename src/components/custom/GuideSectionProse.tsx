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
          <ol key={`ol-${i}`} className="max-w-3xl list-none space-y-0 p-0">
            {seg.items.map((item, j) => (
              <li key={j} className="relative flex gap-4 pb-10 last:pb-0">
                <div className="flex w-10 shrink-0 flex-col items-center pt-0.5">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-offgrid-green/90 bg-white font-display text-sm font-bold tabular-nums text-offgrid-green shadow-sm"
                    aria-hidden
                  >
                    {j + 1}
                  </span>
                  {j < seg.items.length - 1 ? (
                    <span
                      className="mt-2 min-h-[2.5rem] w-px flex-1 bg-gradient-to-b from-offgrid-green/25 to-offgrid-green/5"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <p className="min-w-0 flex-1 pt-1 font-sans text-[15px] leading-[1.65] text-offgrid-green/85 md:text-base">
                  {item}
                </p>
              </li>
            ))}
          </ol>
        ),
      )}
    </div>
  );
}
