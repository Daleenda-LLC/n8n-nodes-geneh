/**
 * One list of what Geneh offers to no-code tools, read by the Zapier app, the n8n node and the Make app so the three
 * never drift apart. Events mirror `WEBHOOK_EVENTS` in packages/contracts (a test checks it); actions are read-only
 * calls to the developer API at api.geneh.app/v1.
 *
 * Copy rules: plain sentences, no data sources named, Central Bank is a reference and never a best rate.
 */

export const API_BASE = 'https://api.geneh.app/v1';
export const KEYS_URL = 'https://geneh.app/en/developers/keys';
export const DOCS_URL = 'https://geneh.app/en/developers/webhooks';

const AT = '2026-10-16T00:37:00Z';

/**
 * Each webhook event as a trigger. `filters` says which narrowing inputs the trigger offers: `currency` and `bank`
 * map to the webhook's `filters`, `threshold` to one entry in `thresholds`. `sample` is the `data` of a delivery.
 */
export const EVENTS = [
  {
    type: 'rate.best_changed',
    key: 'best_rate_changed',
    label: 'Best Rate Changed',
    noun: 'Best Rate',
    description: 'Triggers when the cheapest bank to buy a currency from, or the bank that pays the most for it, changes or moves its price.',
    filters: ['currency', 'bank'],
    sample: { currency: 'USD', side: 'sell', previous: { bank: 'nbe', rate: 53.52 }, current: { bank: 'credit_agricole', rate: 53.47 } },
  },
  {
    type: 'rate.threshold_crossed',
    key: 'price_alert',
    label: 'Price Alert',
    noun: 'Price Alert',
    description: 'Triggers when the best rate for a currency, or one bank\'s rate, goes below or above a price you set.',
    filters: ['threshold'],
    sample: { currency: 'USD', side: 'sell', bank: 'credit_agricole', threshold: { below: 53.5 }, previous: 53.52, current: 53.47 },
  },
  {
    type: 'rate.updated',
    key: 'bank_rate_updated',
    label: 'Bank Rate Updated',
    noun: 'Bank Rate',
    description: 'Triggers when a bank changes its buy or sell price for a currency.',
    filters: ['currency', 'bank'],
    sample: { currency: 'USD', unit: 1, banks: [{ bank: 'nbe', buy: 53.42, sell: 53.52, previous: { buy: 53.4, sell: 53.5 }, updated_at: AT }] },
  },
  {
    type: 'cbe.rate_changed',
    key: 'central_bank_rate_changed',
    label: 'Central Bank Rate Changed',
    noun: 'Central Bank Rate',
    description: 'Triggers when the Central Bank of Egypt changes its reference rate for a currency.',
    filters: ['currency'],
    sample: { currency: 'USD', unit: 1, previous: { buy: 53.35, sell: 53.49 }, current: { buy: 53.39, sell: 53.53 }, updated_at: AT },
  },
  {
    type: 'gold.updated',
    key: 'gold_price_updated',
    label: 'Gold Price Updated',
    noun: 'Gold Price',
    description: 'Triggers when gold prices in Egypt change, for any karat or the gold pound.',
    filters: [],
    sample: { prices: [{ instrument: 'xau_21k_g', buy: 6190, sell: 6240, previous: { buy: 6170, sell: 6220 }, updated_at: AT }] },
  },
  {
    type: 'silver.updated',
    key: 'silver_price_updated',
    label: 'Silver Price Updated',
    noun: 'Silver Price',
    description: 'Triggers when silver prices in Egypt change.',
    filters: [],
    sample: { prices: [{ instrument: 'xag_925_g', buy: 96, sell: 99, previous: { buy: 95, sell: 98 }, updated_at: AT }] },
  },
  {
    type: 'transfer.quotes_updated',
    key: 'transfer_prices_updated',
    label: 'Transfer Prices Updated',
    noun: 'Transfer Prices',
    description: 'Triggers when money transfer providers change how many pounds arrive in Egypt.',
    filters: [],
    sample: { updated_at: AT, quotes: [{ provider: 'western_union', instrument: 'sar_egp', per_unit: 14.11, receive_egp: 14114, updated_at: AT }] },
  },
  {
    type: 'certificate.created',
    key: 'new_certificate',
    label: 'New Certificate',
    noun: 'Certificate',
    description: 'Triggers when a bank offers a new savings certificate.',
    filters: ['bank'],
    sample: { bank: 'nbe', certificate: 'nbe_platinum_3y', rate: 17.25, details: { termMonths: 36, payout: 'monthly', minAmount: 1000 } },
  },
  {
    type: 'certificate.rate_changed',
    key: 'certificate_rate_changed',
    label: 'Certificate Rate Changed',
    noun: 'Certificate Rate',
    description: 'Triggers when a bank changes the return on a savings certificate.',
    filters: ['bank'],
    sample: { bank: 'nbe', certificate: 'nbe_platinum_3y', previous: 17.75, current: 17.25 },
  },
  {
    type: 'tbill.auction_result',
    key: 'treasury_bill_auction',
    label: 'Treasury Bill Auction Result',
    noun: 'Auction Result',
    description: 'Triggers when a treasury bill auction result is out, with the accepted yield.',
    filters: [],
    sample: { instrument: 'tbill_6m', currency: 'EGP', yield: 24.87, previous: 25.1, auction_date: '2026-10-15T08:00:00Z' },
  },
  {
    type: 'fund.price_updated',
    key: 'fund_price_updated',
    label: 'Fund Price Updated',
    noun: 'Fund Price',
    description: 'Triggers when an investment fund publishes a new unit price.',
    filters: [],
    sample: { fund: 'fund_2662', previous: 57.02, current: 57.19, updated_at: AT },
  },
  {
    type: 'status.incident',
    key: 'prices_delayed',
    label: 'Prices Delayed',
    noun: 'Delay',
    description: 'Triggers when a bank\'s prices stop updating on Geneh, and again when they are back.',
    filters: ['bank'],
    sample: { source: 'nbe', phase: 'started', state: 'failing', previous_state: 'ok' },
  },
];

