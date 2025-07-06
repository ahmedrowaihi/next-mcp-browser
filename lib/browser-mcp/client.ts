import type { BrowserTransport, MCPMessage } from "./transport"

export interface ToolInfo {
  name: string
  description: string
  inputSchema: any
}

export interface ToolCallResult {
  content: Array<{
    type: "text"
    text: string
  }>
}

export class BrowserMCPClient {
  private transport: BrowserTransport
  private isInitialized = false
  private messageId = 1

  constructor(transport: BrowserTransport) {
    this.transport = transport
  }

  private getNextMessageId(): number {
    return this.messageId++
  }

  public async connect(): Promise<void> {
    await this.transport.connect()
    await this.initialize()
  }

  private async initialize(): Promise<void> {
    const message: MCPMessage = {
      jsonrpc: "2.0",
      id: this.getNextMessageId(),
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: {
          name: "browser-mcp-client",
          version: "1.0.0",
        },
      },
    }

    try {
      const result = await this.transport.send(message)
      this.isInitialized = true
      console.log("MCP Client initialized:", result)
    } catch (error) {
      throw new Error(`Failed to initialize MCP client: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  public async listTools(): Promise<ToolInfo[]> {
    if (!this.isInitialized) {
      throw new Error("Client not initialized")
    }

    const message: MCPMessage = {
      jsonrpc: "2.0",
      id: this.getNextMessageId(),
      method: "tools/list",
      params: {},
    }

    try {
      const result = await this.transport.send(message)
      return result.tools || []
    } catch (error) {
      throw new Error(`Failed to list tools: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  public async callTool(name: string, args: any): Promise<ToolCallResult> {
    if (!this.isInitialized) {
      throw new Error("Client not initialized")
    }

    const message: MCPMessage = {
      jsonrpc: "2.0",
      id: this.getNextMessageId(),
      method: "tools/call",
      params: {
        name,
        arguments: args,
      },
    }

    try {
      const result = await this.transport.send(message)
      return result
    } catch (error) {
      throw new Error(`Failed to call tool '${name}': ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  public async disconnect(): Promise<void> {
    this.transport.disconnect()
    this.isInitialized = false
  }
}
