/** Detail cards. Every sentence here is from the approved brief. */

export type DossierSection = {
  title: string;
  body: string[];
};

export type Dossier = {
  id: string;
  title: string;
  aka?: string;
  role: string;
  dates: string;
  body: string[];
  sections?: DossierSection[];
  lives?: string;
  could?: string;
  grand: string;
  links?: { label: string; href: string }[];
};

export const dossiers: Dossier[] = [
  {
    id: "blinkit",
    title: "Blinkit",
    aka: "Grofers",
    role: "Early PM, offline vertical",
    dates: "Jun 2019 to Oct 2020",
    body: [
      "I was an early employee in the offline partner-store business as the network grew to 450 stores.",
      "I owned store onboarding, the B2C pricing engine and POS-driven reordering.",
      "I built the operating systems that let a retail network scale.",
    ],
    grand: "Learning ops at real scale.",
  },
  {
    id: "bijak",
    title: "Bijak",
    role: "Product Consultant",
    dates: "Mar to Apr 2021",
    body: [
      "I launched a new product line for an agri-trade platform in about a month, from idea to launch, managing three external teams.",
      "My goal was capturing buyer data for credit underwriting.",
    ],
    grand: "Digitising mandi trade.",
  },
  {
    id: "tago",
    title: "Tago Care",
    role: "CPO and Co-founder",
    dates: "Jun 2021 to Mar 2022",
    body: [
      "I built a digital health locker on India's ABHA infrastructure, plus a practice-digitization tool for doctors.",
    ],
    grand: "Building care for families.",
  },
  {
    id: "badho",
    title: "Badho",
    role: "Co-founder and Head of Product",
    dates: "2022 to Apr 2026",
    body: [
      "A B2B FMCG platform connecting distributors and kirana retailers across North India: 20 lakh retailers, 11 states, 1M+ installs, four apps.",
      "I built the product org from zero and later a three-person AI automation team.",
    ],
    sections: [
      {
        title: "Marketplace and payments",
        body: [
          "I built escrow payments from zero (COD, advance, partial advance, seller credit, with risk scoring and trust-tiered limits), and I rethought the revenue model when commission economics didn't work for distributors.",
        ],
      },
      {
        title: "Logistics",
        body: ["I built delivery-as-a-service after 200+ field interviews."],
      },
      {
        title: "Funnel decisions",
        body: [
          "I found a severe checkout drop-off with my own SQL and redesigned checkout inline.",
          "I killed five months of my own onboarding work when the data said so and replaced it with a concierge model.",
          "I built A/B testing infrastructure so experiments shipped without engineering.",
        ],
      },
      {
        title: "Production AI",
        body: [
          "I built 10+ production agent workflows.",
          "I rebuilt Hindi/Hinglish search with local embeddings and phonetic fallback, taking search from 9% to 28% of DAU in under 100ms with zero LLM calls.",
          "I built a catalogue product matcher, automated branded promo videos, and covered 100% of sales calls instead of sampling.",
          "Deterministic steps first, a model only where rules run out, a human for low confidence.",
        ],
      },
    ],
    lives: "Small retailers and kirana owners, brands and sellers.",
    could: "A digital channel for general trade.",
    grand: "",
  },
  {
    id: "gobble",
    title: "GobbleCube",
    role: "Lead PM, AI-first Pricing and Promo",
    dates: "May 2026 to present",
    body: [
      "I lead the promo optimization product, a planning engine built on price sensitivities and elasticities, and I turn those estimates into planning decisions people can trust instead of a black box.",
      "I run the charter AI-first and build optimizer tooling myself.",
    ],
    grand: "The current age, under construction.",
  },
  {
    id: "workshop",
    title: "The Workshop",
    role: "",
    dates: "",
    body: [],
    sections: [
      {
        title: "Part Index",
        body: ["Indian auto-parts search that understands Hinglish, typos and part numbers."],
      },
      {
        title: "Gupshup MCP",
        body: ["Gupshup MCP server, open source, so agents can message on WhatsApp and SMS."],
      },
      {
        title: "Home AI lab",
        body: ["A home AI lab for local models."],
      },
    ],
    grand: "",
    links: [
      { label: "Part Index source", href: "https://github.com/ManmohanBuildsProducts/auto-parts-search" },
      { label: "Gupshup MCP source", href: "https://github.com/ManmohanBuildsProducts/gupshup-mcp" },
    ],
  },
];
