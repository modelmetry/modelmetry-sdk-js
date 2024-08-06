# Modelmetry SDK

The Modelmetry SDK provides a JS/TS interface to interact with the Modelmetry API, allowing developers to easily integrate Modelmetry's guardrails and observability features in their codebases.

## Getting Started

### Install

To get started with the Modelmetry SDK, you first need to install it. You can do this using pip:

```ts
npm install @modelmetry/sdk
```

### Examples

We recommend you look at the `./examples` directory for actual examples.

### Quick Start

Here's a quick example to show you how to instantiate the SDK client and perform a check using the Modelmetry API.

**Initialize the SDK**

```ts
import { ModelmetryClient } from "../src/sdk"
import 'dotenv/config'

const modelmetry = new ModelmetryClient({
  tenantId: process.env.TENANT_ID, // required
  apikey: process.env.API_KEY, // required
  baseUrl: HOST, // optional
})

```

**Perform a guardrail check**

```ts
export const basicGuardrailExample = async () => {

  const response = await openai.chat.completions.create({ max_tokens: 500, model, messages });
  const responseText = jokeResponse.choices[0].message.content;
  const result = await modelmetry.guardrails().check("grd_jaohzgcbd5hbt1grwmvp", {
    Input: {
      Text: {
        Text: responseText,
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

**Use observability**

```ts

fastify.get("/joke", async function handler(request, reply) {
  // create a new trace
  const trace = modelmetry.observability().newTrace("get-joke");

  try {
    // child span for the first task
    const spanTask1 = trace.span("task-1", "other", {});
    const stuff = await runTheFirstTask();
    spanTask1.end();

    // child span for the second task, this time we pass the trace to the task
    // so that it can create a child span itself
    const secondStuff = await runTheSecondTask(stuff, trace);
    
    reply.send({ secondStuff });
  } catch (err) {
    reply
      .status(500)
      .send({ error: "Failed to fetch joke", message: err.message });
  } finally {
    trace.end();
  }
});

function runTheSecondTask(stuff, trace) {
  // this time, use a callback to create a child span's scope,
  // and it will end automatically when the callback returns
  return trace.startSpan("task-2", "other", async (span) => {
    span.setAttribute("user", "user-123");
    span.setAttribute("stuff", stuff);
    // do something
    return "second stuff";
  });
}
```

### Authentication

To use the Modelmetry SDK, **you must authenticate using your tenant ID and API key**. You can find these in your Modelmetry settings.

When creating the `ModelmetryClient` instance, pass your `tenant_id` and `api_key` as shown in the *Quick Start* example above. These credentials will be used for all API calls made through the SDK client.

## About Modelmetry 🛡️

**Modelmetry provides advanced guardrails and monitoring for applications utilizing Large Language Models (LLMs).**

Modelmetry offers tools to prevent security threats, detect sensitive topics, filter offensive language, identify personally identifiable information (PII), and ensure the relevance and appropriateness of LLM outputs.

Modelmetry’s platform integrates with leading AI providers, allowing developers to customize evaluators for enhanced safety, quality, and compliance in their AI-driven solutions.