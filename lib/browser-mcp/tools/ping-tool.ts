import { z } from "zod"

export const PingToolSchema = z.object({
  target: z.string().optional().describe("Optional target to ping"),
})

export type PingToolInput = z.infer<typeof PingToolSchema>

export interface PingToolResult {
  content: Array<{
    type: "text"
    text: string
  }>
}

export function createPingTool() {
  return {
    name: "ping",
    description: "Send a ping and receive a pong response",
    inputSchema: {
      type: "object" as const,
      properties: {
        target: {
          type: "string" as const,
          description: "Optional target to ping",
        },
      },
      required: [],
    },
    handler: async (args: PingToolInput): Promise<PingToolResult> => {
      const validatedArgs = PingToolSchema.parse(args)
      const target = validatedArgs.target || "server"

      return {
        content: [
          {
            type: "text",
            text: `Pong from ${target}! (Response time: ${Date.now() % 1000}ms)`,
          },
        ],
      }
    },
  }
}
