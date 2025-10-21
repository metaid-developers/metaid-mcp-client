#!/usr/bin/env node

/**
 * Simplest usage example - using default configuration
 */

const { MCPClient } = require('./dist/index');

async function main() {
  console.log('🚀 Simplest MCP Client Example\n');

  // Create client - using default address
  const client = new MCPClient();

  try {
    // Connect (defaults to https://api.metaid.io/mcp-service)
    console.log('Connecting to default server...');
    await client.connect();
    console.log('✓ Connected\n');

    // Initialize
    await client.initialize({
      name: 'simple-example',
      version: '1.0.0',
    });

    // List tools
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} tools:\n`);
    tools.tools.forEach((tool, i) => {
      console.log(`${i + 1}. ${tool.name}`);
    });

    // Call a tool
    console.log('\nTesting hello_world tool...');
    const result = await client.callTool('hello_world', {});
    const text = JSON.parse(result.content[0].text);
    console.log('✓ Result:', text.message);

    console.log('\n✅ Example completed!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    client.disconnect();
  }
}

main();
