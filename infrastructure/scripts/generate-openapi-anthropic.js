import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const md = fs.readFileSync("docs/api/query-contract.md", "utf-8");

const prompt = `
You are an expert OpenAPI 3.0 generator.

Convert the following API documentation into a VALID OpenAPI 3.0.3 YAML file.

STRICT RULES:
- Do NOT invent endpoints
- Use proper schemas
- Avoid oneOf/anyOf unless necessary
- Ensure Spectral-compatible structure
- Output ONLY valid YAML (no markdown fences, no explanations)

INPUT:
${md}
`;

async function run() {
  const response = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",   // ✅ best stable Claude model
    max_tokens: 4000,
    temperature: 0,
    system: "You generate clean OpenAPI specs.",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const yaml = response.content[0].text;

  fs.writeFileSync("docs/api/openapi.generated.yaml", yaml);

  console.log("✅ OpenAPI generated (Claude)");
}

run();