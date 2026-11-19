import type { IAuthenticateGeneric, ICredentialTestRequest, ICredentialType, INodeProperties } from 'n8n-workflow';

export class GenehApi implements ICredentialType {
  name = 'genehApi';
  displayName = 'Geneh API';
  icon = 'file:geneh.svg' as const;
  documentationUrl = 'https://geneh.app/en/developers';
  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Make a key on geneh.app under Developers, Keys. It starts with gk_live_.',
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
  test: ICredentialTestRequest = {
    request: { baseURL: '={{$credentials.baseUrl}}', url: '/usage' },
  };
}
