export interface TestimonialEntry {
  id: string;
  quote: string;
  author: string;
  handle: string;
  location: string;
  tag: string;
  outcome: string;
}

export const testimonialEntries: TestimonialEntry[] = [
  {
    id: "tm-carlos-pickle",
    quote:
      "The custom team kit looked premium and held up in weekend matches. Breathability and fit were exactly what we asked for.",
    author: "Carlos Tolentino",
    handle: "@carlos.plays",
    location: "Quezon City",
    tag: "Pickleball",
    outcome: "Team reorder after first batch",
  },
  {
    id: "tm-camille-fairway",
    quote:
      "The Fairway Tee is lightweight but still feels substantial. It worked for both course play and casual wear after game day.",
    author: "Camille Reyes",
    handle: "@cam.onthefairway",
    location: "BGC, Taguig",
    tag: "Golf",
    outcome: "Higher event-day sell-through",
  },
  {
    id: "tm-enzo-lifestyle",
    quote:
      "OG Pilipinas pieces gave us a clean athletic look without feeling generic. The design process was simple and fast.",
    author: "Enzo Dela Cruz",
    handle: "@enzo.dc",
    location: "Makati",
    tag: "Lifestyle",
    outcome: "Repeat custom inquiry in 2 weeks",
  },
  {
    id: "tm-jeri-running",
    quote:
      "From template download to order submission, the flow was straightforward. No confusion, and sizing recommendations were accurate.",
    author: "Jeri Lim",
    handle: "@jeri.runs",
    location: "Pasig",
    tag: "Running",
    outcome: "Zero size-exchange issues",
  },
  {
    id: "tm-maya-bulk",
    quote:
      "As a team manager, I liked that statuses were transparent and delivery expectations were clear. It felt reliable from day one.",
    author: "Maya Santos",
    handle: "@maya.teamops",
    location: "Cebu",
    tag: "Team Orders",
    outcome: "Scaled from 30 to 90 pcs",
  },
  {
    id: "tm-paolo-events",
    quote:
      "The product quality and brand storytelling helped us present better at events. Customers noticed the premium vibe immediately.",
    author: "Paolo Navarro",
    handle: "@paolo.events",
    location: "Davao",
    tag: "Events",
    outcome: "Stronger booth conversion",
  },
];
