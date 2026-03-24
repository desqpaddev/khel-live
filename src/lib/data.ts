export interface SportEvent {
  id: string;
  title: string;
  sport: string;
  category: string;
  city: string;
  venue: string;
  date: string;
  time: string;
  ageGroups: string[];
  price: number;
  spotsLeft: number;
  totalSpots: number;
  image: string;
  description: string;
  featured?: boolean;
}

export interface SportCategory {
  id: string;
  name: string;
  icon: string;
  eventCount: number;
}

export const sportCategories: SportCategory[] = [
  { id: "track", name: "Track Events", icon: "🏃", eventCount: 12 },
  { id: "field-jump", name: "Field – Jumping", icon: "🦘", eventCount: 8 },
  { id: "field-throw", name: "Field – Throwing", icon: "🥏", eventCount: 6 },
  { id: "swimming", name: "Swimming", icon: "🏊", eventCount: 10 },
  { id: "cycling", name: "Cycling", icon: "🚴", eventCount: 5 },
  { id: "race-walking", name: "Race Walking", icon: "🚶", eventCount: 3 },
];

export const cities = ["Kochi", "Trivandrum", "Kozhikode"];
export const ageGroups = ["U10", "U12", "U14", "U16", "U18"];

export const events: SportEvent[] = [
  {
    id: "1",
    title: "100m Sprint Championship",
    sport: "Track Events",
    category: "track",
    city: "Kochi",
    venue: "Jawaharlal Nehru Stadium",
    date: "Sep 5, 2026",
    time: "9:00 AM",
    ageGroups: ["U12", "U14", "U16", "U18"],
    price: 500,
    spotsLeft: 45,
    totalSpots: 120,
    image: "",
    description: "Experience the thrill of the 100m dash at Kerala's premier athletics venue. Open to all age groups U12 and above. RFID timed, photo finish enabled.",
    featured: true,
  },
  {
    id: "2",
    title: "200m & 400m Sprint Series",
    sport: "Track Events",
    category: "track",
    city: "Trivandrum",
    venue: "University Stadium",
    date: "Sep 12, 2026",
    time: "8:30 AM",
    ageGroups: ["U12", "U14", "U16", "U18"],
    price: 600,
    spotsLeft: 78,
    totalSpots: 150,
    image: "",
    description: "Multi-distance sprint series covering 200m and 400m events. Professional timing with instant results on the KHELIUM app.",
    featured: true,
  },
  {
    id: "3",
    title: "Long Jump & High Jump Meet",
    sport: "Field – Jumping",
    category: "field-jump",
    city: "Kozhikode",
    venue: "EMS Stadium",
    date: "Sep 19, 2026",
    time: "10:00 AM",
    ageGroups: ["U10", "U12", "U14", "U16"],
    price: 450,
    spotsLeft: 32,
    totalSpots: 80,
    image: "",
    description: "Jump into greatness! Long jump and high jump events with professional measurement and video recording for all participants.",
    featured: true,
  },
  {
    id: "4",
    title: "Freestyle Swimming Championship",
    sport: "Swimming",
    category: "swimming",
    city: "Kochi",
    venue: "Rajiv Gandhi Indoor Stadium Pool",
    date: "Sep 6, 2026",
    time: "7:00 AM",
    ageGroups: ["U10", "U12", "U14", "U16", "U18"],
    price: 700,
    spotsLeft: 20,
    totalSpots: 60,
    image: "",
    description: "Dive into competition! Freestyle swimming events from 25m to 1500m across all age categories. Electronic touch-pad timing.",
    featured: true,
  },
  {
    id: "5",
    title: "Shot Put & Discus Open",
    sport: "Field – Throwing",
    category: "field-throw",
    city: "Trivandrum",
    venue: "University Stadium",
    date: "Sep 13, 2026",
    time: "9:30 AM",
    ageGroups: ["U14", "U16", "U18"],
    price: 400,
    spotsLeft: 55,
    totalSpots: 80,
    image: "",
    description: "Age-appropriate throwing events with scaled equipment. Professional distance measurement and coaching tips post-event.",
  },
  {
    id: "6",
    title: "5km Cycling Road Race",
    sport: "Cycling",
    category: "cycling",
    city: "Kozhikode",
    venue: "Beach Road Circuit",
    date: "Sep 20, 2026",
    time: "6:30 AM",
    ageGroups: ["U14", "U16", "U18"],
    price: 550,
    spotsLeft: 40,
    totalSpots: 60,
    image: "",
    description: "Scenic coastal cycling race with full road safety measures. Helmets mandatory. RFID chip timing at checkpoints.",
  },
  {
    id: "7",
    title: "800m Race Walking",
    sport: "Race Walking",
    category: "race-walking",
    city: "Kochi",
    venue: "Jawaharlal Nehru Stadium",
    date: "Sep 5, 2026",
    time: "11:00 AM",
    ageGroups: ["U12", "U14"],
    price: 350,
    spotsLeft: 60,
    totalSpots: 80,
    image: "",
    description: "Introduction to competitive race walking. Judges ensure proper form. Great entry point for young athletes.",
  },
  {
    id: "8",
    title: "Medley Swimming Challenge",
    sport: "Swimming",
    category: "swimming",
    city: "Trivandrum",
    venue: "Trivandrum Aquatic Complex",
    date: "Sep 14, 2026",
    time: "7:30 AM",
    ageGroups: ["U14", "U16", "U18"],
    price: 750,
    spotsLeft: 15,
    totalSpots: 40,
    image: "",
    description: "Individual medley across all four strokes. Advanced swimmers only. Electronic timing with split-second accuracy.",
  },
];
