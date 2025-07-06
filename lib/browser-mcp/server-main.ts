import { BrowserTransport, MCPMessage } from "./transport"
import { createApiCallTool } from "./tools/api-call-tool"
import { createEchoTool } from "./tools/echo-tool"
import { createPingTool } from "./tools/ping-tool"
import { BrowserMCPServerCore } from "./server-core"

export class BrowserMCPServerMain {
  private transport: BrowserTransport
  private core: BrowserMCPServerCore
  private tools: Map<string, any>

  constructor(transport: BrowserTransport) {
    this.transport = transport
    this.tools = new Map()
    this.setupTools()
    this.core = new BrowserMCPServerCore(this.tools)
    this.setupTransport()
  }

  private setupTools(): void {
    this.tools.set("echo", createEchoTool())
    this.tools.set("ping", createPingTool())
    this.tools.set("api_call", createApiCallTool())
  }

  private setupTransport(): void {
    const serverPort = this.transport.getServerPort()
    serverPort.onmessage = async (event: MessageEvent<MCPMessage>) => {
      const response = await this.core.handleMessage(event.data)
      serverPort.postMessage(response)
    }
  }

  public async start(): Promise<void> {
    await this.transport.connect()
  }

  public async stop(): Promise<void> {
    this.transport.disconnect()
  }
} 