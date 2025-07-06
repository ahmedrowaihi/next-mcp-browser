"use client"

import { useState, useCallback, useRef } from "react"
import { BrowserTransport } from "./transport"
import { BrowserMCPServer } from "./server"
import { BrowserMCPClient, type ToolInfo, type ToolCallResult } from "./client"

export interface LogEntry {
  timestamp: string
  message: string
  type: "info" | "error" | "success"
}

export function useMCPSystem() {
  const [isServerRunning, setIsServerRunning] = useState(false)
  const [isClientConnected, setIsClientConnected] = useState(false)
  const [tools, setTools] = useState<ToolInfo[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])

  const transportRef = useRef<BrowserTransport | null>(null)
  const serverRef = useRef<BrowserMCPServer | null>(null)
  const clientRef = useRef<BrowserMCPClient | null>(null)

  const addLog = useCallback((message: string, type: LogEntry["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, { timestamp, message, type }])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  const startServer = useCallback(async () => {
    try {
      addLog("Starting MCP Server...")
      transportRef.current = new BrowserTransport()
      serverRef.current = new BrowserMCPServer(transportRef.current)
      await serverRef.current.start()
      setIsServerRunning(true)
      addLog("MCP Server started successfully", "success")
    } catch (error) {
      addLog(`Failed to start server: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    }
  }, [addLog])

  const stopServer = useCallback(async () => {
    try {
      if (isClientConnected && clientRef.current) {
        await clientRef.current.disconnect()
        setIsClientConnected(false)
      }

      addLog("Stopping MCP Server...")
      if (serverRef.current) {
        await serverRef.current.stop()
      }
      serverRef.current = null
      transportRef.current = null
      setIsServerRunning(false)
      setTools([])
      addLog("MCP Server stopped", "success")
    } catch (error) {
      addLog(`Failed to stop server: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    }
  }, [isClientConnected, addLog])

  const connectClient = useCallback(async () => {
    try {
      if (!transportRef.current) {
        throw new Error("No transport available")
      }

      addLog("Connecting MCP Client...")
      clientRef.current = new BrowserMCPClient(transportRef.current)
      await clientRef.current.connect()
      setIsClientConnected(true)
      addLog("MCP Client connected successfully", "success")
    } catch (error) {
      addLog(`Failed to connect client: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    }
  }, [addLog])

  const disconnectClient = useCallback(async () => {
    try {
      addLog("Disconnecting MCP Client...")
      if (clientRef.current) {
        await clientRef.current.disconnect()
      }
      clientRef.current = null
      setIsClientConnected(false)
      setTools([])
      addLog("MCP Client disconnected", "success")
    } catch (error) {
      addLog(`Failed to disconnect client: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
    }
  }, [addLog])

  const listTools = useCallback(async () => {
    try {
      if (!clientRef.current) {
        throw new Error("Client not connected")
      }
      addLog("Listing available tools...")
      const availableTools = await clientRef.current.listTools()
      setTools(availableTools)
      addLog(`Found ${availableTools.length} tools`, "success")
      return availableTools
    } catch (error) {
      addLog(`Failed to list tools: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
      return []
    }
  }, [addLog])

  const callTool = useCallback(
    async (name: string, args: any): Promise<ToolCallResult | null> => {
      try {
        if (!clientRef.current) {
          throw new Error("Client not connected")
        }
        addLog(`Calling tool '${name}' with args: ${JSON.stringify(args)}`)
        const result = await clientRef.current.callTool(name, args)
        addLog(`Tool '${name}' executed successfully`, "success")
        return result
      } catch (error) {
        addLog(`Tool '${name}' execution failed: ${error instanceof Error ? error.message : "Unknown error"}`, "error")
        return null
      }
    },
    [addLog],
  )

  return {
    isServerRunning,
    isClientConnected,
    tools,
    logs,
    startServer,
    stopServer,
    connectClient,
    disconnectClient,
    listTools,
    callTool,
    clearLogs,
  }
}
