import type { IAuthenticateGeneric, ICredentialType, INodeProperties } from 'n8n-workflow';

/** The key a claimed business sends its own prices with. A different key from the data API key in Geneh API. */
export class GenehBusinessApi implements ICredentialType {
  name = 'genehBusinessApi';
  displayName = 'Geneh Business API';
  icon = { light: 'file:geneh.svg', dark: 'file:geneh.dark.svg' } as const;
  documentationUrl = 'https://geneh.app/en/developers';
  properties: INodeProperties[] = [
    {
      displayName: 'Business Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Make a business key in your Geneh business account with the prices:write scope. It starts with gb_live_.',
    },
    {
      displayName: 'API URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://api.geneh.app/v1',
      description: 'Leave as it is unless Geneh support gives you another address',
    },
  ];
  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: { headers: { Authorization: '=Bearer {{$credentials.apiKey}}' } },
  };
}
