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

// n8n/credentials/GenehApi.credentials.ts
var GenehApi_credentials_exports = {};
__export(GenehApi_credentials_exports, {
  GenehApi: () => GenehApi
});
module.exports = __toCommonJS(GenehApi_credentials_exports);
var GenehApi = class {
  name = "genehApi";
  displayName = "Geneh API";
  icon = "file:geneh.svg";
  documentationUrl = "https://geneh.app/en/developers";
  properties = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description: "Make a key on geneh.app under Developers, Keys. It starts with gk_live_."
    },
    {
      displayName: "API URL",
      name: "baseUrl",
      type: "string",
      default: "https://api.geneh.app/v1",
      description: "Leave as it is unless Geneh support gives you another address"
    }
  ];
  authenticate = {
    type: "generic",
    properties: { headers: { Authorization: "=Bearer {{$credentials.apiKey}}" } }
  };
  test = {
    request: { baseURL: "={{$credentials.baseUrl}}", url: "/usage" }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GenehApi
});
