/**
 * Public copy for manmohan.work.
 *
 * Numbers that may appear: Seven years; Blinkit 450 stores; Badho 20 lakh
 * retailers, 11 states, 1M+ installs; 10+ production agent workflows;
 * hybrid search from 9% to 28% of DAU in under 100ms with zero LLM calls.
 * Dates may appear. No other figure from the résumé or the handover.
 */

export const person = {
  name: "Manmohan Singh Charan",
  sentence:
    "I build products where a model has to face a real price, a real catalogue, and a person who will not wait.",
  bio: "Lead PM at GobbleCube, two-time co-founder of Badho and Tago Care, IIT Roorkee.",
  years: "Seven years across pricing and marketplaces.",
  email: "manmohanbuildsproducts@gmail.com",
  x: "https://x.com/ManmohanBuilds",
  xLabel: "X @ManmohanBuilds",
  github: "https://github.com/ManmohanBuildsProducts",
  githubLabel: "GitHub ManmohanBuildsProducts",
  linkedin: "https://www.linkedin.com/in/maciitr",
  linkedinLabel: "LinkedIn",
};

export const hero = {
  kicker: "Lead PM, GobbleCube",
  line: "I am a product manager with seven years across pricing, marketplaces, and 0-to-1 builds, and two companies I co-founded. I use AI agents every day for drafting, review, and automation.",
};

export const creed = [
  "Determinism first.",
  "Nothing slow on the request.",
  "The LLM is the smallest box on the canvas.",
  "A wrong output costs someone money.",
  "Kill your own work when the data says so.",
  "Read your own SQL.",
  "A model belongs where a person is slow.",
  "A prototype is not a product.",
];

export type Role = {
  slug: string;
  company: string;
  mark: string;
  accent: string;
  title: string;
  dates: string;
  outcome: string;
  bullets: string[];
  description: string;
  problem: string[];
  bet: string[];
  happened: string[];
  learned: string[];
};

