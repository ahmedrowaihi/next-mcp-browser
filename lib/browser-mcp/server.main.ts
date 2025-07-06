import { BrowserTransport, MCPMessage } from "./transport"
import { BrowserMCPServerCore } from "./server-core"

export class BrowserMCPServerMain extends BrowserMCPServerCore {
  private transport: BrowserTransport

  constructor(transport: BrowserTransport) {
    super()
    this.transport = transport
    this.setupTransport()
  }

  private setupTransport(): void {
    const serverPort = this.transport.getServerPort()
    serverPort.onmessage = async (event: MessageEvent<MCPMessage>) => {
      const response = await this.handleMessage(event.data)
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