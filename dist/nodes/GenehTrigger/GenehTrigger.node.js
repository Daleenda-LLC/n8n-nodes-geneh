"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// n8n/nodes/GenehTrigger/GenehTrigger.node.ts
var GenehTrigger_node_exports = {};
__export(GenehTrigger_node_exports, {
  GenehTrigger: () => GenehTrigger
});
module.exports = __toCommonJS(GenehTrigger_node_exports);
var import_node_crypto = require("node:crypto");
var import_n8n_workflow2 = require("n8n-workflow");

// src/catalog.mjs
var AT = "2026-10-16T00:37:00Z";
var EVENTS = [
  {
    type: "rate.best_changed",
    key: "best_rate_changed",
    label: "Best Rate Changed",
    noun: "Best Rate",
    description: "Triggers when the cheapest bank to buy a currency from, or the bank that pays the most for it, changes or moves its price.",
    filters: ["currency", "bank"],
    sample: { currency: "USD", side: "sell", previous: { bank: "nbe", rate: 53.52 }, current: { bank: "credit_agricole", rate: 53.47 } }
  },
  {
    type: "rate.threshold_crossed",
    key: "price_alert",
    label: "Price Alert",
    noun: "Price Alert",
    description: "Triggers when the best rate for a currency, or one bank's rate, goes below or above a price you set.",
    filters: ["threshold"],
    sample: { currency: "USD", side: "sell", bank: "credit_agricole", threshold: { below: 53.5 }, previous: 53.52, current: 53.47 }
  },
  {
    type: "rate.updated",
    key: "bank_rate_updated",
    label: "Bank Rate Updated",
    noun: "Bank Rate",
    description: "Triggers when a bank changes its buy or sell price for a currency.",
    filters: ["currency", "bank"],
    sample: { currency: "USD", unit: 1, banks: [{ bank: "nbe", buy: 53.42, sell: 53.52, previous: { buy: 53.4, sell: 53.5 }, updated_at: AT }] }
  },
  {
    type: "cbe.rate_changed",
    key: "central_bank_rate_changed",
    label: "Central Bank Rate Changed",
    noun: "Central Bank Rate",
    description: "Triggers when the Central Bank of Egypt changes its reference rate for a currency.",
    filters: ["currency"],
    sample: { currency: "USD", unit: 1, previous: { buy: 53.35, sell: 53.49 }, current: { buy: 53.39, sell: 53.53 }, updated_at: AT }
  },
  {
    type: "gold.updated",
    key: "gold_price_updated",
    label: "Gold Price Updated",
    noun: "Gold Price",
    description: "Triggers when gold prices in Egypt change, for any karat or the gold pound.",
    filters: [],
    sample: { prices: [{ instrument: "xau_21k_g", buy: 6190, sell: 6240, previous: { buy: 6170, sell: 6220 }, updated_at: AT }] }
  },
  {
    type: "silver.updated",
    key: "silver_price_updated",
    label: "Silver Price Updated",
    noun: "Silver Price",
    description: "Triggers when silver prices in Egypt change.",
    filters: [],
    sample: { prices: [{ instrument: "xag_925_g", buy: 96, sell: 99, previous: { buy: 95, sell: 98 }, updated_at: AT }] }
  },
  {
    type: "transfer.quotes_updated",
    key: "transfer_prices_updated",
    label: "Transfer Prices Updated",
    noun: "Transfer Prices",
    description: "Triggers when money transfer providers change how many pounds arrive in Egypt.",
    filters: [],
    sample: { updated_at: AT, quotes: [{ provider: "western_union", instrument: "sar_egp", per_unit: 14.11, receive_egp: 14114, updated_at: AT }] }
  },
  {
    type: "certificate.created",
    key: "new_certificate",
    label: "New Certificate",
    noun: "Certificate",
    description: "Triggers when a bank offers a new savings certificate.",
    filters: ["bank"],
    sample: { bank: "nbe", certificate: "nbe_platinum_3y", rate: 17.25, details: { termMonths: 36, payout: "monthly", minAmount: 1e3 } }
  },
  {
    type: "certificate.rate_changed",
    key: "certificate_rate_changed",
    label: "Certificate Rate Changed",
    noun: "Certificate Rate",
    description: "Triggers when a bank changes the return on a savings certificate.",
    filters: ["bank"],
    sample: { bank: "nbe", certificate: "nbe_platinum_3y", previous: 17.75, current: 17.25 }
  },
  {
    type: "tbill.auction_result",
    key: "treasury_bill_auction",
    label: "Treasury Bill Auction Result",
    noun: "Auction Result",
    description: "Triggers when a treasury bill auction result is out, with the accepted yield.",
    filters: [],
    sample: { instrument: "tbill_6m", currency: "EGP", yield: 24.87, previous: 25.1, auction_date: "2026-10-15T08:00:00Z" }
  },
  {
    type: "fund.price_updated",
    key: "fund_price_updated",
    label: "Fund Price Updated",
    noun: "Fund Price",
    description: "Triggers when an investment fund publishes a new unit price.",
    filters: [],
    sample: { fund: "fund_2662", previous: 57.02, current: 57.19, updated_at: AT }
  },
  {
    type: "status.incident",
    key: "prices_delayed",
    label: "Prices Delayed",
    noun: "Delay",
    description: "Triggers when a bank's prices stop updating on Geneh, and again when they are back.",
    filters: ["bank"],
    sample: { source: "nbe", phase: "started", state: "failing", previous_state: "ok" }
  }
];
var SIDES = [
  { value: "sell", label: "Buying from a bank (its sell price)" },
  { value: "buy", label: "Selling to a bank (its buy price)" }
];
var DIRECTIONS = [
  { value: "below", label: "Goes below" },
  { value: "above", label: "Goes above" }
];
function flatten(event) {
  const { data, ...rest } = event ?? {};
  return { ...rest, ...data && typeof data === "object" ? data : {} };
}
function webhookBody(type, url, input = {}, description) {
  const list = (v) => (Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : []).map((s) => String(s).trim().toLowerCase()).filter(Boolean);
  const body = { url, events: [type], ...description ? { description } : {} };
  const filters = {};
  const currency = list(input.currency);
  const bank = list(input.bank);
  if (currency.length) filters.currency = currency;
  if (bank.length) filters.bank = bank;
  if (Object.keys(filters).length) body.filters = filters;
  if (type === "rate.threshold_crossed") {
    const price = Number(input.price);
    if (!input.currency || !Number.isFinite(price) || price <= 0) throw new Error("A price alert needs a currency and a price above zero.");
    const t = { currency: list(input.currency)[0], side: input.side === "buy" ? "buy" : "sell", [input.direction === "above" ? "above" : "below"]: price };
    const oneBank = list(input.bank)[0];
    if (oneBank) t.bank = oneBank;
    body.thresholds = [t];
    delete body.filters;
  }
  return body;
}
function verifySignature(header, rawBody, secret, hmac2, nowSeconds = Date.now() / 1e3) {
  if (!header || !secret || typeof rawBody !== "string") return false;
  const parts = Object.fromEntries(String(header).split(",").map((p) => p.trim().split("=")));
  const t = Number(parts.t);
  if (!Number.isFinite(t) || !parts.v1 || Math.abs(nowSeconds - t) > 300) return false;
  const want = hmac2(secret, `${t}.${rawBody}`);
  if (want.length !== parts.v1.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ parts.v1.charCodeAt(i);
  return diff === 0;
}
function errorMessage(status, body) {
  const msg = body?.message;
  if (status === 401) return "Geneh did not accept this API key. Check it on geneh.app under Developers, Keys.";
  if (status === 403 && body?.error === "plan_required") return `${msg ?? "This needs a higher API plan."} See geneh.app/en/developers/plans.`;
  if (status === 403 && body?.error === "webhook_limit") return msg;
  if (status === 429) return "Too many requests for this API plan today. Try again later or move to a higher plan.";
  return msg ?? `Geneh answered with status ${status}.`;
}

// n8n/nodes/shared.ts
var import_n8n_workflow = require("n8n-workflow");
async function geneh(method, path, qs = {}, body) {
  const creds = await this.getCredentials("genehApi");
  const baseURL = String(creds.baseUrl || "https://api.geneh.app/v1").replace(/\/+$/, "");
  try {
    return await this.helpers.httpRequestWithAuthentication.call(this, "genehApi", {
      method,
      url: `${baseURL}${path}`,
      qs,
      body,
      json: true,
      headers: { "User-Agent": "n8n-nodes-geneh" }
    });
  } catch (error) {
    const e = error;
    const status = Number(e.httpCode ?? e.response?.status ?? e.cause?.response?.status ?? 0);
    const data = e.response?.data ?? e.cause?.response?.data ?? e.context?.data;
    if (status === 404 && method === "DELETE") return {};
    throw new import_n8n_workflow.NodeApiError(this.getNode(), error, { message: status ? errorMessage(status, data) : e.message, httpCode: status ? String(status) : void 0 });
  }
}
async function currencyOptions() {
  const r = await geneh.call(this, "GET", "/rates/latest");
  return r.currencies.map((c) => ({ name: c.currency, value: c.currency.toLowerCase() }));
}
async function bankOptions() {
  const r = await geneh.call(this, "GET", "/banks");
  return r.banks.filter((b) => b.type === "bank").map((b) => ({ name: b.name?.en ?? b.id, value: b.id }));
}

// n8n/nodes/GenehTrigger/GenehTrigger.node.ts
var hmac = (secret, text) => (0, import_node_crypto.createHmac)("sha256", secret).update(text).digest("hex");
var withFilter = (f) => EVENTS.filter((e) => e.filters.includes(f)).map((e) => e.type);
var GenehTrigger = class {
  description = {
    displayName: "Geneh Trigger",
    name: "genehTrigger",
    icon: "file:geneh.svg",
    group: ["trigger"],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: "Starts the workflow when rates, gold or savings change in Egypt",
    defaults: { name: "Geneh Trigger" },
    inputs: [],
    outputs: [import_n8n_workflow2.NodeConnectionTypes.Main],
    credentials: [{ name: "genehApi", required: true }],
    webhooks: [{ name: "default", httpMethod: "POST", responseMode: "onReceived", path: "webhook" }],
    properties: [
      {
        displayName: "Webhooks come with the Pro API plan and above. Each active workflow uses one of your plan's webhooks.",
        name: "notice",
        type: "notice",
        default: ""
      },
      {
        displayName: "Event",
        name: "event",
        type: "options",
        required: true,
        default: "rate.best_changed",
        options: EVENTS.map((e) => ({ name: e.label, value: e.type, description: e.description }))
      },
      {
        displayName: "Currency Names or IDs",
        name: "currencies",
        type: "multiOptions",
        typeOptions: { loadOptionsMethod: "currencies" },
        default: [],
        description: 'Leave empty for every currency. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        displayOptions: { show: { event: withFilter("currency") } }
      },
      {
        displayName: "Bank Names or IDs",
        name: "banks",
        type: "multiOptions",
        typeOptions: { loadOptionsMethod: "banks" },
        default: [],
        description: 'Leave empty for every bank. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        displayOptions: { show: { event: withFilter("bank") } }
      },
      {
        displayName: "Currency Name or ID",
        name: "alertCurrency",
        type: "options",
        typeOptions: { loadOptionsMethod: "currencies" },
        default: "usd",
        required: true,
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
        displayOptions: { show: { event: ["rate.threshold_crossed"] } }
      },
      {
        displayName: "Price",
        name: "side",
        type: "options",
        options: SIDES.map((s) => ({ name: s.label, value: s.value })),
        default: "sell",
        displayOptions: { show: { event: ["rate.threshold_crossed"] } }
      },
      {
        displayName: "When It",
        name: "direction",
        type: "options",
        options: DIRECTIONS.map((d) => ({ name: d.label, value: d.value })),
        default: "below",
        displayOptions: { show: { event: ["rate.threshold_crossed"] } }
      },
      {
        displayName: "Price in Egyptian Pounds",
        name: "price",
        type: "number",
        typeOptions: { minValue: 0, numberPrecision: 4 },
        default: 0,
        required: true,
        displayOptions: { show: { event: ["rate.threshold_crossed"] } }
      },
      {
        displayName: "Bank ID",
        name: "alertBank",
        type: "string",
        default: "",
        placeholder: "nbe",
        description: "Leave empty to watch the best rate across banks",
        displayOptions: { show: { event: ["rate.threshold_crossed"] } }
      }
    ]
  };
  methods = { loadOptions: { currencies: currencyOptions, banks: bankOptions } };
  webhookMethods = {
    default: {
      async checkExists() {
        const data = this.getWorkflowStaticData("node");
        if (!data.webhookId) return false;
        const list = await geneh.call(this, "GET", "/webhooks");
        const url = this.getNodeWebhookUrl("default");
        if (list.items?.some((w) => w.id === data.webhookId && w.url === url)) return true;
        delete data.webhookId;
        delete data.secret;
        return false;
      },
      async create() {
        const event = this.getNodeParameter("event");
        const label = EVENTS.find((e) => e.type === event)?.label ?? event;
        const alert = event === "rate.threshold_crossed";
        const input = alert ? { currency: this.getNodeParameter("alertCurrency"), side: this.getNodeParameter("side"), direction: this.getNodeParameter("direction"), price: this.getNodeParameter("price"), bank: this.getNodeParameter("alertBank", "") } : { currency: this.getNodeParameter("currencies", []), bank: this.getNodeParameter("banks", []) };
        const body = webhookBody(event, this.getNodeWebhookUrl("default"), input, `n8n: ${label}`);
        const made = await geneh.call(this, "POST", "/webhooks", {}, body);
        const data = this.getWorkflowStaticData("node");
        data.webhookId = made.id;
        data.secret = made.secret;
        return true;
      },
      async delete() {
        const data = this.getWorkflowStaticData("node");
        if (data.webhookId) await geneh.call(this, "DELETE", `/webhooks/${encodeURIComponent(String(data.webhookId))}`);
        delete data.webhookId;
        delete data.secret;
        return true;
      }
    }
  };
  async webhook() {
    const req = this.getRequestObject();
    const secret = this.getWorkflowStaticData("node").secret;
    const raw = req.rawBody;
    const text = Buffer.isBuffer(raw) ? raw.toString("utf8") : typeof raw === "string" ? raw : JSON.stringify(req.body);
    const sig = this.getHeaderData()["geneh-signature"];
    if (!secret || !verifySignature(sig, text, secret, hmac)) {
      const res = this.getResponseObject();
      res.status(401).json({ error: "bad_signature" });
      return { noWebhookResponse: true };
    }
    const body = this.getBodyData();
    if (body.type !== this.getNodeParameter("event")) return { webhookResponse: "ignored" };
    return { workflowData: [this.helpers.returnJsonArray([flatten(body)])] };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GenehTrigger
});