/** Sides as the API names them. `sell` is what a bank charges you, `buy` is what it pays you. */
export const SIDES = [
  { value: 'sell', label: 'Buying from a bank (its sell price)' },
  { value: 'buy', label: 'Selling to a bank (its buy price)' },
];

export const DIRECTIONS = [
  { value: 'below', label: 'Goes below' },
  { value: 'above', label: 'Goes above' },
];

export const RECEIVE = ['bank', 'cash', 'wallet', 'card'];
export const RANGES = ['1d', '1w', '1m', '1y', 'all'];

/** What a delivery or a sample looks like once it reaches a workflow: the envelope with `data` spread on top. */
export function flatten(event) {
  const { data, ...rest } = event ?? {};
  return { ...rest, ...(data && typeof data === 'object' ? data : {}) };
}

/** A sample delivery for one event, as `flatten` gives it. */
export function sampleOf(type) {
  const e = EVENTS.find((x) => x.type === type);
  return flatten({ id: `evt_sample_${e.key}`, type, created_at: AT, data: e.sample });
}

/**
 * The body of `POST /webhooks` for one event and the inputs a person filled in. Lists arrive as arrays or as
 * comma-separated text depending on the tool, so both are accepted.
 */
export function webhookBody(type, url, input = {}, description) {
  const list = (v) =>
    (Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [])
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean);
  const body = { url, events: [type], ...(description ? { description } : {}) };
  const filters = {};
  const currency = list(input.currency);
  const bank = list(input.bank);
  if (currency.length) filters.currency = currency;
  if (bank.length) filters.bank = bank;
  if (Object.keys(filters).length) body.filters = filters;
  if (type === 'rate.threshold_crossed') {
    const price = Number(input.price);
    if (!input.currency || !Number.isFinite(price) || price <= 0) throw new Error('A price alert needs a currency and a price above zero.');
    const t = { currency: list(input.currency)[0], side: input.side === 'buy' ? 'buy' : 'sell', [input.direction === 'above' ? 'above' : 'below']: price };
    const oneBank = list(input.bank)[0];
    if (oneBank) t.bank = oneBank;
    body.thresholds = [t];
    delete body.filters;
  }
  return body;
}

