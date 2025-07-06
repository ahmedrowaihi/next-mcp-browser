import type { MCPMessage } from "./transport"

export class BrowserMCPServerCore {
  private tools: Map<string, any>

  constructor(tools: Map<string, any>) {
    this.tools = tools
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