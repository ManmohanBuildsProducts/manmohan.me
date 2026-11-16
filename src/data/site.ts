/**
 * Public copy for manmohan.work.
 *
 * Numbers that may appear: Seven years; Blinkit 450 stores; Badho 20 lakh
 * retailers, 11 states, 1M+ installs; 10+ production agent workflows;
 * hybrid search from 9% to 28% of DAU in under 100ms with zero LLM calls.
 * Do not add résumé metrics that are not in that list.
 * Do not name assistants, and do not invent a title or a date.
 */

export type Span = { text: string; href?: string };

export const person = {
  name: "Manmohan Singh Charan",
  sentence:
    "I build products where a model has to face a real price, a real catalogue, and a person who will not wait.",
  credentials:
    "Lead PM at GobbleCube. Seven years. Two-time co-founder, Badho and Tago Care. IIT Roorkee.",
  email: "manmohanbuildsproducts@gmail.com",
  x: "https://x.com/ManmohanBuilds",
  xLabel: "X @ManmohanBuilds",
  github: "https://github.com/ManmohanBuildsProducts",
  githubLabel: "GitHub ManmohanBuildsProducts",
  linkedin: "https://www.linkedin.com/in/maciitr",
  linkedinLabel: "LinkedIn",
};

export const now: Span[][] = [
  [
    {
      text: "I lead product at GobbleCube, on AI-first pricing and promo. It is still being built. I will not publish a result until I have one.",
    },
  ],
  [
    {
      text: "I build with AI every day. Grok Bot, Cursor, and Claude are how the work gets done. A small team of AI assistants reads, drafts, and keeps projects moving. A Mac Mini at home runs local models.",
    },
  ],
  [
    { text: "whileyousleep.xyz", href: "https://whileyousleep.xyz" },
    { text: " is a one-person studio. " },
    {
      text: "Part Index",
      href: "https://github.com/ManmohanBuildsProducts/auto-parts-search",
    },
    { text: " is search for Indian auto parts. The " },
    {
      text: "Gupshup MCP server",
      href: "https://github.com/ManmohanBuildsProducts/gupshup-mcp",
    },
    { text: " lets an agent send WhatsApp and SMS." },
  ],
  [
    {
      text: "I want roles that push the frontier. A lab. An AI or data lab. Or a company that deploys models into a real profession, the way Harvey and Legora do.",
    },
  ],
];

export type Role = {
  slug: string;
  company: string;
  title: string;
  dates: string;
  /** Homepage sentence. One line, and the one public figure for this role when one exists. */
  line: string;
  description: string;
  problem: string[];
  bet: string[];
  happened: string[];
  learned: string[];
};

