import type { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties, INodeType, INodeTypeDescription } from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { ACTIONS, actionRequest, flatMetal, flatRates, RANGES, RECEIVE } from '../../src/catalog.mjs';
import { bankOptions, currencyOptions, geneh } from '../shared';

const show = (keys: string[]) => ({ show: { operation: keys } });
const using = (param: string) => ACTIONS.filter((a) => a.params.includes(param)).map((a) => a.key);

const fields: INodeProperties[] = [
  {
    displayName: 'Currency Name or ID',
    name: 'currency',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'currencies' },
    default: 'usd',
    required: true,
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    displayOptions: show(using('currency')),
  },
  {
    displayName: 'Bank Name or ID',
    name: 'bank',
    type: 'options',
    typeOptions: { loadOptionsMethod: 'banks' },
    default: '',
    required: true,
    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
    displayOptions: show(['bank']),
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    default: 100,
    required: true,
    displayOptions: show(['convert']),
  },
  { displayName: 'From Currency', name: 'from', type: 'string', default: 'usd', required: true, description: 'A three-letter code. One side must be EGP.', displayOptions: show(['convert']) },
  { displayName: 'To Currency', name: 'to', type: 'string', default: 'egp', required: true, displayOptions: show(['convert']) },
  {
    displayName: 'Bank ID',
    name: 'rateBank',
    type: 'string',
    default: '',
    placeholder: 'nbe',
    description: 'Leave empty for the Central Bank rate',
    displayOptions: show(['convert', 'rate_history']),
  },
  {
    displayName: 'Range',
    name: 'range',
    type: 'options',
    options: RANGES.map((r) => ({ name: r, value: r })),
    default: '1m',
    displayOptions: show(['rate_history']),
  },
  { displayName: 'Sending From Country', name: 'country', type: 'string', default: '', placeholder: 'SA', description: 'A two-letter code', displayOptions: show(['transfer_quotes']) },
  { displayName: 'Sending Currency', name: 'send_currency', type: 'string', default: '', placeholder: 'SAR', displayOptions: show(['transfer_quotes']) },
  { displayName: 'Send Amount', name: 'sendAmount', type: 'number', default: 0, description: 'Leave at 0 for every amount', displayOptions: show(['transfer_quotes']) },
  {
    displayName: 'Receive As',
    name: 'receive',
    type: 'options',
    options: [{ name: 'Any', value: '' }, ...RECEIVE.map((r) => ({ name: r[0]!.toUpperCase() + r.slice(1), value: r }))],
    default: '',
    displayOptions: show(['transfer_quotes']),
  },
  {
    displayName: 'Simplify',
    name: 'simplify',
    type: 'boolean',
    default: true,
    description: 'Whether to return the best rates and prices as top-level fields instead of the raw answer',
    displayOptions: show(['currency_rates', 'gold', 'silver']),
  },
];

export class Geneh implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Geneh',
    name: 'geneh',
    icon: 'file:geneh.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Exchange rates, gold, silver, transfers and savings in Egypt',
    defaults: { name: 'Geneh' },
    usableAsTool: true,
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: 'genehApi', required: true }],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: ACTIONS.map((a) => ({ name: a.label, value: a.key, action: a.label, description: `${a.description}${a.plan === 'pro' ? ' Needs the Pro API plan or above.' : ''}` })),
        default: 'currency_rates',
      },
      ...fields,
    ],
  };

  methods = { loadOptions: { currencies: currencyOptions, banks: bankOptions } };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const out: INodeExecutionData[] = [];
    for (let i = 0; i < items.length; i++) {
      try {
        const key = this.getNodeParameter('operation', i) as string;
        const action = ACTIONS.find((a) => a.key === key)!;
        const p = (name: string, fallback: unknown = '') => (action.params.includes(name) || ['rateBank', 'sendAmount', 'simplify'].includes(name) ? this.getNodeParameter(name, i, fallback) : fallback);
        const input: Record<string, unknown> = {
          currency: p('currency'),
          bank: key === 'bank' ? p('bank') : p('rateBank') || (key === 'convert' ? 'cbe' : ''),
          amount: key === 'transfer_quotes' ? Number(p('sendAmount', 0)) || '' : p('amount'),
          from: p('from', 'usd'),
          to: p('to', 'egp'),
          range: p('range', '1m'),
          country: p('country'),
          send_currency: p('send_currency'),
          receive: p('receive'),
        };
        const { path, query } = actionRequest(action, input);
        const data = await geneh.call(this, 'GET', path, query);
        const simplify = ['currency_rates', 'gold', 'silver'].includes(key) && (p('simplify', true) as boolean);
        const json: IDataObject = simplify ? (key === 'currency_rates' ? flatRates(data) : flatMetal(data, key)) : data;
        out.push({ json, pairedItem: { item: i } });
      } catch (error) {
        if (this.continueOnFail()) {
          out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
          continue;
        }
        throw error;
      }
    }
    return [out];
  }
}