export const roles: Role[] = [
  {
    slug: "gobblecube",
    company: "GobbleCube",
    mark: "G",
    accent: "#3d4eb5",
    title: "Lead PM, Pricing & Promo",
    dates: "May 2026 – Present",
    outcome: "AI-first pricing and promo, on elasticities. Still being built.",
    bullets: [
      "A planning engine on historical price sensitivities and elasticities. The product is the decision, not a black-box number.",
      "I build the optimizer and the allocator myself, with AI coding tools. The charter is AI-first.",
      "A wrong output costs a customer money. Reliability, backtesting, and bad inputs are the job.",
    ],
    description:
      "Lead PM at GobbleCube from May 2026, on AI-first pricing and promo. Still being built. No results published.",
    problem: [
      "Price and promotions are where a brand’s money moves. A history of what was charged, and an estimate of how demand moved, often already exist. What does not exist is a planning decision a person can stand behind.",
      "An optimizer that returns a number with no path to it is a black box. A wrong number costs the customer money.",
    ],
    bet: [
      "Build the planning engine AI-first, and do not treat the estimate as the product. The product is the decision: what to charge, what to give, and what to refuse when the input is bad.",
    ],
    happened: [
      "I joined in May 2026 as Lead PM for pricing and promo. The work is a planning engine built on historical price sensitivities and elasticities. I run the charter AI-first, and I build the optimizer and the allocator myself, with AI coding tools.",
      "The job, as I am doing it, is reliability. Backtesting, so a plan can be checked against what already happened. Behaviour on a bad input, so the system fails in a way a person can see. I have no outcome I am willing to publish.",
    ],
    learned: [
      "Not as a result. The constraint is already the design. A model does not get to move a price or a promotion unless the path is visible, and unless a bad input is a case the product handles on purpose.",
    ],
  },
  {
    slug: "badho",
    company: "Badho",
    mark: "B",
    accent: "#9a3d32",
    title: "Co-founder and Head of Product",
    dates: "2022 – Apr 2026",
    outcome:
      "Could have been a digital channel for general trade. 20 lakh retailers, 11 states, 1M+ installs.",
    bullets: [
      "Escrow from zero: cash on delivery, full advance, partial advance, and seller credit, with risk scoring and trust-tiered limits.",
      "Replaced commission with a subscription when it did not work for distributors. Contracted on purpose to fix unit economics, then rebuilt around delivery as a service.",
      "Search for Hindi and Hinglish. 9% to 28% of DAU, in under 100ms, with zero LLM calls. 10+ production agent workflows beside it, determinism first.",
      "Killed my own onboarding when people were not coming back, and replaced it with a concierge. Experiments shipped without an engineer in the loop.",
    ],
    description:
      "Co-founder and Head of Product at Badho, 2022 to April 2026. A digital channel for general trade. 20 lakh retailers, 11 states, 1M+ installs.",
    problem: [
      "General trade is how most of India still buys. The kirana, the distributor, the brand’s salesman. Modern retail had software. The counter had a phone, a notebook, and credit that lived in someone’s head.",
      "Distributors and retailers were not short of demand. They were short of a rail that respected how the trade already worked: trust, credit, and a delivery van.",
    ],
    bet: [
      "This could be a digital channel for general trade. Not a listing. A way for a small retailer and a seller to transact. The people it would touch were shop owners, and the brands and sellers trying to reach them.",
      "I co-founded Badho and ran product, design, and growth. The product organisation started from zero. Later, once the manual work was the bottleneck, I built an automation group around it.",
    ],
    happened: [
      "We reached 20 lakh retailers across 11 states, with 1M+ installs. The scale is not the story by itself. The story is the sequence of decisions, including a series of pivots and a deliberate contraction. It was not a straight scale-up.",
      "Payments had to exist before anything else could. I built escrow from zero. A retailer could pay cash on delivery, in full up front, in part up front, or on seller credit. Risk scoring and trust-tiered limits decided how much credit a shop could carry. The two sides did not share a balance sheet, so the payment had to hold the trust.",
      "Commission did not work for distributors. It took their economics. I killed it and replaced it with a subscription.",
      "A straight marketplace was the wrong shape. Time in the field, and my own SQL, showed it. I contracted the business on purpose to fix the unit economics, then rebuilt around delivery as a service.",
      "Checkout was broken. I found a severe drop-off by reading the SQL myself and redesigned it inline, in the flow, instead of sending a person off to a separate step.",
      "Onboarding was mine, and it was wrong. The data showed people were not coming back. I killed that work and replaced it with a concierge.",
      "I built the experiment machinery at the same time: config IDs, feature flags, and conditional rendering, so a test could ship without an engineer in the loop.",
      "Search had to work for a shopkeeper typing Hindi or Hinglish on a phone. I rebuilt it with FAISS, local embeddings, and a phonetic fallback. No model sat on the request. Hybrid search went from 9% to 28% of DAU, in under 100ms, with zero LLM calls.",
      "Catalogue work was the other half, and there a model did earn a place. A matcher narrowed by brand, scored candidates with trigram and phonetic similarity, and let a small model make the final call. Fragmented filters were pulled into canonical keys. Variants were clustered. 10+ production agent workflows took the repetitive catalogue and ops work. Call review had been a sample. I replaced that with a pass over the raw audio, so the review was of the calls themselves.",
      "Under it sat a self-hosted n8n layer, in production. Deterministic steps first. A model only where the rules ran out. A person when confidence was low. One pipeline estimated weight and wrote it to Postgres, so an open purchase order picked up the change while it was still open. Another made branded promo videos.",
      "The line I still use: the LLM is the smallest box on the canvas. Put determinism first, make every fallback explicit, and keep a human path for low confidence.",
      "It could have become that channel for general trade. I still think the aim was right.",
    ],
    learned: [
      "A marketplace is a claim about who gets paid. If the only way you make money is by taking the distributor’s margin, the trade will route around you.",
      "Scale is a bad narrator. The contraction taught me more than the installs. Read your own SQL. Be willing to kill work you have already shipped, including onboarding with your name on it.",
      "A model belongs where a person is slow, and off the path where a person is waiting.",
    ],
  },
  {
    slug: "tago-care",
    company: "Tago Care",
    mark: "T",
    accent: "#2f6f8f",
    title: "CPO and co-founder",
    dates: "Jun 2021 – Mar 2022",
    outcome: "Building care for families.",
    bullets: [
      "A digital health locker on India’s ABHA infrastructure, so a family could hold its own record.",
      "A practice tool for doctors, so a clinic left a record instead of a slip.",
      "The company closed.",
    ],
    description: "Co-founder and CPO at Tago Care, June 2021 to March 2022. A health locker for families, and a tool for doctors.",
    problem: [
      "A family’s medical papers sit in a plastic folder, a WhatsApp thread, and the memory of whoever last went to the doctor. The clinic often runs on a register. Nobody holds the whole record.",
    ],
    bet: [
      "ABHA, the national health account, was a rail we could build on. A locker the family holds. A small tool so a doctor’s practice leaves a record instead of a slip. Care for families, not a hospital dashboard.",
    ],
    happened: [
      "I co-founded Tago Care and ran product from June 2021 to March 2022. We built the locker on India’s ABHA infrastructure, and a practice-digitization tool for doctors. The company closed.",
    ],
    learned: [
      "A health product is used on a bad day, by someone in a hurry. Matching a government schema is not the same thing as being useful in that moment.",
    ],
  },
  {
    slug: "bijak",
    company: "Bijak",
    mark: "B",
    accent: "#2f7d4a",
    title: "Product Consultant",
    dates: "Mar – Apr 2021",
    outcome: "Digitising mandi trade.",
    bullets: [
      "Launched a new product line for an agri-trade platform, from the idea through to launch.",
      "Outside teams built it with me. My job was to make the thing specific enough to be used.",
      "The point was buyer data a lender could read, not a nicer catalogue.",
    ],
    description: "Product consultant at Bijak, March to April 2021. A new product line for agri-trade, aimed at credit underwriting.",
    problem: [
      "A mandi clears on a shout, a sample, and a relationship. What a buyer took, what they paid, and whether they came back rarely exists in a form a lender can use. The trade is real. The record is not.",
    ],
    bet: [
      "Put a product inside the trade, so the record is captured while someone is actually buying. The goal was credit underwriting. A nicer catalogue would have been the wrong goal.",
    ],
    happened: [
      "I joined as a product consultant and launched a new product line for the agri-trade platform, from the idea through to launch. Outside teams built it with me. The work was to make it specific enough that a buyer would use it, and plain enough that the data was usable afterwards.",
    ],
    learned: [
      "You do not digitise a mandi by replacing it. You digitise the memory the yard was already losing. The rest has to feel like the trade, or it will not be touched.",
    ],
  },
  {
    slug: "blinkit",
    company: "Blinkit",
    mark: "B",
    accent: "#c48a1a",
    title: "Early PM, Offline Vertical",
    dates: "Jun 2019 – Oct 2020",
    outcome: "Built the operating systems that let a 450-store partner network run.",
    bullets: [
      "Built the operating systems that let a 450-store partner network run.",
      "Store onboarding as software, a B2C pricing engine, and reordering off the point of sale.",
      "The job was the system, not a person opening each store by hand.",
    ],
    description:
      "Early PM on Blinkit’s offline vertical, June 2019 to October 2020. Operating systems for a partner-store network of 450 stores.",
    problem: [
      "Partner stores were how the offline business reached a neighbourhood. Opening a store, pricing what the customer paid, and restocking it were done by hand. That does not survive once the network is real.",
    ],
    bet: [
      "Onboarding, the consumer price, and the reorder are the product. Build them as systems and the network can run without a person for every store.",
    ],
    happened: [
      "I was an early PM on the offline vertical, from June 2019 to October 2020, before the Zomato acquisition. I built the operating systems that let a 450-store partner network run.",
      "I built store onboarding as software, a B2C pricing engine for what the customer paid, and reordering driven by the point of sale. The idea under the vertical was controlled inventory and fulfilment from the neighbourhood. Blinkit’s later quick-commerce turn came out of that idea.",
    ],
    learned: [
      "If a clever person has to touch an operation every time, you have not built it. I still look for that step first.",
    ],
  },
];

