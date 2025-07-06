import type { MCPMessage } from "./transport"

export class BrowserMCPServerCore {
  private tools: Map<string, any> = new Map()

  public registerTool(name: string, tool: any): void {
    this.tools.set(name, tool)
  }

  public async registerDefaultTools(toolNames: string[] = ["echo", "ping", "api_call"]): Promise<void> {
    for (const name of toolNames) {
      if (name === "echo") {
        const { createEchoTool } = await import("./tools/echo-tool")
        this.registerTool("echo", createEchoTool())
      } else if (name === "ping") {
        const { createPingTool } = await import("./tools/ping-tool")
        this.registerTool("ping", createPingTool())
      } else if (name === "api_call") {
        const { createApiCallTool } = await import("./tools/api-call-tool")
        this.registerTool("api_call", createApiCallTool())
      }
    }
  }

  public async handleMessage(message: MCPMessage): Promise<MCPMessage> {
    try {
      let response: MCPMessage

      if (message.method === "initialize") {
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2025-03-26",
            capabilities: { tools: {} },
            serverInfo: { name: "browser-mcp-server", version: "1.0.0" }
          }
        }
      } else if (message.method === "tools/list") {
        const tools = Array.from(this.tools.values()).map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        }))
        response = {
          jsonrpc: "2.0",
          id: message.id,
          result: { tools },
        }
      } else if (message.method === "tools/call") {
        const { name, arguments: args } = message.params
        const tool = this.tools.get(name)
        if (!tool) {
          response = {
            jsonrpc: "2.0",
            id: message.id,
            error: {
              code: -32601,
              message: `Tool '${name}' not found`,
            },
          }
        } else {
          try {
            const result = await tool.handler(args)
            response = {
              jsonrpc: "2.0",
              id: message.id,
              result,
            }
          } catch (error) {
            response = {
              jsonrpc: "2.0",
              id: message.id,
              error: {
                code: -32603,
                message: `Tool execution failed: ${error instanceof Error ? error.message : "Unknown error"}`,
              },
            }
          }
        }
      } else {
        response = {
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32601,
            message: `Method '${message.method}' not found`,
          },
        }
      }
      return response
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: message.id,
        error: {
          code: -32603,
          message: `Internal error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      }
    }
  }
} 