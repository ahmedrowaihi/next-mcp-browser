# Mcp browser project

**This project is an experiment in implementing a browser transport protocol.**

## Overview

This repository contains the browser MCP module and related UI for your project.

## Browser MCP Module Structure

All browser MCP-related logic and UI are now grouped under `lib/browser-mcp/` for clarity and maintainability.

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
    index.ts          # Barrel export for MCP logic
    ui/
      Dashboard.tsx   # Main MCP dashboard UI component
      index.ts        # Barrel export for UI components
```

**Usage Example:**

```tsx
import { BrowserMCPClient, useMCP } from "@/lib/browser-mcp";
import { MCPDashboard } from "@/lib/browser-mcp/ui";

// To use the MCP system in your component:
const mcp = useMCP({ useWorker: true }); // Use Web Worker mode (default: false)
```

For more details, see the code in `lib/browser-mcp/`.