/** Checks `Geneh-Signature: t=<unix>,v1=<hex>` against the raw body. `hmac(secret, text)` returns hex. */
export function verifySignature(header, rawBody, secret, hmac, nowSeconds = Date.now() / 1000) {
  if (!header || !secret || typeof rawBody !== 'string') return false;
  const parts = Object.fromEntries(String(header).split(',').map((p) => p.trim().split('=')));
  const t = Number(parts.t);
  if (!Number.isFinite(t) || !parts.v1 || Math.abs(nowSeconds - t) > 300) return false;
  const want = hmac(secret, `${t}.${rawBody}`);
  if (want.length !== parts.v1.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  return diff === 0;
}

/** Flattens `/rates/{currency}` for a workflow: the best rates as top-level fields, banks kept as a list. */
export function flatRates(r) {
  return {
    id: `${r.currency}-${r.best?.sell?.bank ?? ''}-${r.best?.sell?.rate ?? ''}-${r.best?.buy?.bank ?? ''}-${r.best?.buy?.rate ?? ''}`,
    currency: r.currency,
    unit: r.unit,
    updated_at: r.updated_at,
    best_buy_from_bank: r.best?.sell?.bank ?? null,
    best_buy_from_rate: r.best?.sell?.rate ?? null,
    best_sell_to_bank: r.best?.buy?.bank ?? null,
    best_sell_to_rate: r.best?.buy?.rate ?? null,
    cbe_buy: r.cbe?.buy ?? null,
    cbe_sell: r.cbe?.sell ?? null,
    banks: r.banks ?? [],
  };
}

/** Flattens `/gold` or `/silver`: each instrument's buy and sell as fields (`xau_21k_g_sell`), the list kept too. */
export function flatMetal(r, metal) {
  const out = { id: '', metal, updated_at: r.updated_at, ounce_usd: r.ounce_usd ?? null };
  if (metal === 'gold') out.gold_dollar = r.gold_dollar ?? null;
  const ids = [];
  for (const p of r.prices ?? []) {
    out[`${p.instrument}_buy`] = p.buy;
    out[`${p.instrument}_sell`] = p.sell;
    ids.push(`${p.instrument}:${p.buy}:${p.sell}`);
  }
  out.id = `${metal}-${ids.sort().join('|')}`;
  out.prices = (r.prices ?? []).map(({ source: _s, ...p }) => p);
  return out;
}

/**
 * Read-only API calls offered as actions (Zapier searches, n8n operations, Make search modules). `plan` is the
 * lowest API plan that answers. `params` are query or path inputs.
 */
export const ACTIONS = [
  { key: 'currency_rates', label: 'Get Currency Rates', description: 'Gets every bank\'s buy and sell price for a currency, the best rates and the Central Bank rate.', path: '/rates/{currency}', plan: 'free', params: ['currency'] },
  { key: 'all_currencies', label: 'Get All Currencies', description: 'Gets the best rates and the Central Bank rate for every currency.', path: '/rates/latest', plan: 'free', params: [] },
  { key: 'convert', label: 'Convert Money', description: 'Converts an amount between Egyptian pounds and another currency at the Central Bank rate or a bank\'s price.', path: '/convert', plan: 'free', params: ['amount', 'from', 'to', 'bank'] },
  { key: 'rate_history', label: 'Get Rate History', description: 'Gets the history of a currency at the Central Bank or one bank.', path: '/rates/{currency}/history', plan: 'free', params: ['currency', 'bank', 'range'] },
  { key: 'gold', label: 'Get Gold Prices', description: 'Gets gold prices in Egypt for every karat and the gold pound.', path: '/gold', plan: 'free', params: [] },
  { key: 'silver', label: 'Get Silver Prices', description: 'Gets silver prices in Egypt.', path: '/silver', plan: 'pro', params: [] },
  { key: 'bank', label: 'Get Bank', description: 'Gets one bank\'s currency prices, certificates and funds.', path: '/banks/{bank}', plan: 'pro', params: ['bank'] },
  { key: 'transfer_quotes', label: 'Get Transfer Prices', description: 'Gets how many pounds arrive in Egypt with each money transfer provider.', path: '/transfers/quotes', plan: 'pro', params: ['country', 'send_currency', 'amount', 'receive'] },
  { key: 'certificates', label: 'Get Certificates', description: 'Gets every bank savings certificate with its return.', path: '/certificates', plan: 'pro', params: [] },
  { key: 'treasury_bills', label: 'Get Treasury Bills', description: 'Gets the latest treasury bill yields, before and after the 20% tax.', path: '/tbills', plan: 'pro', params: [] },
  { key: 'funds', label: 'Get Investment Funds', description: 'Gets every investment fund with its latest unit price.', path: '/funds', plan: 'pro', params: [] },
];

/** Builds the request for an action from the inputs: a path with `{x}` filled in and a query. */
export function actionRequest(action, input = {}) {
  const enc = (v) => encodeURIComponent(String(v).trim().toLowerCase());
  let path = action.path;
  for (const p of ['currency', 'bank']) {
    if (path.includes(`{${p}}`)) {
      if (!input[p]) throw new Error(`${p === 'currency' ? 'Currency' : 'Bank'} is required.`);
      path = path.replace(`{${p}}`, enc(input[p]));
    }
  }
  const q = {};
  const put = (k, v) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') q[k] = String(v).trim();
  };
  switch (action.key) {
    case 'convert':
      put('amount', input.amount);
      put('from', (input.from ?? 'usd').toLowerCase());
      put('to', (input.to ?? 'egp').toLowerCase());
      put('bank', input.bank);
      break;
    case 'rate_history':
      put('range', input.range);
      break;
    case 'transfer_quotes':
      put('from', input.country?.toUpperCase());
      put('currency', input.send_currency?.toUpperCase());
      put('amount', input.amount);
      put('receive', input.receive);
      break;
  }
  if (action.key === 'rate_history' && input.bank) q.bank = String(input.bank).trim().toLowerCase();
  return { path, query: q };
}

