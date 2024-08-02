# Modelmetry SDK

The Modelmetry SDK provides a JS/TS interface to interact with the Modelmetry API, allowing developers to easily integrate Modelmetry's guardrails and observability features in their codebases.

## Getting Started

### Install

To get started with the Modelmetry SDK, you first need to install it. You can do this using pip:

```ts
npm install @modelmetry/sdk
```

### Quick Start

Here's a quick example to show you how to instantiate the SDK client and perform a check using the Modelmetry API. 

```ts
import { ModelmetryClient } from "../src/sdk"
import 'dotenv/config'


export const basicGuardrailExample = async () => {

  // replace these values with your own
  const TENANT_ID = "TENANT_ID"; // e.g., ten_acmelimited12
  const API_KEY = "API_KEY"; // e.g. "aDMd92dfn...dm29fj2f92"

  const modelmetry = new ModelmetryClient({
    tenantId: TENANT_ID,
    apikey: API_KEY,
  })

  const result = await modelmetry.guardrails().check("grd_jaohzgcbd5hbt1grwmvp", {
    Input: {
      Text: {
        Text: "I mean this is clearly a good thing, right?",
      },
    },
  })

  console.log(result)
  // Outputs:
  // GuardrailCheckResult {
  //   passed: true,
  //   errored: false,
  //   failed: false,
  //   outcome: 'pass'
  // }
}

await basicGuardrailExample();
```

### Examples

We will add more examples in the `./examples` directory.

### Authentication

To use the Modelmetry SDK, **you must authenticate using your tenant ID and API key**. You can find these in your Modelmetry settings.

When creating the `ModelmetryClient` instance, pass your `tenant_id` and `api_key` as shown in the *Quick Start* example above. These credentials will be used for all API calls made through the SDK client.

## About Modelmetry 🛡️

**Modelmetry provides advanced guardrails and monitoring for applications utilizing Large Language Models (LLMs).**

Modelmetry offers tools to prevent security threats, detect sensitive topics, filter offensive language, identify personally identifiable information (PII), and ensure the relevance and appropriateness of LLM outputs.

Modelmetry’s platform integrates with leading AI providers, allowing developers to customize evaluators for enhanced safety, quality, and compliance in their AI-driven solutions.