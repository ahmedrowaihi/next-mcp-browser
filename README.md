# Mcp browser project

**This project is an experiment in implementing a browser transport protocol.**

## Overview

This repository contains the browser MCP module and related logic for your project.

## Browser MCP Module Structure

All browser MCP-related logic is grouped under `lib/browser-mcp/` for clarity and maintainability.

**Structure:**

```
lib/
  browser-mcp/
    client.ts         # Browser MCP client logic
    server-core.ts    # Shared, environment-agnostic server logic
    server.main.ts    # Main-thread server implementation
    server.worker.ts  # Web Worker server entry point
    tools/            # Built-in MCP tools
      api-call-tool.ts
      echo-tool.ts
      ping-tool.ts
    transport.ts      # Browser and worker transport implementations
    use-mcp.ts        # React hook for MCP system (useMCP)

```

## MCP Protocol Flow

### Main Thread Mode

```mermaid
sequenceDiagram
  participant Client as "Client"
  participant Transport as "BrowserTransport"
  participant Server as "MCP Server (Main Thread)"
  participant Tool as "Tool"

  Client->>Transport: send(tool call)
  Transport->>Server: deliver
  Server->>Tool: handle
  Tool-->>Server: result
  Server-->>Transport: result
  Transport-->>Client: result
```

### Worker Thread Mode

```mermaid
sequenceDiagram
  participant Client as "Client"
  participant Transport as "WorkerTransport"
  participant Worker as "Web Worker"
  participant Server as "MCP Server (Worker)"
  participant Tool as "Tool"

  Client->>Transport: send(tool call)
  Transport->>Worker: postMessage
  Worker->>Server: deliver
  Server->>Tool: handle
  Tool-->>Server: result
  Server-->>Worker: result
  Worker-->>Transport: message
  Transport-->>Client: result
```

For more details, see the code in `lib/browser-mcp/`.