/** Plain-language help for API errors, shown by every tool instead of a bare status code. */
export function errorMessage(status, body) {
  const msg = body?.message;
  if (status === 401) return 'Geneh did not accept this API key. Check it on geneh.app under Developers, Keys.';
  if (status === 403 && body?.error === 'plan_required') return `${msg ?? 'This needs a higher API plan.'} See geneh.app/en/developers/plans.`;
  if (status === 403 && body?.error === 'webhook_limit') return msg;
  if (status === 429) return 'Too many requests for this API plan today. Try again later or move to a higher plan.';
  return msg ?? `Geneh answered with status ${status}.`;
}

/**
 * The one action that writes: a claimed business sends its own prices (POST /business/prices). It needs a business
 * key that starts with gb_ and has the prices:write scope, which is a different key from the data API key (gk_).
 */
export const SEND_PRICES = {
  key: 'send_prices',
  label: 'Send Prices to Geneh',
  description: 'Sends the prices of your claimed business to Geneh for one branch. Needs a business key that starts with gb_.',
  path: '/business/prices',
};
export const BUSINESS_KEY_HELP = 'Make a business key in your Geneh business account with the prices:write scope. It starts with gb_live_.';

const BRANCH = /^[a-z0-9_-]{1,40}$/;
const INSTRUMENT = /^[a-z0-9_-]+$/;
const ARABIC_DIGITS = { '٠': 0, '١': 1, '٢': 2, '٣': 3, '٤': 4, '٥': 5, '٦': 6, '٧': 7, '٨': 8, '٩': 9, '۰': 0, '۱': 1, '۲': 2, '۳': 3, '۴': 4, '۵': 5, '۶': 6, '۷': 7, '۸': 8, '۹': 9 };

/** A price typed by a person: a number, or text in Latin or Arabic digits. Empty is no price. */
function priceOf(value, instrument) {
  if (value === undefined || value === null) return null;
  let text = String(value).replace(/[٠-٩۰-۹]/g, (d) => ARABIC_DIGITS[d]).replace(/[\s\u00a0]/g, '').replace(/٬/g, '').replace(/٫/g, '.');
  if (text === '') return null;
  // 52,5 is a decimal comma. In 1,250.5 and 1,250 the commas group thousands.
  text = /^\d+,\d{1,2}$/.test(text) ? text.replace(',', '.') : text.replace(/,/g, '');
  if (!/^\d+(\.\d+)?$/.test(text)) throw new Error(`"${String(value).trim()}" is not a number. Check the price for ${instrument}.`);
  const n = Number(text);
  if (!(n > 0) || !Number.isFinite(n)) throw new Error(`The price for ${instrument} must be above zero.`);
  return n;
}

/**
 * The body of `POST /business/prices` (a PriceSubmission, branch `all` when none is named) from a branch and rows of instrument, buy and sell. Rows
 * arrive as an array, or as an object keyed by position, depending on the tool. Either price may be empty, not both.
 */
export function pricesBody(input = {}) {
  const branch = String(input.branch ?? '').trim().toLowerCase() || 'all';
  if (!BRANCH.test(branch)) throw new Error('A branch name has letters, digits, dashes or underscores, up to 40 characters.');
  const rows = Array.isArray(input.rows) ? input.rows : input.rows && typeof input.rows === 'object' ? Object.values(input.rows) : [];
  if (!rows.length) throw new Error('Add at least one row with an instrument and a price.');
  if (rows.length > 200) throw new Error('Send up to 200 rows at a time.');
  const prices = rows.map((row) => {
    const instrument = String(row?.instrument ?? '').trim().toLowerCase();
    if (!instrument) throw new Error('Each row needs an instrument, such as usd.');
    if (!INSTRUMENT.test(instrument)) throw new Error(`The instrument ${instrument} is not valid. Use letters, digits, dashes or underscores.`);
    const buy = priceOf(row.buy, instrument);
    const sell = priceOf(row.sell, instrument);
    if (buy === null && sell === null) throw new Error(`Send a buy or a sell price for ${instrument}.`);
    return { instrument, buy, sell };
  });
  return { branch, prices };
}

/** Plain-language help for the answer of the business price call. */
export function businessErrorMessage(status, body) {
  if (status === 401) return 'Geneh did not accept this business key. Check that it starts with gb_ and has the prices:write scope.';
  if (status === 429) return 'Too many price updates. Try again in a minute.';
  if (status === 400 || status === 403 || status === 404) return body?.message ?? errorMessage(status, body);
  return errorMessage(status, body);
}
