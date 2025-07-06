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
    server.ts         # Browser MCP server logic
    transport.ts      # Browser transport implementation
    useMCPSystem.ts   # React hook for MCP system (if present)
    index.ts          # Barrel export for MCP logic
    ui/
      Dashboard.tsx   # Main MCP dashboard UI component
      index.ts        # Barrel export for UI components
```

**Usage Example:**

```tsx
import { BrowserMCPClient, useMCPSystem } from "@/lib/browser-mcp";
import { MCPDashboard } from "@/lib/browser-mcp/ui";
```

For more details, see the code in `lib/browser-mcp/`.
