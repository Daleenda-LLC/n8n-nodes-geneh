# n8n-nodes-geneh

Geneh for [n8n](https://n8n.io): exchange rates, gold, silver, money transfers and savings in Egypt.

## Install

In n8n, open Settings, Community nodes, Install, and enter `n8n-nodes-geneh`. On a self-hosted n8n you can also run
`npm install n8n-nodes-geneh` in `~/.n8n/nodes`.

## Credentials

Make an API key on [geneh.app under Developers, Keys](https://geneh.app/en/developers/keys) and add a Geneh API
credential with it. The Free plan covers currency rates and gold.

## Nodes

**Geneh Trigger** starts a workflow when Geneh sends an event: best rate changed, a price alert below or above a
price you set, a bank rate updated, the Central Bank rate changed, gold or silver prices updated, transfer prices
updated, a new certificate or a certificate rate change, a treasury bill auction result, a fund price update, or
prices delayed. Activating the workflow adds a Geneh webhook and deactivating it removes it. Every delivery is
checked against its signing secret. Webhooks come with the Pro API plan and above.

**Geneh** gets data: currency rates, all currencies, convert money, rate history, gold, silver, one bank, transfer
prices, certificates, treasury bills and investment funds. It can also be used as a tool by n8n AI agents.

More at [geneh.app/en/developers](https://geneh.app/en/developers).

## About this repository

This repository holds the published build of the node. Each release is published to npm from GitHub Actions with
provenance. Report problems in the Issues tab here.
