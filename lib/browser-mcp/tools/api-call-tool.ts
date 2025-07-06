import { z } from "zod"

export const ApiCallToolSchema = z.object({
  url: z.string().url().describe("The URL to make the API call to"),
  method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET").describe("HTTP method"),
  headers: z.record(z.string()).optional().describe("HTTP headers"),
  body: z.string().optional().describe("Request body for POST/PUT requests"),
})

export type ApiCallToolInput = z.infer<typeof ApiCallToolSchema>

export interface ApiCallToolResult {
  content: Array<{
    type: "text"
    text: string
  }>
}

export function createApiCallTool() {
  return {
    name: "api_call",
    description: "Make an HTTP API call to the specified URL",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string" as const,
          format: "uri",
          description: "The URL to make the API call to",
        },
        method: {
          type: "string" as const,
          enum: ["GET", "POST", "PUT", "DELETE"],
          default: "GET",
          description: "HTTP method",
        },
        headers: {
          type: "object" as const,
          additionalProperties: { type: "string" as const },
          description: "HTTP headers",
        },
        body: {
          type: "string" as const,
          description: "Request body for POST/PUT requests",
        },
      },
      required: ["url"],
    },
    handler: async (args: ApiCallToolInput): Promise<ApiCallToolResult> => {
      const validatedArgs = ApiCallToolSchema.parse(args)
      try {
        const response = await fetch(validatedArgs.url, {
          method: validatedArgs.method,
          headers: {
            "Content-Type": "application/json",
            ...validatedArgs.headers,
          },
          body: validatedArgs.body,
        })
        const responseText = await response.text()
        let responseData
        try {
          responseData = JSON.parse(responseText)
        } catch {
          responseData = responseText
        }
        return {
          content: [
            {
              type: "text",
              text: `API Call Result:\nStatus: ${response.status} ${response.statusText}\nResponse: ${JSON.stringify(responseData, null, 2)}`,
            },
          ],
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `API Call Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
        }
      }
    },
  }
}
