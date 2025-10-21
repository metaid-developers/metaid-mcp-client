# @metaid/metaid-mcp-client

[![npm version](https://img.shields.io/npm/v/@metaid/metaid-mcp-client.svg)](https://www.npmjs.com/package/@metaid/metaid-mcp-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

> Official TypeScript/JavaScript client for MetaID MCP (Model Context Protocol) Server

[![中文 README/Chinese README](./README-ZH.md)](./README-ZH.md)

MetaID MCP Client is a full-featured TypeScript/JavaScript client library for connecting to and calling MetaID MCP servers. Supports Node.js and browser environments, with complete type definitions and Promise-based async API.

**Default Service URL:** `https://api.metaid.io/mcp-service`

---

## ✨ Features

- 🚀 **Zero Configuration** - Ready to use out of the box, auto-connects to online service
- 📘 **TypeScript First** - Complete type definitions and intelligent hints
- 🔌 **Multi-Environment Support** - Node.js, Browser, React, Vue, etc.
- ⚡ **Promise API** - Modern async programming experience
- 🔄 **SSE Transport** - Real-time bidirectional communication
- 🎯 **Command Line Tool** - Built-in CLI tool for testing and debugging
- 📦 **Lightweight** - Minimal dependencies, small footprint

---

## 📦 Installation

### npm

```bash
npm install @metaid/metaid-mcp-client
```

### yarn

```bash
yarn add @metaid/metaid-mcp-client
```

### pnpm

```bash
pnpm add @metaid/metaid-mcp-client
```

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { MCPClient } from '@metaid/metaid-mcp-client';

// Create client (auto-connects to online service)
const client = new MCPClient();

// Connect and initialize
await client.connect();
await client.initialize({
  name: 'my-app',
  version: '1.0.0',
});

// Call a tool
const result = await client.callTool('hello_world', {
  name: 'MetaID'
});

console.log(result);
```

### Complete Example

```typescript
import { MCPClient } from '@metaid/metaid-mcp-client';

async function main() {
  // Create client instance
  const client = new MCPClient({
    onConnected: () => console.log('✓ Connected'),
    onError: (error) => console.error('✗ Error:', error.message),
  });

  try {
    // 1. Connect to server
    await client.connect();

    // 2. Initialize session
    await client.initialize({
      name: 'demo-app',
      version: '1.0.0',
    });

    // 3. List available tools
    const tools = await client.listTools();
    console.log('Available tools:', tools.tools.length);

    // 4. Compute MetaID
    const metaidResult = await client.callTool('compute_metaid', {
      address: '0x1234567890abcdef1234567890abcdef12345678'
    });
    console.log('MetaID:', metaidResult);

    // 5. Get current time
    const timeResult = await client.callTool('get_current_time', {});
    console.log('Server time:', timeResult);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.disconnect();
  }
}

main();
```

---

## 📖 API Documentation

### MCPClient

#### Constructor

```typescript
new MCPClient(config?: MCPClientConfig)
```

**Configuration Options:**

| Parameter | Type | Default | Description |
|-----|------|--------|------|
| `baseUrl?` | `string` | `'https://api.metaid.io/mcp-service'` | MCP server address |
| `timeout?` | `number` | `30000` | Request timeout (milliseconds) |
| `onConnected?` | `() => void` | - | Connected callback |
| `onDisconnected?` | `() => void` | - | Disconnected callback |
| `onError?` | `(error: Error) => void` | - | Error callback |
| `onMessage?` | `(message: any) => void` | - | Message received callback |

#### Methods

##### `connect()`

Connect to MCP server

```typescript
await client.connect(): Promise<void>
```

##### `disconnect()`

Disconnect from server

```typescript
client.disconnect(): void
```

##### `initialize()`

Initialize MCP session

```typescript
await client.initialize(clientInfo: {
  name: string;
  version: string;
}): Promise<InitializeResult>
```

##### `listTools()`

List all available tools

```typescript
await client.listTools(): Promise<ToolsListResult>
```

##### `callTool()`

Call a specific tool

```typescript
await client.callTool(
  name: string,
  args?: Record<string, any>
): Promise<CallToolResult>
```

##### `listResources()`

List all available resources

```typescript
await client.listResources(): Promise<ResourcesListResult>
```

##### `readResource()`

Read a specific resource

```typescript
await client.readResource(uri: string): Promise<any>
```

##### `listPrompts()`

List all available prompts

```typescript
await client.listPrompts(): Promise<PromptsListResult>
```

##### `getPrompt()`

Get a specific prompt

```typescript
await client.getPrompt(
  name: string,
  args?: Record<string, any>
): Promise<any>
```

##### `isConnected()`

Check connection status

```typescript
client.isConnected(): boolean
```

---


## 💡 Usage Scenarios

### Node.js Application

```typescript
import { MCPClient } from '@metaid/metaid-mcp-client';

const client = new MCPClient();
await client.connect();
// Use client...
```

### React Application

```tsx
import { MCPClient } from '@metaid/metaid-mcp-client';
import { useEffect, useState } from 'react';

function App() {
  const [client, setClient] = useState<MCPClient | null>(null);

  useEffect(() => {
    const mcpClient = new MCPClient({
      onConnected: () => console.log('MCP Connected'),
    });

    mcpClient.connect()
      .then(() => mcpClient.initialize({ name: 'react-app', version: '1.0.0' }))
      .then(() => setClient(mcpClient));

    return () => mcpClient.disconnect();
  }, []);

  const handleCallTool = async () => {
    if (!client) return;
    const result = await client.callTool('get_current_time', {});
    console.log(result);
  };

  return <button onClick={handleCallTool}>Get Time</button>;
}
```

### Vue Application

```vue
<script setup lang="ts">
import { MCPClient } from '@metaid/metaid-mcp-client';
import { ref, onMounted, onUnmounted } from 'vue';

const client = ref<MCPClient | null>(null);

onMounted(async () => {
  client.value = new MCPClient();
  await client.value.connect();
  await client.value.initialize({ name: 'vue-app', version: '1.0.0' });
});

onUnmounted(() => {
  client.value?.disconnect();
});

const callTool = async () => {
  if (!client.value) return;
  const result = await client.value.callTool('get_current_time', {});
  console.log(result);
};
</script>

<template>
  <button @click="callTool">Get Time</button>
</template>
```

### Express.js Backend

```typescript
import express from 'express';
import { MCPClient } from '@metaid/metaid-mcp-client';

const app = express();
const mcpClient = new MCPClient();

await mcpClient.connect();
await mcpClient.initialize({ name: 'express-api', version: '1.0.0' });

app.get('/api/metaid/:address', async (req, res) => {
  try {
    const result = await mcpClient.callTool('compute_metaid', {
      address: req.params.address
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

---

## 🌐 Browser Usage

### Via CDN

```html
<script src="https://unpkg.com/@metaid/metaid-mcp-client/dist/mcp-client.bundle.js"></script>
<script>
  const client = new MCPClient.MCPClient();
  
  client.connect()
    .then(() => client.initialize({ name: 'browser-app', version: '1.0.0' }))
    .then(() => client.callTool('hello_world', {}))
    .then(result => console.log(result));
</script>
```

## 🔧 Command Line Tool

CLI tool provided after installation:

```bash
# Connect to server
metaid-mcp-client connect

# List tools
metaid-mcp-client tools

# Call a tool
metaid-mcp-client call -n hello_world -a '{}'

# Specify server address
metaid-mcp-client tools -u http://mcp-server-url
```

---

## ⚙️ Advanced Configuration

### Custom Server Address

```typescript
const client = new MCPClient({
  baseUrl: 'http://mcp-server-url',
  timeout: 60000,
});
```

### Event Listeners

```typescript
const client = new MCPClient({
  onConnected: () => {
    console.log('Connected to MCP server');
  },
  onDisconnected: () => {
    console.log('Connection closed');
  },
  onError: (error) => {
    console.error('Error occurred:', error.message);
  },
  onMessage: (message) => {
    console.log('Message received:', message);
  },
});
```

### Error Handling

```typescript
try {
  await client.connect();
  const result = await client.callTool('some_tool', {});
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Connection timeout');
  } else if (error.message.includes('not found')) {
    console.error('Tool not found');
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## 📚 TypeScript Support

Complete TypeScript type definitions:

```typescript
import {
  MCPClient,
  MCPClientConfig,
  MCPRequest,
  MCPResponse,
  CallToolResult,
  ToolsListResult,
} from '@metaid/metaid-mcp-client';

const config: MCPClientConfig = {
  baseUrl: 'https://api.metaid.io/mcp-service',
  timeout: 30000,
};

const client: MCPClient = new MCPClient(config);
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Test online service
npm run test:online

# Test local service
npm run test:local
```

---

## 📋 Version History

### v1.0.0 (Latest)

**Release Date:** 2025-01-21

**Features:**
- ✅ Full MCP protocol support
- ✅ SSE-based real-time communication
- ✅ Auto-connection to online service (https://api.metaid.io/mcp-service)
- ✅ Support for tools, resources and prompts

---

## 🔨 Development

```bash
# Install dependencies
npm install

# Development mode (watch)
npm run watch

# Build
npm run build

# Build all versions
npm run build:all

# Clean
npm run clean
```

---

## 📄 License

[MIT License](./LICENSE)

---

## 🔗 Links

- [MetaID Official Site](https://metaid.io)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [GitHub Repository](https://github.com/metaid-developers/metaid-mcp-client)
- [Issue Tracker](https://github.com/metaid-developers/metaid-mcp-client/issues)

---

## ❓ FAQ

### How to switch to local server?

```typescript
const client = new MCPClient({
  baseUrl: 'http://localhost:7911'
});
```

### What environments are supported?

- ✅ Node.js >= 18.0.0
- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ React, Vue, Angular and other frameworks
- ✅ TypeScript >= 5.0


<p align="center">
  Made with ❤️ by <a href="https://docs.metaid.io">MetaID</a>
</p>
