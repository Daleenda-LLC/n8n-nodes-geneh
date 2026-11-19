import type { IDataObject, IExecuteFunctions, IHookFunctions, IHttpRequestMethods, ILoadOptionsFunctions, INodePropertyOptions, IWebhookFunctions } from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';
import { businessErrorMessage, errorMessage } from '../src/catalog.mjs';

type Ctx = IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IWebhookFunctions;

/** One call to the Geneh API with the node's credential. Errors come back in plain words. */
/** `credential` is genehApi (the data key), or genehBusinessApi for the business price call. */
export async function geneh(this: Ctx, method: IHttpRequestMethods, path: string, qs: IDataObject = {}, body?: IDataObject, credential: 'genehApi' | 'genehBusinessApi' = 'genehApi'): Promise<IDataObject> {
  const creds = await this.getCredentials(credential);
  const explain = credential === 'genehBusinessApi' ? businessErrorMessage : errorMessage;
  const baseURL = String(creds.baseUrl || 'https://api.geneh.app/v1').replace(/\/+$/, '');
  try {
    return (await this.helpers.httpRequestWithAuthentication.call(this, credential, {
      method,
      url: `${baseURL}${path}`,
      qs,
      body,
      json: true,
      headers: { 'User-Agent': 'n8n-nodes-geneh' },
    })) as IDataObject;
  } catch (error) {
    const e = error as { httpCode?: string; response?: { status?: number; data?: IDataObject }; cause?: { response?: { status?: number; data?: IDataObject } }; description?: string; context?: { data?: IDataObject } };
    const status = Number(e.httpCode ?? e.response?.status ?? e.cause?.response?.status ?? 0);
    const data = (e.response?.data ?? e.cause?.response?.data ?? e.context?.data) as { error?: string; message?: string } | undefined;
    if (status === 404 && method === 'DELETE') return {};
    throw new NodeApiError(this.getNode(), error as never, { message: status ? explain(status, data) : (e as Error).message, httpCode: status ? String(status) : undefined });
  }
}

export async function currencyOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const r = (await geneh.call(this, 'GET', '/rates/latest')) as { currencies: { currency: string }[] };
  return r.currencies.map((c) => ({ name: c.currency, value: c.currency.toLowerCase() }));
}

export async function bankOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const r = (await geneh.call(this, 'GET', '/banks')) as { banks: { id: string; type: string; name?: { en?: string } }[] };
  return r.banks.filter((b) => b.type === 'bank').map((b) => ({ name: b.name?.en ?? b.id, value: b.id }));
}
