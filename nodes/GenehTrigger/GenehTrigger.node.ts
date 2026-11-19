import { createHmac } from 'node:crypto';
import type { IDataObject, IHookFunctions, INodeType, INodeTypeDescription, IWebhookFunctions, IWebhookResponseData } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { DIRECTIONS, EVENTS, flatten, SIDES, verifySignature, webhookBody } from '../../src/catalog.mjs';
import { bankOptions, currencyOptions, geneh } from '../shared';

const hmac = (secret: string, text: string) => createHmac('sha256', secret).update(text).digest('hex');
const withFilter = (f: 'currency' | 'bank' | 'threshold') => EVENTS.filter((e) => e.filters.includes(f)).map((e) => e.type);

/**
 * Starts a workflow when Geneh sends an event. Activating the workflow adds a Geneh webhook pointing at this node,
 * deactivating removes it. Each delivery is checked against the webhook's signing secret. Webhooks come with the
 * Pro API plan and above.
 */
export class GenehTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Geneh Trigger',
    name: 'genehTrigger',
    icon: 'file:geneh.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Starts the workflow when rates, gold or savings change in Egypt',
    defaults: { name: 'Geneh Trigger' },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: 'genehApi', required: true }],
    webhooks: [{ name: 'default', httpMethod: 'POST', responseMode: 'onReceived', path: 'webhook' }],
    properties: [
      {
        displayName: 'Webhooks come with the Pro API plan and above. Each active workflow uses one of your plan\'s webhooks.',
        name: 'notice',
        type: 'notice',
        default: '',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        required: true,
        default: 'rate.best_changed',
        options: EVENTS.map((e) => ({ name: e.label, value: e.type, description: e.description })),
      },
      {
        displayName: 'Currency Names or IDs',
        name: 'currencies',
        type: 'multiOptions',
        typeOptions: { loadOptionsMethod: 'currencies' },
        default: [],
        description: 'Leave empty for every currency. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        displayOptions: { show: { event: withFilter('currency') } },
      },
      {
        displayName: 'Bank Names or IDs',
        name: 'banks',
        type: 'multiOptions',
        typeOptions: { loadOptionsMethod: 'banks' },
        default: [],
        description: 'Leave empty for every bank. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        displayOptions: { show: { event: withFilter('bank') } },
      },
      {
        displayName: 'Currency Name or ID',
        name: 'alertCurrency',
        type: 'options',
        typeOptions: { loadOptionsMethod: 'currencies' },
        default: 'usd',
        required: true,
        description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
        displayOptions: { show: { event: ['rate.threshold_crossed'] } },
      },
      {
        displayName: 'Price',
        name: 'side',
        type: 'options',
        options: SIDES.map((s) => ({ name: s.label, value: s.value })),
        default: 'sell',
        displayOptions: { show: { event: ['rate.threshold_crossed'] } },
      },
      {
        displayName: 'When It',
        name: 'direction',
        type: 'options',
        options: DIRECTIONS.map((d) => ({ name: d.label, value: d.value })),
        default: 'below',
        displayOptions: { show: { event: ['rate.threshold_crossed'] } },
      },
      {
        displayName: 'Price in Egyptian Pounds',
        name: 'price',
        type: 'number',
        typeOptions: { minValue: 0, numberPrecision: 4 },
        default: 0,
        required: true,
        displayOptions: { show: { event: ['rate.threshold_crossed'] } },
      },
      {
        displayName: 'Bank ID',
        name: 'alertBank',
        type: 'string',
        default: '',
        placeholder: 'nbe',
        description: 'Leave empty to watch the best rate across banks',
        displayOptions: { show: { event: ['rate.threshold_crossed'] } },
      },
    ],
  };

  methods = { loadOptions: { currencies: currencyOptions, banks: bankOptions } };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const data = this.getWorkflowStaticData('node');
        if (!data.webhookId) return false;
        const list = (await geneh.call(this, 'GET', '/webhooks')) as { items?: { id: string; url: string }[] };
        const url = this.getNodeWebhookUrl('default');
        if (list.items?.some((w) => w.id === data.webhookId && w.url === url)) return true;
        delete data.webhookId;
        delete data.secret;
        return false;
      },
      async create(this: IHookFunctions): Promise<boolean> {
        const event = this.getNodeParameter('event') as string;
        const label = EVENTS.find((e) => e.type === event)?.label ?? event;
        const alert = event === 'rate.threshold_crossed';
        const input = alert
          ? { currency: this.getNodeParameter('alertCurrency'), side: this.getNodeParameter('side'), direction: this.getNodeParameter('direction'), price: this.getNodeParameter('price'), bank: this.getNodeParameter('alertBank', '') }
          : { currency: this.getNodeParameter('currencies', []), bank: this.getNodeParameter('banks', []) };
        const body = webhookBody(event, this.getNodeWebhookUrl('default')!, input as never, `n8n: ${label}`);
        const made = (await geneh.call(this, 'POST', '/webhooks', {}, body as IDataObject)) as { id: string; secret: string };
        const data = this.getWorkflowStaticData('node');
        data.webhookId = made.id;
        data.secret = made.secret;
        return true;
      },
      async delete(this: IHookFunctions): Promise<boolean> {
        const data = this.getWorkflowStaticData('node');
        if (data.webhookId) await geneh.call(this, 'DELETE', `/webhooks/${encodeURIComponent(String(data.webhookId))}`);
        delete data.webhookId;
        delete data.secret;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const req = this.getRequestObject();
    const secret = this.getWorkflowStaticData('node').secret as string | undefined;
    const raw = (req as unknown as { rawBody?: Buffer | string }).rawBody;
    const text = Buffer.isBuffer(raw) ? raw.toString('utf8') : typeof raw === 'string' ? raw : JSON.stringify(req.body);
    const sig = this.getHeaderData()['geneh-signature'] as string | undefined;
    if (!secret || !verifySignature(sig, text, secret, hmac)) {
      const res = this.getResponseObject();
      res.status(401).json({ error: 'bad_signature' });
      return { noWebhookResponse: true };
    }
    const body = this.getBodyData() as IDataObject;
    if (body.type !== this.getNodeParameter('event')) return { webhookResponse: 'ignored' };
    return { workflowData: [this.helpers.returnJsonArray([flatten(body) as IDataObject])] };
  }
}
