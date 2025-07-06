import { z } from "zod"

export const EchoToolSchema = z.object({
  message: z.string().describe("The message to echo back"),
})

export type EchoToolInput = z.infer<typeof EchoToolSchema>

export interface EchoToolResult {
  content: Array<{
    type: "text"
    text: string
  }>
}

export function createEchoTool() {
  return {
    name: "echo",
    description: "Echo back the provided message",
    inputSchema: {
      type: "object" as const,
      properties: {
        message: {
          type: "string" as const,
          description: "The message to echo back",
        },
      },
      required: ["message"],
    },
    handler: async (args: EchoToolInput): Promise<EchoToolResult> => {
      const validatedArgs = EchoToolSchema.parse(args)

      return {
        content: [
          {
            type: "text",
            text: `Echo: ${validatedArgs.message}`,
          },
        ],
      }
    },
  }
}
