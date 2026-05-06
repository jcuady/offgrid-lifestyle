export type EventCategory = "tournament" | "community" | "launch" | "workshop";
export type EventStatus = "upcoming" | "past";

export interface SiteEvent {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  location: string;
  address: string;
  description: string;
  image: string;
  category: EventCategory;
  status: EventStatus;
  featured?: boolean;
  price: string;
  capacity?: number;
  registered?: number;
  highlights: string[];
}

export const initialEvents: SiteEvent[] = [
  {
    id: "ev-1",
    title: "OffGrid Pickleball Open",
    subtitle: "Dink Different Championship Series",
    date: "15 Jun",
    time: "9:00 AM - 7:00 PM",
    location: "BGC Arena",
    address: "Taguig, Metro Manila",
    description:
      "A full-day competitive and community-focused pickleball event featuring beginner to advanced brackets, exhibition matches, and product activations from OffGrid Lifestyle.",
    image: "/images/event_barako.png",
    category: "tournament",
    status: "upcoming",
    featured: true,
    price: "₱1,200",
    capacity: 180,
    registered: 126,
    highlights: [
      "Beginner, intermediate, and advanced brackets",
      "Official OffGrid athlete exhibition matches",
      "Live customization booth and merch drop",
      "On-site coaching corners and skills clinic",
    ],
  },
  {
    id: "ev-2",
    title: "City Lights Night Rally",
    subtitle: "Community Play Under The Lights",
    date: "28 Jun",
    time: "6:00 PM - 10:00 PM",
    location: "Makati Sports Hub",
    address: "Makati, Metro Manila",
    description:
      "An open-play evening designed to connect players, teams, and creators in a relaxed but energetic atmosphere.",
    image:
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1800&auto=format&fit=crop",
    category: "community",
    status: "upcoming",
    price: "Free",
    capacity: 120,
    registered: 84,
    highlights: [
      "Open-play courts for all levels",
      "Community mixer and partner matching",
      "OffGrid giveaway and photo wall",
    ],
  },
  {
    id: "ev-3",
    title: "OG Pilipinas Capsule Launch",
    subtitle: "Culture, Craft, And Court",
    date: "09 Jul",
    time: "2:00 PM - 8:00 PM",
    location: "The Fifth At Rockwell",
    address: "Mandaluyong, Metro Manila",
    description:
      "Exclusive launch of the latest OG Pilipinas capsule featuring limited pieces, athlete appearances, and a behind-the-design showcase.",
    image:
      "https://images.unsplash.com/photo-1522199710521-72d69614c702?q=80&w=1800&auto=format&fit=crop",
    category: "launch",
    status: "upcoming",
    price: "Invite",
    highlights: [
      "First access to limited capsule pieces",
      "Design walkthrough from OffGrid creatives",
      "Athlete signing and fan sessions",
    ],
  },
  {
    id: "ev-4",
    title: "Performance Fabric Workshop",
    subtitle: "Fit, Material, And Movement",
    date: "20 May",
    time: "1:00 PM - 4:00 PM",
    location: "OffGrid Studio",
    address: "Quezon City, Metro Manila",
    description:
      "Hands-on workshop on selecting the right fabric, cut, and print combination for teams and clubs.",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1800&auto=format&fit=crop",
    category: "workshop",
    status: "past",
    price: "₱850",
    highlights: [
      "Material and durability demos",
      "Sizing and fit optimization session",
      "Printing method comparison",
    ],
  },
];
