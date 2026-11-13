export type ProjectLink = {
  label: string;
  href: string;
};

export type Project = {
  title: string;
  kicker: string;
  body: string;
  links: ProjectLink[];
};

/**
 * Public facts only.
 * Gupshup and Part Index follow their READMEs.
 * The Mac mini card follows the 25–26 Sep 2026 posts on @ManmohanBuilds.
 * indian-contract-review is a private repo whose README is only the title.
 */
export const projects: Project[] = [
  {
    title: 'Gupshup MCP',
    kicker: 'Open source · MCP',
    body: 'An MCP server for the Gupshup Enterprise Gateway. An agent can check credentials, opt a number in on WhatsApp, send a template or a text message, and send SMS.',
    links: [
      { label: 'Source', href: 'https://github.com/ManmohanBuildsProducts/gupshup-mcp' },
    ],
  },
  {
    title: 'Part Index',
    kicker: 'whileyousleep.xyz · Search',
    body: 'Domain-specific search for Indian auto parts: Hindi and Hinglish, misspellings, symptom queries, and part numbers, over 26,835 SKUs. Hybrid retrieval combines BM25 with a fine-tuned embedding model. On the published dev set, part-number recall is 46.4% higher than that embedding model alone.',
    links: [
      { label: 'Source', href: 'https://github.com/ManmohanBuildsProducts/auto-parts-search' },
      { label: 'Model', href: 'https://huggingface.co/ManmohanBuildsProducts/auto-parts-search-v3' },
      { label: 'Studio', href: 'https://whileyousleep.xyz' },
    ],
  },
  {
    title: 'Mac mini local-model lab',
    kicker: 'Local lab · Qwen3.6-35B-A3B',
    body: 'A 32GB Mac mini (M6) running local models, including Qwen3.6-35B-A3B, with MLX and llama.cpp. On the public 25–26 Sep 2026 runs, that model decoded at 57.8 tok/s for chat and 49.0 tok/s on a long document.',
    links: [
      { label: 'Measurements', href: 'https://x.com/ManmohanBuilds/status/2104229552415449445' },
    ],
  },
  {
    title: 'Indian contract review',
    kicker: 'Not public yet',
    body: 'A project for reviewing Indian contracts. It is not public yet.',
    links: [],
  },
];
