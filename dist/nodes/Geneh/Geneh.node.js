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

// n8n/nodes/Geneh/Geneh.node.ts
var Geneh_node_exports = {};
__export(Geneh_node_exports, {
  Geneh: () => Geneh
});
module.exports = __toCommonJS(Geneh_node_exports);
var import_n8n_workflow2 = require("n8n-workflow");

// src/catalog.mjs
var RECEIVE = ["bank", "cash", "wallet", "card"];
var RANGES = ["1d", "1w", "1m", "1y", "all"];
function flatRates(r) {
  return {
    id: `${r.currency}-${r.best?.sell?.bank ?? ""}-${r.best?.sell?.rate ?? ""}-${r.best?.buy?.bank ?? ""}-${r.best?.buy?.rate ?? ""}`,
    currency: r.currency,
    unit: r.unit,
    updated_at: r.updated_at,
    best_buy_from_bank: r.best?.sell?.bank ?? null,
    best_buy_from_rate: r.best?.sell?.rate ?? null,
    best_sell_to_bank: r.best?.buy?.bank ?? null,
    best_sell_to_rate: r.best?.buy?.rate ?? null,
    cbe_buy: r.cbe?.buy ?? null,
    cbe_sell: r.cbe?.sell ?? null,
    banks: r.banks ?? []
  };
}
function flatMetal(r, metal) {
  const out = { id: "", metal, updated_at: r.updated_at, ounce_usd: r.ounce_usd ?? null };
  if (metal === "gold") out.gold_dollar = r.gold_dollar ?? null;
  const ids = [];
  for (const p of r.prices ?? []) {
    out[`${p.instrument}_buy`] = p.buy;
    out[`${p.instrument}_sell`] = p.sell;
    ids.push(`${p.instrument}:${p.buy}:${p.sell}`);
  }
  out.id = `${metal}-${ids.sort().join("|")}`;
  out.prices = (r.prices ?? []).map(({ source: _s, ...p }) => p);
  return out;
}
var ACTIONS = [
  { key: "currency_rates", label: "Get Currency Rates", description: "Gets every bank's buy and sell price for a currency, the best rates and the Central Bank rate.", path: "/rates/{currency}", plan: "free", params: ["currency"] },
  { key: "all_currencies", label: "Get All Currencies", description: "Gets the best rates and the Central Bank rate for every currency.", path: "/rates/latest", plan: "free", params: [] },
  { key: "convert", label: "Convert Money", description: "Converts an amount between Egyptian pounds and another currency at the Central Bank rate or a bank's price.", path: "/convert", plan: "free", params: ["amount", "from", "to", "bank"] },
  { key: "rate_history", label: "Get Rate History", description: "Gets the history of a currency at the Central Bank or one bank.", path: "/rates/{currency}/history", plan: "free", params: ["currency", "bank", "range"] },
  { key: "gold", label: "Get Gold Prices", description: "Gets gold prices in Egypt for every karat and the gold pound.", path: "/gold", plan: "free", params: [] },
  { key: "silver", label: "Get Silver Prices", description: "Gets silver prices in Egypt.", path: "/silver", plan: "pro", params: [] },
  { key: "bank", label: "Get Bank", description: "Gets one bank's currency prices, certificates and funds.", path: "/banks/{bank}", plan: "pro", params: ["bank"] },
  { key: "transfer_quotes", label: "Get Transfer Prices", description: "Gets how many pounds arrive in Egypt with each money transfer provider.", path: "/transfers/quotes", plan: "pro", params: ["country", "send_currency", "amount", "receive"] },
  { key: "certificates", label: "Get Certificates", description: "Gets every bank savings certificate with its return.", path: "/certificates", plan: "pro", params: [] },
  { key: "treasury_bills", label: "Get Treasury Bills", description: "Gets the latest treasury bill yields, before and after the 20% tax.", path: "/tbills", plan: "pro", params: [] },
  { key: "funds", label: "Get Investment Funds", description: "Gets every investment fund with its latest unit price.", path: "/funds", plan: "pro", params: [] }
];
function actionRequest(action, input = {}) {
  const enc = (v) => encodeURIComponent(String(v).trim().toLowerCase());
  let path = action.path;
  for (const p of ["currency", "bank"]) {
    if (path.includes(`{${p}}`)) {
      if (!input[p]) throw new Error(`${p === "currency" ? "Currency" : "Bank"} is required.`);
      path = path.replace(`{${p}}`, enc(input[p]));
    }
  }
  const q = {};
  const put = (k, v) => {
    if (v !== void 0 && v !== null && String(v).trim() !== "") q[k] = String(v).trim();
  };
  switch (action.key) {
    case "convert":
      put("amount", input.amount);
      put("from", (input.from ?? "usd").toLowerCase());
      put("to", (input.to ?? "egp").toLowerCase());
      put("bank", input.bank);
      break;
    case "rate_history":
      put("range", input.range);
      break;
    case "transfer_quotes":
      put("from", input.country?.toUpperCase());
      put("currency", input.send_currency?.toUpperCase());
      put("amount", input.amount);
      put("receive", input.receive);
      break;
  }
  if (action.key === "rate_history" && input.bank) q.bank = String(input.bank).trim().toLowerCase();
  return { path, query: q };
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

// n8n/nodes/Geneh/Geneh.node.ts
var show = (keys) => ({ show: { operation: keys } });
var using = (param) => ACTIONS.filter((a) => a.params.includes(param)).map((a) => a.key);
var fields = [
  {
    displayName: "Currency Name or ID",
    name: "currency",
    type: "options",
    typeOptions: { loadOptionsMethod: "currencies" },
    default: "usd",
    required: true,
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    displayOptions: show(using("currency"))
  },
  {
    displayName: "Bank Name or ID",
    name: "bank",
    type: "options",
    typeOptions: { loadOptionsMethod: "banks" },
    default: "",
    required: true,
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    displayOptions: show(["bank"])
  },
  {
    displayName: "Amount",
    name: "amount",
    type: "number",
    default: 100,
    required: true,
    displayOptions: show(["convert"])
  },
  { displayName: "From Currency", name: "from", type: "string", default: "usd", required: true, description: "A three-letter code. One side must be EGP.", displayOptions: show(["convert"]) },
  { displayName: "To Currency", name: "to", type: "string", default: "egp", required: true, displayOptions: show(["convert"]) },
  {
    displayName: "Bank ID",
    name: "rateBank",
    type: "string",
    default: "",
    placeholder: "nbe",
    description: "Leave empty for the Central Bank rate",
    displayOptions: show(["convert", "rate_history"])
  },
  {
    displayName: "Range",
    name: "range",
    type: "options",
    options: RANGES.map((r) => ({ name: r, value: r })),
    default: "1m",
    displayOptions: show(["rate_history"])
  },
  { displayName: "Sending From Country", name: "country", type: "string", default: "", placeholder: "SA", description: "A two-letter code", displayOptions: show(["transfer_quotes"]) },
  { displayName: "Sending Currency", name: "send_currency", type: "string", default: "", placeholder: "SAR", displayOptions: show(["transfer_quotes"]) },
  { displayName: "Send Amount", name: "sendAmount", type: "number", default: 0, description: "Leave at 0 for every amount", displayOptions: show(["transfer_quotes"]) },
  {
    displayName: "Receive As",
    name: "receive",
    type: "options",
    options: [{ name: "Any", value: "" }, ...RECEIVE.map((r) => ({ name: r[0].toUpperCase() + r.slice(1), value: r }))],
    default: "",
    displayOptions: show(["transfer_quotes"])
  },
  {
    displayName: "Simplify",
    name: "simplify",
    type: "boolean",
    default: true,
    description: "Whether to return the best rates and prices as top-level fields instead of the raw answer",
    displayOptions: show(["currency_rates", "gold", "silver"])
  }
];
var Geneh = class {
  description = {
    displayName: "Geneh",
    name: "geneh",
    icon: "file:geneh.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: "Exchange rates, gold, silver, transfers and savings in Egypt",
    defaults: { name: "Geneh" },
    usableAsTool: true,
    inputs: [import_n8n_workflow2.NodeConnectionTypes.Main],
    outputs: [import_n8n_workflow2.NodeConnectionTypes.Main],
    credentials: [{ name: "genehApi", required: true }],
    properties: [
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        options: ACTIONS.map((a) => ({ name: a.label, value: a.key, action: a.label, description: `${a.description}${a.plan === "pro" ? " Needs the Pro API plan or above." : ""}` })),
        default: "currency_rates"
      },
      ...fields
    ]
  };
  methods = { loadOptions: { currencies: currencyOptions, banks: bankOptions } };
  async execute() {
    const items = this.getInputData();
    const out = [];
    for (let i = 0; i < items.length; i++) {
      try {
        const key = this.getNodeParameter("operation", i);
        const action = ACTIONS.find((a) => a.key === key);
        const p = (name, fallback = "") => action.params.includes(name) || ["rateBank", "sendAmount", "simplify"].includes(name) ? this.getNodeParameter(name, i, fallback) : fallback;
        const input = {
          currency: p("currency"),
          bank: key === "bank" ? p("bank") : p("rateBank") || (key === "convert" ? "cbe" : ""),
          amount: key === "transfer_quotes" ? Number(p("sendAmount", 0)) || "" : p("amount"),
          from: p("from", "usd"),
          to: p("to", "egp"),
          range: p("range", "1m"),
          country: p("country"),
          send_currency: p("send_currency"),
          receive: p("receive")
        };
        const { path, query } = actionRequest(action, input);
        const data = await geneh.call(this, "GET", path, query);
        const simplify = ["currency_rates", "gold", "silver"].includes(key) && p("simplify", true);
        const json = simplify ? key === "currency_rates" ? flatRates(data) : flatMetal(data, key) : data;
        out.push({ json, pairedItem: { item: i } });
      } catch (error) {
        if (this.continueOnFail()) {
          out.push({ json: { error: error.message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }
    return [out];
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Geneh
});
