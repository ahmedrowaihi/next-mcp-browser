import { BrowserMCPServerCore } from "./server-core"
import { createApiCallTool } from "./tools/api-call-tool"
import { createEchoTool } from "./tools/echo-tool"
import { createPingTool } from "./tools/ping-tool"
import type { MCPMessage } from "./transport"

const tools = new Map()
tools.set("echo", createEchoTool())
tools.set("ping", createPingTool())
tools.set("api_call", createApiCallTool())

const core = new BrowserMCPServerCore(tools)

;(self as any).onmessage = async (event: MessageEvent) => {
  if (event.data && event.data.method === "isWorker") {
    ;(self as any).postMessage({ result: "yes, this is the worker!" })
    return
  }
  const response = await core.handleMessage(event.data)
  ;(self as any).postMessage(response)
} 