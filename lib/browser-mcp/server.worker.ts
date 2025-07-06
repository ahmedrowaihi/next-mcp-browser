import { BrowserMCPServerCore } from "./server-core";

class BrowserMCPServerWorker extends BrowserMCPServerCore {
  constructor() {
    super()
  }
}

const server = new BrowserMCPServerWorker()

server.registerDefaultTools()

self.onmessage = async (event: MessageEvent) => {
    const response = await server.handleMessage(event.data)
    self.postMessage(response)
}
