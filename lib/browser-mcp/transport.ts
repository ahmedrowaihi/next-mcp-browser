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
  private readonly channel: MessageChannel
  private readonly serverPort: MessagePort
  private readonly clientPort: MessagePort
  private readonly messageHandlers: Map<string | number, (message: MCPMessage) => void> = new Map()
  private readonly notificationHandlers: Map<string, (params: any) => void> = new Map()
  private isConnected: boolean = false

  constructor() {
    this.channel = new MessageChannel()
    this.serverPort = this.channel.port1
    this.clientPort = this.channel.port2
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.clientPort.onmessage = (event: MessageEvent<MCPMessage>): void => {
      const message = event.data
      if (message.id !== undefined) {
        const handler = this.messageHandlers.get(message.id)
        if (handler) {
          handler(message)
          this.messageHandlers.delete(message.id)
        }
      } else if (message.method) {
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

  public async send<T = any>(message: MCPMessage): Promise<T> {
    if (!this.isConnected) {
      throw new Error("Transport not connected")
    }
    return new Promise<T>((resolve, reject) => {
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
        resolve(undefined as T)
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

export class WorkerTransport {
  private readonly worker: Worker
  private readonly messageHandlers: Map<string | number, (message: MCPMessage) => void> = new Map()
  private readonly notificationHandlers: Map<string, (params: any) => void> = new Map()
  private isConnected: boolean = false

  constructor(worker: Worker) {
    this.worker = worker
    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.worker.onmessage = (event: MessageEvent): void => {
      const message: MCPMessage = event.data
      if (message.id !== undefined) {
        const handler = this.messageHandlers.get(message.id)
        if (handler) {
          handler(message)
          this.messageHandlers.delete(message.id)
        }
      } else if (message.method) {
        const handler = this.notificationHandlers.get(message.method)
        if (handler) {
          handler(message.params)
        }
      }
    }
  }

  public async connect(): Promise<void> {
    this.isConnected = true
  }

  public async send<T = any>(message: MCPMessage): Promise<T> {
    if (!this.isConnected) {
      throw new Error("Transport not connected")
    }
    return new Promise<T>((resolve, reject) => {
      if (message.id !== undefined) {
        this.messageHandlers.set(message.id, (response) => {
          if (response.error) {
            reject(new Error(response.error.message))
          } else {
            resolve(response.result)
          }
        })
      }
      this.worker.postMessage(message)
      if (message.id === undefined) {
        resolve(undefined as T)
      }
    })
  }

  public onNotification(method: string, handler: (params: any) => void): void {
    this.notificationHandlers.set(method, handler)
  }

  public disconnect(): void {
    this.worker.terminate()
    this.isConnected = false
  }
}
