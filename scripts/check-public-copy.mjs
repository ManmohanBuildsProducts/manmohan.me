import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/", import.meta.url));

async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await files(path)));
    else if (/\.(html|xml|txt)$/.test(entry.name)) out.push(path);
  }
  return out;
}

const required = [
  "Manmohan Singh Charan",
  "Seven years",
  "450 stores",
  "Digitising mandi trade",
  "Building care for families",
  "20 lakh retailers",
  "11 states",
  "1M+ installs",
  "9% to 28% of DAU",
  "under 100ms",
  "zero LLM calls",
  "10+ production agent workflows",
  "Could have been a digital channel for general trade",
  "Still being built",
  "May 2026",
  "Apr 2026",
  "I did not grow that count",
  "elasticities",
  "backtesting",
  "escrow",
  "concierge",
  "determinism first",
  "n8n",
  "FAISS",
  "Part Index",
  "Gupshup",
  "Grok Bot",
  "Harvey",
  "Legora",
  "whileyousleep.xyz",
  "@ManmohanBuilds",
  "ManmohanBuildsProducts",
  "manmohanbuildsproducts@gmail.com",
  "IIT Roorkee",
];

const banned = [
  "Codex",
  "Claude Code",
  "OpenManus",
  "Karobar",
  "Norway",
  "tok/s",
  "tokens/s",
  "seventy-plus",
  "seventy plus",
  "Gemini",
  "employee #11",
  "50 Cr",
  "Rs 50",
  "2,297",
  "2297",
  "99.4",
  "60–70",
  "60-70",
  "420+",
  "420 stores",
  "7 days",
  "2 hours",
  "2hr",
  "20 min",
  "7060334569",
  "mcharan@",
  "3% → 20",
  "3% to 20",
  "3%->20",
  "145K",
  "145k",
  "2x search",
  "one month",
  "three external",
  "3 external",
  "four apps",
  "4 apps",
  "four pivots",
  "3.5",
  "five months",
  "same-day",
  "100% call",
  "three-person",
  "3-person",
  "Gurgaon",
  "Gurugram",
  "532",
  "Capital Float",
  "aircraft",
  "compensation",
  "91%",
  "72%",
  "500 users",
  "~500",
  "1.5 Cr",
  "Rs 1.5",
  "170K",
  "6,700",
  "QuidCash",
  "Castler",
  "Cashfree",
  "Cargill",
  "Pansari",
  "9 years",
  "nine years",
  "OpenManus",
];

const paths = await files(root);
if (!paths.length) {
  console.error("No built pages in dist/. Run npm run build first.");
  process.exit(1);
}

const corpus = (await Promise.all(paths.map((path) => readFile(path, "utf8")))).join("\n");
const missing = required.filter((phrase) => !corpus.includes(phrase));
const present = banned.filter((phrase) => corpus.includes(phrase));

if (missing.length || present.length) {
  if (missing.length) console.error("Missing public copy:\n- " + missing.join("\n- "));
  if (present.length) console.error("Banned copy present:\n- " + present.join("\n- "));
  process.exit(1);
}

console.log(`Public copy ok (${paths.length} files).`);
