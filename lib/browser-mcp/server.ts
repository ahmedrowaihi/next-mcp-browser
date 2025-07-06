import type { BrowserTransport, MCPMessage } from "./transport"
import { createApiCallTool } from "./tools/api-call-tool"
import { createEchoTool } from "./tools/echo-tool"
import { createPingTool } from "./tools/ping-tool"

export class BrowserMCPServer {
  private transport: BrowserTransport
  private tools: Map<string, any> = new Map()

  constructor(transport: BrowserTransport) {
    this.transport = transport
    this.setupTools()
    this.setupTransport()
  }

  private setupTools(): void {
    // Register tools
    const echoTool = createEchoTool()
    const pingTool = createPingTool()
    const apiCallTool = createApiCallTool()

    this.tools.set("echo", echoTool)
    this.tools.set("ping", pingTool)
    this.tools.set("api_call", apiCallTool)
  }

  private setupTransport(): void {
    const serverPort = this.transport.getServerPort()

    serverPort.onmessage = async (event: MessageEvent<MCPMessage>) => {
      const message = event.data

      try {
        let response: MCPMessage

        if (message.method === "initialize") {
          response = {
            jsonrpc: "2.0",
            id: message.id,
            result: {
              protocolVersion: "2025-03-26",
              capabilities: {
                tools: {},
              },
              serverInfo: {
                name: "browser-mcp-server",
                version: "1.0.0",
              },
            },
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

        serverPort.postMessage(response)
      } catch (error) {
        const errorResponse: MCPMessage = {
          jsonrpc: "2.0",
          id: message.id,
          error: {
            code: -32603,
            message: `Internal error: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        }
        serverPort.postMessage(errorResponse)
      }
    }
  }

  public async start(): Promise<void> {
    await this.transport.connect()
    console.log("Browser MCP Server started")
  }

  public async stop(): Promise<void> {
    this.transport.disconnect()
    console.log("Browser MCP Server stopped")
  }
}
