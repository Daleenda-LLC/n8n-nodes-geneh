# n8n-nodes-geneh

Geneh for [n8n](https://n8n.io): exchange rates, gold, silver, money transfers and savings in Egypt.

## Install

In n8n, open Settings, Community nodes, Install, and enter `n8n-nodes-geneh`. On a self-hosted n8n you can also run
`npm install n8n-nodes-geneh` in `~/.n8n/nodes`.

## Credentials

Make an API key on [geneh.app under Developers, Keys](https://geneh.app/en/developers/keys) and add a Geneh API
credential with it. The Free plan covers currency rates and gold.

To send your own prices as a claimed business, make a business key (it starts with `gb_live_` and needs the
`prices:write` scope) and add a Geneh Business API credential with it. The data key does not work for this.

## Nodes

**Geneh Trigger** starts a workflow when Geneh sends an event: best rate changed, a price alert below or above a
price you set, a bank rate updated, the Central Bank rate changed, gold or silver prices updated, transfer prices
updated, a new certificate or a certificate rate change, a treasury bill auction result, a fund price update, or
prices delayed. Activating the workflow adds a Geneh webhook and deactivating it removes it. Every delivery is
checked against its signing secret. Webhooks come with the Pro API plan and above.

**Geneh** gets data: currency rates, all currencies, convert money, rate history, gold, silver, one bank, transfer
prices, certificates, treasury bills and investment funds. It can also be used as a tool by n8n AI agents.

**Send Prices to Geneh** sends your business prices: a branch (default `main`) and rows of instrument, buy and sell.
Prices can be typed with Arabic digits, and a row may have only a buy or only a sell price.

More at [geneh.app/en/developers](https://geneh.app/en/developers).
