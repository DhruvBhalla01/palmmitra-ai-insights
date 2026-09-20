type AiMessage = {
  role: string;
  content: unknown;
};

export interface AiCaptureContext {
  sessionId: string;
  traceId: string;
}

interface AiGeneration {
  context: AiCaptureContext;
  spanName: string;
  model: string;
  input: AiMessage[];
  output: string;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  stream?: boolean;
  distinctId?: string;
}

function getPostHogConfig() {
  const apiKey = Deno.env.get("POSTHOG_API_KEY");
  const host = Deno.env.get("POSTHOG_HOST");

  if (apiKey && host) return { apiKey, host };

  if (!Deno.env.get("DENO_DEPLOYMENT_ID")) {
    const missingVariable = !apiKey ? "POSTHOG_API_KEY" : "POSTHOG_HOST";
    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    );
  }

  return null;
}

export async function captureAiGeneration({
  context,
  spanName,
  model,
  input,
  output,
  latencyMs,
  inputTokens,
  outputTokens,
  stream,
  distinctId,
}: AiGeneration) {
  const config = getPostHogConfig();
  if (!config) return;

  try {
    await fetch(`${config.host.replace(/\/$/, "")}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.apiKey,
        event: "$ai_generation",
        properties: {
          distinct_id: distinctId ?? `ai-session-${context.sessionId}`,
          $ai_trace_id: context.traceId,
          $ai_session_id: context.sessionId,
          $ai_span_name: spanName,
          $ai_model: model,
          $ai_provider: "openai",
          $ai_input: input,
          $ai_output_choices: [{ role: "assistant", content: output }],
          $ai_input_tokens: inputTokens,
          $ai_output_tokens: outputTokens,
          $ai_latency: latencyMs / 1000,
          $ai_stream: stream,
        },
      }),
    });
  } catch (error) {
    console.error("PostHog AI generation capture failed", error);
  }
}
