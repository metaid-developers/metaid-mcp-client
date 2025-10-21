# @metaid/metaid-mcp-client

[![npm version](https://img.shields.io/npm/v/@metaid/metaid-mcp-client.svg)](https://www.npmjs.com/package/@metaid/metaid-mcp-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

> Official TypeScript/JavaScript client for MetaID MCP (Model Context Protocol) Server

[![英文 README/English README](./README.md)](./README.md)

MetaID MCP Client 是一个功能完整的 TypeScript/JavaScript 客户端库，用于连接和调用 MetaID MCP 服务器。支持 Node.js 和浏览器环境，提供完整的类型定义和 Promise 风格的异步 API。

**默认服务地址：** `https://api.metaid.io/mcp-service`

---

## ✨ 特性

- 🚀 **零配置启动** - 开箱即用，自动连接到线上服务
- 📘 **TypeScript 优先** - 完整的类型定义和智能提示
- 🔌 **多环境支持** - Node.js、浏览器、React、Vue 等
- ⚡ **Promise API** - 现代化的异步编程体验
- 🔄 **SSE 传输** - 实时双向通信
- 🎯 **命令行工具** - 内置 CLI 工具用于测试和调试
- 📦 **轻量级** - 最小化依赖，体积小巧

---

## 📦 安装

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

## 🚀 快速开始

### 基础使用

```typescript
import { MCPClient } from '@metaid/metaid-mcp-client';

// 创建客户端（自动连接到线上服务）
const client = new MCPClient();

// 连接并初始化
await client.connect();
await client.initialize({
  name: 'my-app',
  version: '1.0.0',
});

// 调用工具
const result = await client.callTool('hello_world', {
  name: 'MetaID'
});

console.log(result);
```

### 完整示例

```typescript
import { MCPClient } from '@metaid/metaid-mcp-client';

async function main() {
  // 创建客户端实例
  const client = new MCPClient({
    onConnected: () => console.log('✓ 已连接'),
    onError: (error) => console.error('✗ 错误:', error.message),
  });

  try {
    // 1. 连接到服务器
    await client.connect();

    // 2. 初始化会话
    await client.initialize({
      name: 'demo-app',
      version: '1.0.0',
    });

    // 3. 列出可用工具
    const tools = await client.listTools();
    console.log('可用工具:', tools.tools.length);

    // 4. 计算 MetaID
    const metaidResult = await client.callTool('compute_metaid', {
      address: '0x1234567890abcdef1234567890abcdef12345678'
    });
    console.log('MetaID:', metaidResult);

    // 5. 获取当前时间
    const timeResult = await client.callTool('get_current_time', {});
    console.log('服务器时间:', timeResult);

  } catch (error) {
    console.error('错误:', error);
  } finally {
    client.disconnect();
  }
}

main();
```

---

## 📖 API 文档

### MCPClient

#### 构造函数

```typescript
new MCPClient(config?: MCPClientConfig)
```

**配置选项：**

| 参数 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `baseUrl?` | `string` | `'https://api.metaid.io/mcp-service'` | MCP 服务器地址 |
| `timeout?` | `number` | `30000` | 请求超时时间（毫秒） |
| `onConnected?` | `() => void` | - | 连接成功回调 |
| `onDisconnected?` | `() => void` | - | 断开连接回调 |
| `onError?` | `(error: Error) => void` | - | 错误回调 |
| `onMessage?` | `(message: any) => void` | - | 收到消息回调 |

#### 方法

##### `connect()`

连接到 MCP 服务器

```typescript
await client.connect(): Promise<void>
```

##### `disconnect()`

断开连接

```typescript
client.disconnect(): void
```

##### `initialize()`

初始化 MCP 会话

```typescript
await client.initialize(clientInfo: {
  name: string;
  version: string;
}): Promise<InitializeResult>
```

##### `listTools()`

列出所有可用工具

```typescript
await client.listTools(): Promise<ToolsListResult>
```

##### `callTool()`

调用指定工具

```typescript
await client.callTool(
  name: string,
  args?: Record<string, any>
): Promise<CallToolResult>
```

##### `listResources()`

列出所有可用资源

```typescript
await client.listResources(): Promise<ResourcesListResult>
```

##### `readResource()`

读取指定资源

```typescript
await client.readResource(uri: string): Promise<any>
```

##### `listPrompts()`

列出所有可用提示

```typescript
await client.listPrompts(): Promise<PromptsListResult>
```

##### `getPrompt()`

获取指定提示

```typescript
await client.getPrompt(
  name: string,
  args?: Record<string, any>
): Promise<any>
```

##### `isConnected()`

检查连接状态

```typescript
client.isConnected(): boolean
```

---


## 💡 使用场景

### Node.js 应用

```typescript
import { MCPClient } from '@metaid/metaid-mcp-client';

const client = new MCPClient();
await client.connect();
// 使用客户端...
```

### React 应用

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

  return <button onClick={handleCallTool}>获取时间</button>;
}
```

### Vue 应用

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
  <button @click="callTool">获取时间</button>
</template>
```

### Express.js 后端

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

## 🌐 浏览器使用

### 通过 CDN

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

## 🔧 命令行工具

安装后自动提供 CLI 工具：

```bash
# 连接到服务器
metaid-mcp-client connect

# 列出工具
metaid-mcp-client tools

# 调用工具
metaid-mcp-client call -n hello_world -a '{}'

# 指定服务器地址
metaid-mcp-client tools -u http://mcp-server-url
```

---

## ⚙️ 高级配置

### 自定义服务器地址

```typescript
const client = new MCPClient({
  baseUrl: 'http://mcp-server-url',
  timeout: 60000,
});
```

### 事件监听

```typescript
const client = new MCPClient({
  onConnected: () => {
    console.log('已连接到 MCP 服务器');
  },
  onDisconnected: () => {
    console.log('连接已断开');
  },
  onError: (error) => {
    console.error('发生错误:', error.message);
  },
  onMessage: (message) => {
    console.log('收到消息:', message);
  },
});
```

### 错误处理

```typescript
try {
  await client.connect();
  const result = await client.callTool('some_tool', {});
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('连接超时');
  } else if (error.message.includes('not found')) {
    console.error('工具不存在');
  } else {
    console.error('未知错误:', error);
  }
}
```

---

## 📚 TypeScript 支持

完整的 TypeScript 类型定义：

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

## 🧪 测试

```bash
# 运行测试
npm test

# 测试线上服务
npm run test:online

# 测试本地服务
npm run test:local
```

---

## 📋 版本历史

### v1.0.0 (最新版本)

**发布日期：** 2025-01-21

**功能特性：**
- ✅ 完整的 MCP 协议支持
- ✅ 基于 SSE 的实时通信
- ✅ 自动连接到线上服务 (https://api.metaid.io/mcp-service)
- ✅ 支持 tools、resources 和 prompts

---

## 🔨 开发

```bash
# 安装依赖
npm install

# 开发模式（监听）
npm run watch

# 构建
npm run build

# 构建所有版本
npm run build:all

# 清理
npm run clean
```

---

## 📄 许可证

[MIT License](./LICENSE)

---

## 🔗 相关链接

- [MetaID 官网](https://metaid.io)
- [MCP 协议文档](https://modelcontextprotocol.io)
- [GitHub 仓库](https://github.com/metaid-developers/metaid-mcp-client)
- [问题反馈](https://github.com/metaid-developers/metaid-mcp-client/issues)

---

## ❓ 常见问题

### 如何切换到本地服务器？

```typescript
const client = new MCPClient({
  baseUrl: 'http://localhost:7911'
});
```

### 支持哪些环境？

- ✅ Node.js >= 18.0.0
- ✅ 现代浏览器（Chrome、Firefox、Safari、Edge）
- ✅ React、Vue、Angular 等框架
- ✅ TypeScript >= 5.0


<p align="center">
  Made with ❤️ by <a href="https://docs.metaid.io">MetaID</a>
</p>
