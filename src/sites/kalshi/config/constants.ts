export const PAYOUT_PER_CONTRACT = 1.0;
export const FEE_RATE = 0.07;
export const EDGE_CASE_ODDS = "-10000";
export const DEBOUNCE_DELAY = 50;
export const MUTATION_OBSERVER_DELAY = 100;

export const SELECTORS = {
  PRICE_ELEMENTS: "button, span, div, td, th, p",
  PRICE_BUTTONS: 'button[data-testid="price-pill"]',
  SPREAD_CONTAINERS:
    ".flex.items-center.gap-2.w-full, div.flex.items-center.gap-2.w-full, [class*='flex'][class*='items-center'][class*='gap-2'][class*='w-full']",
  TITLE_ELEMENTS: 'h1, h2, h3, .title, [class*="title"], [class*="header"]',
  GAP_ELEMENTS: 'div[class="flex flex-col gap-7 w-full"]',
} as const;

export const CSS_CLASSES = {
  ODDS_SPAN: "bb-odds",
  SPREAD_OVERLAY: "bb-spread-overlay",
  HIDE_SVGS: "bb-hide-svgs",
} as const;

export const DATA_ATTRIBUTES = {
  PROCESSED: "bbProcessed",
  ORIGINAL_TEXT: "bbOriginalText",
  SPREAD_PROCESSED: "bbSpreadProcessed",
  HIDDEN_CHART: "bbHiddenChart",
  HIDDEN_CHART_SIBLING: "bbHiddenChartSibling",
  MODIFIED_GAP: "bbModifiedGap",
  ORIGINAL_CLASS: "bbOriginalClass",
} as const;

export const REGEX_PATTERNS = {
  CENTS: /(\d{1,2}(?:\.\d+)?)¢/,
  PERCENTAGE: /(\d{1,2}(?:\.\d+)?)% chance/,
  TEAM_NAMES: /([\w\s.'-]+?)\s+(?:vs?\.?|@|v|at)\s+([\w\s.'-]+)/i,
  CONTENT_TEAM_NAMES: /([\w\s.'-]+?)\s+(?:vs?\.?|@|against|at)\s+([\w\s.'-]+)/i,
  SPREAD_MAIN:
    /([\w\s.'-]+?)\s+wins\s+by\s+(?:over|under)\s*(\d+(?:\.\d+)?)\s*(?:points?|goals?|runs?)/i,
  SPREAD_ALT1:
    /([\w\s.'-]+?)\s+wins\s+by\s+(?:more\s+than|fewer\s+than)\s+(\d+(?:\.\d+)?)\s+(?:points?|goals?|runs?)/i,
  SPREAD_ALT2:
    /([\w\s.'-]+?)\s+covers\s+(?:the\s+)?(\d+(?:\.\d+)?)\s*(?:point\s+)?spread/i,
} as const;

export const SPREAD_KEYWORDS = [
  "wins by",
  "points",
  "goals",
  "runs",
  "over",
  "under",
  "covers",
  "spread",
] as const;
