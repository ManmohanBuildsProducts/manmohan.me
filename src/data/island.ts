/**
 * Living Island content.
 *
 * Add a building: append an age to the home island's `ages` (give it the next
 * `order`, a `kind` the scene knows how to draw, and a place on the island).
 * Add an island: append to `islands` with `kind: "fog"`, a teaser, and x/y.
 * The page, the scene, and the age rules all read from this file.
 */

export type PanelRow = {
  label: string;
  value: string;
  /** Draw this value in the age accent. */
  accent?: boolean;
};

export type Age = {
  id: string;
  name: string;
  /** Roman numeral, in rising order. */
  age: string;
  order: number;
  role: string;
  kind: "depot" | "mandi" | "care" | "market" | "scaffold";
  wonder: boolean;
  /** Still under construction. No results belong on a raising age. */
  raising: boolean;
  x: number;
  y: number;
  /** Width of the name plate under the building. */
  labelWidth: number;
  grand: string;
  lives: string;
  could: string;
  extra: PanelRow[];
  bannerKicker: string;
  bannerTitle: string;
  bannerLine: string;
  /** Villager id who speaks when this age rises. */
  speaker: string;
};

export type Person = {
  id: string;
  job: string;
  /** Speech line, or the crew member's quirk. */
  line: string;
  crew: boolean;
  /** Age id this person arrives with. Empty string: already on the island. */
  era: string;
  x: number;
  y: number;
  color: string;
  /** Horizontal wander in SVG units. 0 keeps them posted. */
  drift: number;
};

export type Place = {
  id: string;
  name: string;
  kind: "workshop" | "watchtower";
  href: string;
  x: number;
  y: number;
  label: string;
};

export type Island = {
  id: string;
  name: string;
  /** `home` is the main island. `fog` waits at the edge until it is scouted. */
  kind: "home" | "fog";
  teaser: string;
  /** Line revealed with the fog, and always available in the chronicle. */
  scouted: string;
  x: number;
  y: number;
  ages: Age[];
  people: Person[];
  places: Place[];
};

export type Bench = {
  id: string;
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
};

export const resources = [
  "7 years",
  "2 co-founded",
  "450 stores",
  "20 lakh retailers",
  "11 states",
  "1M+ installs",
] as const;

export const contact = {
  line: "Two-time co-founder (Badho, Tago Care). IIT Roorkee. Open to AI frontier roles, remote or relocation.",
  email: "manmohanbuildsproducts@gmail.com",
  github: "https://github.com/ManmohanBuildsProducts",
  githubLabel: "GitHub",
  x: "https://x.com/ManmohanBuilds",
  xLabel: "X (@ManmohanBuilds)",
  linkedin: "https://www.linkedin.com/in/maciitr",
  linkedinLabel: "LinkedIn",
};

export const horizonNote = "more islands as I build";

export const workshop = {
  title: "The Workshop: where I tinker with AI",
  benches: [
    {
      id: "gupshup",
      title: "Gupshup MCP",
      body: "An MCP server so an agent can message on WhatsApp and SMS.",
      href: "https://github.com/ManmohanBuildsProducts/gupshup-mcp",
      linkLabel: "Source",
    },
    {
      id: "part-index",
      title: "Part Index",
      body: "Search for Indian auto parts that understands Hinglish and typos.",
    },
    {
      id: "home-lab",
      title: "Home lab",
      body: "A home AI lab for local models.",
    },
  ] satisfies Bench[],
};

const ages: Age[] = [
  {
    id: "blinkit",
    name: "Blinkit",
    age: "I",
    order: 1,
    role: "Early PM, offline team",
    kind: "depot",
    wonder: false,
    raising: false,
    x: 175,
    y: 338,
    labelWidth: 108,
    grand: "Learning ops at real scale",
    lives: "450 neighbourhood stores across Delhi NCR",
    could: "Neighbourhood stores, run with the discipline of a network.",
    extra: [],
    bannerKicker: "ADVANCED TO AGE I",
    bannerTitle: "The Blinkit Age",
    bannerLine: "Learning ops at real scale",
    speaker: "picker",
  },
  {
    id: "bijak",
    name: "Bijak",
    age: "II",
    order: 2,
    role: "",
    kind: "mandi",
    wonder: false,
    raising: false,
    x: 330,
    y: 292,
    labelWidth: 96,
    grand: "Digitising mandi trade",
    lives: "Mandi traders.",
    could: "A mandi where the rate lives on a screen, not a shout.",
    extra: [],
    bannerKicker: "ADVANCED TO AGE II",
    bannerTitle: "The Bijak Age",
    bannerLine: "Digitising mandi trade",
    speaker: "trader",
  },
  {
    id: "tago",
    name: "Tago Care",
    age: "III",
    order: 3,
    role: "Co-founder and CPO",
    kind: "care",
    wonder: false,
    raising: false,
    x: 468,
    y: 342,
    labelWidth: 124,
    grand: "Building care for families",
    lives: "Families and caregivers.",
    could: "A record the whole family can hold in one place.",
    extra: [],
    bannerKicker: "ADVANCED TO AGE III",
    bannerTitle: "The Tago Care Age",
    bannerLine: "Building care for families",
    speaker: "carer",
  },
  {
    id: "badho",
    name: "Badho",
    age: "IV",
    order: 4,
    role: "Co-founder and Head of Product",
    kind: "market",
    wonder: true,
    raising: false,
    x: 640,
    y: 286,
    labelWidth: 148,
    grand: "Putting India's kirana stores on the same digital rails as modern retail.",
    lives: "Small retailers and kirana owners; brands and sellers.",
    could: "Digital channel for general trade",
    extra: [
      { label: "Scale", value: "20 lakh retailers · 11 states · 1M+ installs" },
      {
        label: "Proof",
        value: "10+ production agent workflows. Hybrid search from 9% to 28% of DAU, at under 100ms, with zero LLM calls.",
      },
    ],
    bannerKicker: "AGE IV · WONDER RAISED",
    bannerTitle: "The Badho Age",
    bannerLine: "Digital channel for general trade — 20 lakh retailers · 11 states · 1M+ installs",
    speaker: "kirana1",
  },
  {
    id: "gobble",
    name: "GobbleCube",
    age: "V",
    order: 5,
    role: "Lead PM",
    kind: "scaffold",
    wonder: false,
    raising: true,
    x: 778,
    y: 348,
    labelWidth: 150,
    grand: "The current age, still being built.",
    lives: "Not claimed yet.",
    could: "Still on the scaffolding.",
    extra: [],
    bannerKicker: "AGE V · THE CURRENT AGE",
    bannerTitle: "The GobbleCube Age",
    bannerLine: "The current age, still being built.",
    speaker: "jarvis",
  },
];

