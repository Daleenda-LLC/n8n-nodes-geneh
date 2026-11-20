export interface GenehEvent { type: string; key: string; label: string; noun: string; description: string; filters: ('currency' | 'bank' | 'threshold')[]; sample: Record<string, unknown> }
export interface GenehAction { key: string; label: string; description: string; path: string; plan: 'free' | 'pro'; params: string[] }
export const API_BASE: string;
export const KEYS_URL: string;
export const DOCS_URL: string;
export const EVENTS: GenehEvent[];
export const ACTIONS: GenehAction[];
export const SIDES: { value: 'buy' | 'sell'; label: string }[];
export const DIRECTIONS: { value: 'below' | 'above'; label: string }[];
export const RECEIVE: string[];
export const RANGES: string[];
export function flatten(event: unknown): Record<string, unknown>;
export function sampleOf(type: string): Record<string, unknown>;
export function webhookBody(type: string, url: string, input?: Record<string, unknown>, description?: string): Record<string, unknown>;
export function verifySignature(header: string | undefined, rawBody: string, secret: string, hmac: (secret: string, text: string) => string, nowSeconds?: number): boolean;
export function flatRates(r: any): Record<string, any>;
export function flatMetal(r: any, metal: string): Record<string, any>;
export function actionRequest(action: GenehAction, input?: Record<string, unknown>): { path: string; query: Record<string, string> };
export function errorMessage(status: number, body: any): string;
export interface GenehSendPrices { key: string; label: string; description: string; path: string }
export const SEND_PRICES: GenehSendPrices;
export const BUSINESS_KEY_HELP: string;
export type PriceRow = { instrument?: unknown; buy?: unknown; sell?: unknown };
export function pricesBody(input?: { branch?: unknown; rows?: PriceRow[] | Record<string, PriceRow> }): { branch: string; prices: { instrument: string; buy: number | null; sell: number | null }[] };
export function businessErrorMessage(status: number, body: any): string;
