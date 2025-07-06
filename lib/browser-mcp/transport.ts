export interface MCPMessage {
  jsonrpc: "2.0"
  id?: string | number
  method?: string
  params?: any
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

export class BrowserTransport {
  private channel: MessageChannel
  private serverPort: MessagePort
  private clientPort: MessagePort
  private messageHandlers: Map<string | number, (message: MCPMessage) => void> = new Map()
  private notificationHandlers: Map<string, (params: any) => void> = new Map()
  private isConnected = false

  constructor() {
    this.channel = new MessageChannel()
    this.serverPort = this.channel.port1
    this.clientPort = this.channel.port2

    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.clientPort.onmessage = (event: MessageEvent<MCPMessage>) => {
      const message = event.data

      if (message.id !== undefined) {
        // Handle response
        const handler = this.messageHandlers.get(message.id)
        if (handler) {
          handler(message)
          this.messageHandlers.delete(message.id)
        }
      } else if (message.method) {
        // Handle notification
        const handler = this.notificationHandlers.get(message.method)
        if (handler) {
          handler(message.params)
        }
      }
    }
  }

  public getServerPort(): MessagePort {
    return this.serverPort
  }

  public getClientPort(): MessagePort {
    return this.clientPort
  }

  public async connect(): Promise<void> {
    this.clientPort.start()
    this.serverPort.start()
    this.isConnected = true
  }

  public async send(message: MCPMessage): Promise<any> {
    if (!this.isConnected) {
      throw new Error("Transport not connected")
    }

    return new Promise((resolve, reject) => {
      if (message.id !== undefined) {
        this.messageHandlers.set(message.id, (response) => {
          if (response.error) {
            reject(new Error(response.error.message))
          } else {
            resolve(response.result)
          }
        })
      }

      this.clientPort.postMessage(message)

      if (message.id === undefined) {
        // Notification, resolve immediately
        resolve(undefined)
      }
    })
  }

  public onNotification(method: string, handler: (params: any) => void): void {
    this.notificationHandlers.set(method, handler)
  }

  public disconnect(): void {
    this.clientPort.close()
    this.serverPort.close()
    this.isConnected = false
  }
}
