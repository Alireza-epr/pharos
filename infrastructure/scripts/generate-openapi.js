import fs from "fs";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
- Output ONLY valid YAML (no markdown fences)

INPUT:
${md}
`;

const response = await client.chat.completions.create({
  model: "gpt-4.1",   // or GPT-5 chat if available in your env
  messages: [
    { role: "system", content: "You generate clean OpenAPI specs." },
    { role: "user", content: prompt },
  ],
  temperature: 0,
});

const yaml = response.choices[0].message.content;

fs.writeFileSync("docs/api/openapi.generated.yaml", yaml);

console.log("✅ OpenAPI generated");
``