export const roles: Role[] = [
  {
    slug: "blinkit",
    company: "Blinkit",
    title: "Early PM, Offline Vertical",
    dates: "Jun 2019 – Oct 2020",
    line: "Learning ops at real scale. 450 stores.",
    description:
      "Early PM on Blinkit’s offline vertical, before Zomato. Learning ops at real scale. 450 stores.",
    problem: [
      "Partner stores were how Blinkit reached a neighbourhood. Each one was opened, priced, and restocked by hand. That is fine while the network is small. It breaks once the network is a real operation.",
    ],
    bet: [
      "Onboarding, the price a customer sees, and the reorder back to the warehouse are the product. Build them as systems and the network can grow without adding a person for every store.",
    ],
    happened: [
      "I was an early PM on the offline vertical, before the Zomato acquisition. The partner network reached 450 stores.",
      "I built store onboarding as software, a pricing engine for what the customer paid, and automatic reordering from the store’s own sales. The idea under that vertical was controlled inventory and fulfilment from the neighbourhood. Blinkit’s quick-commerce turn came out of it.",
    ],
    learned: [
      "If a clever person has to touch an operation every time, you have not built it. I still look for that step first.",
    ],
  },
  {
    slug: "bijak",
    company: "Bijak",
    title: "Product Consultant",
    dates: "Mar – Apr 2021",
    line: "Digitising mandi trade.",
    description: "Product consultant at Bijak. Digitising mandi trade.",
    problem: [
      "A mandi clears on a shout, a sample, and a relationship. What a buyer took, what they paid, and whether they came back rarely exists in a form a lender can use. The trade is real. The record is not.",
    ],
    bet: [
      "Put a product inside the trade, so the record is captured while someone is actually buying. The point was credit underwriting. A nicer catalogue would have been the wrong goal.",
    ],
    happened: [
      "I joined as a product consultant and took a new product line from the idea to launch. Outside teams built it with me. The work was to make it specific enough that a buyer would use it, and plain enough that the data was usable afterwards.",
    ],
    learned: [
      "You do not digitise a mandi by replacing it. You digitise the memory the yard was already losing. The rest has to feel like the trade, or it will not be touched.",
    ],
  },
  {
    slug: "tago-care",
    company: "Tago Care",
    title: "CPO and co-founder",
    dates: "Jun 2021 – Mar 2022",
    line: "Building care for families.",
    description: "Co-founder and CPO at Tago Care. Building care for families.",
    problem: [
      "A family’s medical papers sit in a plastic folder, a WhatsApp thread, and the memory of whoever last went to the doctor. The clinic often runs on a register. Nobody holds the whole record.",
    ],
    bet: [
      "ABHA, the national health account, was a rail we could build on. A locker the family holds. A small tool so a doctor’s practice leaves a record instead of a slip.",
    ],
    happened: [
      "I co-founded Tago Care and ran product. We built the locker on India’s ABHA infrastructure, and a practice tool for doctors. The company closed.",
    ],
    learned: [
      "A health product is used on a bad day, by someone in a hurry. Matching a government schema is not the same thing as being useful in that moment. I would build for that day first.",
    ],
  },
  {
    slug: "badho",
    company: "Badho",
    title: "Co-founder and Head of Product",
    dates: "2022–2026",
    line: "Could have been a digital channel for general trade. 20 lakh retailers, 11 states, 1M+ installs.",
    description:
      "Co-founder and Head of Product at Badho. A digital channel for general trade. 20 lakh retailers, 11 states, 1M+ installs.",
    problem: [
      "General trade is how most of India still buys. The kirana, the distributor, the brand’s salesman. Modern retail had software. The shop on the corner had a phone, a notebook, and credit that lived in someone’s head.",
    ],
    bet: [
      "This could be a digital channel for general trade. Not a listing. A way for a small retailer and a seller to transact, with the trust the trade actually runs on. The people it would touch were shop owners, and the brands and sellers trying to reach them.",
    ],
    happened: [
      "I co-founded Badho and ran product. It is the grandest stretch of these seven years. We reached 20 lakh retailers across 11 states, with 1M+ installs.",
      "A straight marketplace was the wrong shape. I spent time in the field and read the SQL myself. Commission became a subscription. Payments had to hold trust between people who do not share a balance sheet. When the marketplace thesis broke, I rebuilt around delivery.",
      "Search had to work for a shopkeeper typing Hindi or Hinglish on a phone. Hybrid search went from 9% to 28% of DAU, in under 100ms, with zero LLM calls. 10+ production agent workflows did the catalogue and ops work that used to sit with a person.",
      "It could have become that channel. I still think the aim was the right one.",
    ],
    learned: [
      "A marketplace is a claim about who gets paid. If you only make money by taking the distributor’s margin, the trade will route around you.",
      "The other lesson is where a model belongs. Use it where a person is slow: matching, cleaning, the work after midnight. Do not put one between a shopkeeper and a word he already knows.",
    ],
  },
  {
    slug: "gobblecube",
    company: "GobbleCube",
    title: "Lead PM",
    dates: "Now",
    line: "AI-first pricing and promo. Still being built.",
    description:
      "Lead PM at GobbleCube, on AI-first pricing and promo. Still being built.",
    problem: [
      "Price and promotions are where a brand’s money actually moves. In a lot of companies that decision is still a sheet, a meeting, and last month’s numbers copied forward.",
    ],
    bet: [
      "Build it AI-first. The model in the work, not a dashboard someone opens after the decision is already made.",
    ],
    happened: [
      "This is the current job, and it is still being built. I lead product for pricing and promo at GobbleCube. I have no result I am willing to publish.",
    ],
    learned: [
      "Not yet. The work has not earned a lesson I would put my name on.",
    ],
  },
];

export function roleBySlug(slug: string) {
  return roles.find((role) => role.slug === slug);
}
