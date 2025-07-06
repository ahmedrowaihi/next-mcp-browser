import type { MCPMessage } from "./transport"

export interface ToolInfo {
  name: string
  description: string
  inputSchema: any
}

export interface EchoToolResult {
  content: Array<{
    type: "text"
    text: string
  }>
}

export interface PingToolResult {
  content: Array<{
    type: "text"
    text: string
  }>
}

export interface ApiCallToolResult {
  content: Array<{
    type: "text"
    text: string
  }>
}

export interface ToolResultMap {
  echo: EchoToolResult
  ping: PingToolResult
  api_call: ApiCallToolResult
  [key: string]: unknown
}

export interface ToolCallResult<T = unknown> {
  content: Array<{
    type: "text"
    text: string
  }> & T[]
}

// Add a generic MCPTransport interface
export interface MCPTransport {
  connect(): Promise<void>
  send(message: MCPMessage): Promise<any>
  disconnect(): void
}

export class BrowserMCPClient {
  private transport: MCPTransport
  private isInitialized: boolean = false
  private messageId: number = 1

  constructor(transport: MCPTransport) {
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
    await this.transport.send(message)
    this.isInitialized = true
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
    const result: { tools?: ToolInfo[] } = await this.transport.send(message)
    return result.tools || []
  }

  // Overloads for known tools
  public async callTool(name: "echo", args: any): Promise<EchoToolResult>
  public async callTool(name: "ping", args: any): Promise<PingToolResult>
  public async callTool(name: "api_call", args: any): Promise<ApiCallToolResult>
  // Generic fallback
  public async callTool<T = unknown>(name: string, args: any): Promise<T>
  public async callTool<T = unknown>(name: string, args: any): Promise<T> {
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
    return await this.transport.send(message) as T
  }

  public async disconnect(): Promise<void> {
    this.transport.disconnect()
    this.isInitialized = false
  }
}