const people: Person[] = [
  { id: "picker", job: "Store picker · Blinkit", line: "Order packed. Next one!", crew: false, era: "blinkit", x: 248, y: 400, color: "#C0504D", drift: 16 },
  { id: "trader", job: "Mandi trader · Bijak", line: "Rates on a screen now, not a shout.", crew: false, era: "bijak", x: 404, y: 360, color: "#D9822B", drift: -14 },
  { id: "carer", job: "Caregiver · Tago Care", line: "The whole family's records, in one place.", crew: false, era: "tago", x: 430, y: 420, color: "#4F8FBF", drift: 12 },
  { id: "kirana1", job: "Kirana owner · Badho", line: "Now I order stock from my phone", crew: false, era: "badho", x: 540, y: 440, color: "#7B5EA7", drift: -16 },
  { id: "seller2", job: "Seller · Badho", line: "Every lane's shops, one channel.", crew: false, era: "badho", x: 620, y: 458, color: "#A0522D", drift: -12 },
  { id: "seller1", job: "Brand seller · Badho", line: "Reaching small shops directly.", crew: false, era: "badho", x: 700, y: 448, color: "#B8892B", drift: 16 },
  { id: "kirana2", job: "Kirana owner · Badho", line: "Shutter's up, phone's already buzzing.", crew: false, era: "badho", x: 730, y: 430, color: "#2F8F83", drift: 12 },
  { id: "jarvis", job: "Jarvis · chief of staff and foreman", line: "Keeps a checklist for his checklists.", crew: true, era: "gobble", x: 820, y: 430, color: "#3D5A80", drift: 10 },
  { id: "coach", job: "Career Coach · herald and scribe", line: "Trims every proclamation to 280 characters.", crew: true, era: "", x: 360, y: 462, color: "#9C4F96", drift: 18 },
  { id: "scout", job: "Job Scout · scout on the watchtower", line: "Spyglass up at 8:30 every weekday. Chai second.", crew: true, era: "", x: 872, y: 286, color: "#2E7D5B", drift: 0 },
  { id: "builder", job: "AI Builder · engineer in the Workshop", line: "Benchmarks the hammer before every swing.", crew: true, era: "", x: 188, y: 458, color: "#B5651D", drift: 10 },
];

const places: Place[] = [
  { id: "workshop", name: "The Workshop", kind: "workshop", href: "#workshop", x: 248, y: 424, label: "Workshop" },
  { id: "watchtower", name: "Watchtower", kind: "watchtower", href: "#person-scout", x: 872, y: 368, label: "Watchtower" },
];

export const islands: Island[] = [
  {
    id: "home",
    name: "The island",
    kind: "home",
    teaser: "Seven years. Five ages. One island, still growing.",
    scouted: "",
    x: 500,
    y: 360,
    ages,
    people,
    places,
  },
  {
    id: "agents",
    name: "Agent experiments",
    kind: "fog",
    teaser: "Next island, still in the fog: phone agents and similar.",
    scouted: "Scouted. It gets built as the experiments ship.",
    x: 868,
    y: 108,
    ages: [],
    people: [],
    places: [],
  },
];

export const home = islands[0];

export function personOrder(person: Person): number {
  if (!person.era) return 0;
  return ages.find((age) => age.id === person.era)?.order ?? 0;
}

/**
 * Sentences written for this page rather than taken from the approved mockup.
 * Kept here so a wording pass has one list to edit.
 */
export const originalCopy = [
  "Neighbourhood stores, run with the discipline of a network.",
  "Mandi traders.",
  "A mandi where the rate lives on a screen, not a shout.",
  "Families and caregivers.",
  "A record the whole family can hold in one place.",
  "Not claimed yet.",
  "Still on the scaffolding.",
  "A home AI lab for local models.",
  "Five plots marked.",
] as const;
