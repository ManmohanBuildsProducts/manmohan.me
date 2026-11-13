/**
 * Illustrative replay for the homepage.
 * Queries and the expected part are from the public Part Index benchmark
 * (data/hf_benchmark_dataset/benchmark_dev.json).
 * Rank order is a sketch of the failure mode, not a recorded search log
 * and not a score. Do not add metrics here.
 */
export type SearchMode = 'keyword' | 'embedding' | 'hybrid';

export type SearchRow = {
  id: string;
  name: string;
  detail: string;
  expected?: boolean;
};

export type SearchQuery = {
  q: string;
  kind: string;
  rows: SearchRow[];
  order: Record<SearchMode, string[]>;
};

export const searchModes: SearchMode[] = ['keyword', 'embedding', 'hybrid'];

export const searchReplay: SearchQuery[] = [
  {
    q: 'brake ki patti',
    kind: 'Hinglish',
    rows: [
      { id: 'a', name: 'Door beading', detail: 'Literal match on patti' },
      { id: 'b', name: 'Side moulding', detail: 'Literal match on patti' },
      { id: 'c', name: 'Brake pad set', detail: 'Benchmark expects brake pad', expected: true },
      { id: 'd', name: 'Brake disc', detail: 'Nearby brake part' },
    ],
    order: {
      keyword: ['a', 'b', 'd', 'c'],
      embedding: ['d', 'c', 'a', 'b'],
      hybrid: ['c', 'd', 'a', 'b'],
    },
  },
  {
    q: 'clutch plet baleno',
    kind: 'Misspelling',
    rows: [
      { id: 'a', name: 'Number plate sticker', detail: 'Literal match on plate' },
      { id: 'b', name: 'Clutch cable', detail: 'Clutch token, wrong part' },
      { id: 'c', name: 'Clutch plate, Baleno', detail: 'Benchmark expects clutch plate', expected: true },
      { id: 'd', name: 'Pressure plate', detail: 'Nearby clutch part' },
    ],
    order: {
      keyword: ['a', 'b', 'd', 'c'],
      embedding: ['d', 'c', 'b', 'a'],
      hybrid: ['c', 'd', 'b', 'a'],
    },
  },
  {
    q: '09200-M51K10',
    kind: 'Part number',
    rows: [
      { id: 'a', name: 'Prefix-only listing', detail: 'Shares the digit string' },
      { id: 'b', name: 'Oil filter, Maruti', detail: 'Same catalog, wrong part' },
      { id: 'c', name: 'Brake pad, Maruti', detail: 'Benchmark expects brake pad', expected: true },
      { id: 'd', name: 'Gasket, Hyundai', detail: 'Unrelated neighbor' },
    ],
    order: {
      keyword: ['a', 'b', 'c', 'd'],
      embedding: ['d', 'b', 'a', 'c'],
      hybrid: ['c', 'a', 'b', 'd'],
    },
  },
  {
    q: 'engine garam ho raha hai',
    kind: 'Symptom',
    rows: [
      { id: 'a', name: 'Engine oil', detail: 'Literal match on engine' },
      { id: 'b', name: 'Engine cover', detail: 'Literal match on engine' },
      { id: 'c', name: 'Thermostat', detail: 'Benchmark expects this, plus radiator and coolant', expected: true },
      { id: 'd', name: 'Radiator', detail: 'Also in the expected set' },
    ],
    order: {
      keyword: ['a', 'b', 'd', 'c'],
      embedding: ['d', 'c', 'a', 'b'],
      hybrid: ['c', 'd', 'a', 'b'],
    },
  },
  {
    q: 'swift ki headlight',
    kind: 'Hinglish',
    rows: [
      { id: 'a', name: 'Swift seat cover', detail: 'Literal match on Swift' },
      { id: 'b', name: 'Swift floor mat', detail: 'Literal match on Swift' },
      { id: 'c', name: 'Headlight, Swift', detail: 'Benchmark expects headlight', expected: true },
      { id: 'd', name: 'Tail lamp, Swift', detail: 'Nearby lamp' },
    ],
    order: {
      keyword: ['a', 'b', 'd', 'c'],
      embedding: ['d', 'c', 'a', 'b'],
      hybrid: ['c', 'd', 'a', 'b'],
    },
  },
];
