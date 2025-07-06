"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMCPSystem } from "../use-mcp";
import {
  Play,
  Square,
  Link,
  Unlink,
  List,
  MessageSquare,
  Zap,
  Globe,
  Trash2,
} from "lucide-react";

export default function MCPDashboard() {
  const {
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
  } = useMCPSystem();

  // Tool testing states
  const [echoMessage, setEchoMessage] = useState("");
  const [echoResult, setEchoResult] = useState("");
  const [pingTarget, setPingTarget] = useState("");
  const [pingResult, setPingResult] = useState("");
  const [apiUrl, setApiUrl] = useState(
    "https://jsonplaceholder.typicode.com/posts/1"
  );
  const [apiMethod, setApiMethod] = useState("GET");
  const [apiHeaders, setApiHeaders] = useState("{}");
  const [apiBody, setApiBody] = useState("");
  const [apiResult, setApiResult] = useState("");

  const handleTestEcho = async () => {
    if (!echoMessage.trim()) return;
    const result = await callTool("echo", { message: echoMessage });
    setEchoResult(result?.content[0]?.text || "No result");
  };

  const handleTestPing = async () => {
    const result = await callTool(
      "ping",
      pingTarget ? { target: pingTarget } : {}
    );
    setPingResult(result?.content[0]?.text || "No result");
  };

  const handleTestApiCall = async () => {
    if (!apiUrl.trim()) return;

    const args: any = { url: apiUrl, method: apiMethod };

    if (apiHeaders.trim()) {
      try {
        args.headers = JSON.parse(apiHeaders);
      } catch {
        setApiResult("Error: Invalid JSON format in headers");
        return;
      }
    }

    if (apiBody.trim() && (apiMethod === "POST" || apiMethod === "PUT")) {
      args.body = apiBody;
    }

    const result = await callTool("api_call", args);
    setApiResult(result?.content[0]?.text || "No result");
  };

  const getStatusBadge = () => {
    if (isServerRunning && isClientConnected) {
      return <Badge className="bg-green-500">Connected</Badge>;
    }
    return <Badge variant="secondary">Disconnected</Badge>;
  };

  return (
    <div className="space-y-6 mx-auto p-6 container">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-3xl">MCP Browser System</h1>
          <p className="text-muted-foreground">
            Model Context Protocol Client & Server in Browser
          </p>
        </div>
        {getStatusBadge()}
      </div>

      {/* Server Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Server Control
          </CardTitle>
          <CardDescription>
            Start and stop the MCP server, connect and disconnect the client
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={startServer}
              disabled={isServerRunning}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Server
            </Button>
            <Button
              onClick={stopServer}
              disabled={!isServerRunning}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop Server
            </Button>
            <Button
              onClick={connectClient}
              disabled={!isServerRunning || isClientConnected}
              className="flex items-center gap-2"
            >
              <Link className="w-4 h-4" />
              Connect Client
            </Button>
            <Button
              onClick={disconnectClient}
              disabled={!isClientConnected}
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Unlink className="w-4 h-4" />
              Disconnect Client
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tools Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <List className="w-5 h-5" />
            Available Tools
          </CardTitle>
          <CardDescription>List and manage available MCP tools</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={listTools}
            disabled={!isClientConnected}
            className="flex items-center gap-2"
          >
            <List className="w-4 h-4" />
            List Tools
          </Button>

          {tools.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Tools ({tools.length}):</h4>
              {tools.map((tool) => (
                <Card key={tool.name} className="p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">{tool.name}</h5>
                      <p className="text-muted-foreground text-sm">
                        {tool.description}
                      </p>
                    </div>
                    <Badge variant="outline">{tool.name}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tool Testing */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-3">
        {/* Echo Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Echo Tool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter message to echo"
              value={echoMessage}
              onChange={(e) => setEchoMessage(e.target.value)}
            />
            <Button
              onClick={handleTestEcho}
              disabled={!isClientConnected || !echoMessage.trim()}
              className="w-full"
            >
              Test Echo
            </Button>
            {echoResult && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">{echoResult}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ping Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Ping Tool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Optional target (default: server)"
              value={pingTarget}
              onChange={(e) => setPingTarget(e.target.value)}
            />
            <Button
              onClick={handleTestPing}
              disabled={!isClientConnected}
              className="w-full"
            >
              Test Ping
            </Button>
            {pingResult && (
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">{pingResult}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Call Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              API Call Tool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="API URL"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <Select value={apiMethod} onValueChange={setApiMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Headers (JSON format)"
              value={apiHeaders}
              onChange={(e) => setApiHeaders(e.target.value)}
              rows={2}
            />
            {(apiMethod === "POST" || apiMethod === "PUT") && (
              <Textarea
                placeholder="Request body"
                value={apiBody}
                onChange={(e) => setApiBody(e.target.value)}
                rows={3}
              />
            )}
            <Button
              onClick={handleTestApiCall}
              disabled={!isClientConnected || !apiUrl.trim()}
              className="w-full"
            >
              Test API Call
            </Button>
            {apiResult && (
              <ScrollArea className="w-full h-32">
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-xs whitespace-pre-wrap">{apiResult}</pre>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>System Log</span>
            <Button onClick={clearLogs} variant="outline" size="sm">
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full h-64">
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="font-mono text-muted-foreground text-xs">
                    [{log.timestamp}]
                  </span>
                  <span
                    className={
                      log.type === "error"
                        ? "text-red-600"
                        : log.type === "success"
                        ? "text-green-600"
                        : "text-foreground"
                    }
                  >
                    {log.message}
                  </span>
                </div>
              ))}
              {logs.length === 0 && (
                <p className="py-8 text-muted-foreground text-center">
                  No logs yet. Start the server to see system messages.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