export const quote = {
  text: "The LLM is the smallest box on the canvas. Put determinism first, make every fallback explicit, and keep a human path for low confidence.",
};

export const patterns = [
  {
    title: "Determinism first",
    body: "Rules run the path. A model is called only where the rules run out, and low confidence goes to a person. At Badho that was a self-hosted n8n layer in production: weight written through to an open purchase order, branded promo videos, catalogue matching with every fallback named.",
  },
  {
    title: "Nothing slow on the request",
    body: "A shopkeeper will not wait for a model to fix a typo. Hybrid search at Badho went from 9% to 28% of DAU, in under 100ms, with zero LLM calls. The model worked off to the side, where a second does not matter.",
  },
  {
    title: "Local first, then escalate",
    body: "A Mac Mini at home runs local models. The default is a fast mixture-of-experts model on the machine. If a check fails, the work moves to a larger model or to the cloud. Grok Bot, Cursor, and Claude are the tools on the desk.",
  },
];

export const frontier =
  "The work I want next pushes the frontier. A lab, an AI or data lab, or a company that puts models into a real profession, the way Harvey and Legora do.";

export type Project = {
  name: string;
  meta: string;
  line: string;
  body: string;
  href?: string;
};

export const projects: Project[] = [
  {
    name: "Part Index",
    meta: "whileyousleep.xyz",
    href: "https://whileyousleep.xyz",
    line: "Search for Indian auto parts. A prototype.",
    body: "Search for Indian auto parts. A prototype.",
  },
  {
    name: "Gupshup MCP",
    meta: "Open source",
    href: "https://github.com/ManmohanBuildsProducts/gupshup-mcp",
    line: "WhatsApp and SMS for an agent. A prototype.",
    body: "WhatsApp and SMS for an agent. A prototype.",
  },
  {
    name: "Home lab",
    meta: "Mac Mini",
    line: "Local models on a Mac Mini. A workshop, not a product.",
    body: "Local models on a Mac Mini. A workshop, not a product.",
  },
];

export const thesis = {
  lede: "A few questions I am willing to work on. They are not products, and I do not start one because the topic is circulating.",
  items: [
    {
      title: "Trust",
      body: "What an AI answer is allowed to claim, and how a person can tell.",
    },
    {
      title: "Connectors",
      body: "The gap where an agent still cannot reach the trade, especially commerce in India.",
    },
    {
      title: "Evidence",
      body: "A record of an agent’s action, so a later person can see why it happened.",
    },
    {
      title: "Attribution",
      body: "When an agent sends the order, the merchant still has to know it counted.",
    },
    {
      title: "Handshake",
      body: "Agent to agent: identity, authorization, and evidence, or it is not a transaction.",
    },
  ],
};
