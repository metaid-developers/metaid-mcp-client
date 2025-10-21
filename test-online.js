#!/usr/bin/env node

/**
 * Test connection to online MCP service
 * https://api.metaid.io/mcp-service
 */

const { MCPClient } = require('./dist/index');

async function testOnlineService() {
  console.log('🌐 Testing connection to online MetaID MCP service\n');
  console.log('Service URL: https://api.metaid.io/mcp-service (default)\n');

  // Using default address, no need to specify baseUrl
  const client = new MCPClient({
    timeout: 30000,
    onConnected: () => console.log('✓ Connected to MCP server'),
    onDisconnected: () => console.log('✗ Disconnected'),
    onError: (error) => console.error('✗ Error:', error.message),
    onMessage: (msg) => {
      if (msg.method) {
        console.log(`📨 Notification received: ${msg.method}`);
      }
    },
  });

  try {
    // 1. Connect to server
    console.log('Connecting...');
    await client.connect();
    console.log('');

    // 2. Initialize session
    console.log('Initializing session...');
    const initResult = await client.initialize({
      name: 'metaid-test-client',
      version: '1.0.0',
    });
    console.log('✓ Initialization successful');
    console.log('Server info:', JSON.stringify(initResult.serverInfo, null, 2));
    console.log('');

    // 3. List all available tools
    console.log('Getting tool list...');
    const toolsResult = await client.listTools();
    console.log(`✓ Found ${toolsResult.tools.length} tools:\n`);
    
    toolsResult.tools.forEach((tool, index) => {
      console.log(`${index + 1}. ${tool.name}`);
      console.log(`   Description: ${tool.description || 'None'}`);
      if (tool.inputSchema?.properties) {
        console.log(`   Parameters:`, Object.keys(tool.inputSchema.properties).join(', '));
      }
      console.log('');
    });

    // 4. Test calling the first tool (if parameters are available)
    if (toolsResult.tools.length > 0) {
      const firstTool = toolsResult.tools[0];
      console.log(`\nTesting tool call: ${firstTool.name}`);
      
      try {
        // Try calling (may need to adjust parameters based on actual tool)
        const args = {};
        const result = await client.callTool(firstTool.name, args);
        console.log('✓ Call successful');
        console.log('Result:', JSON.stringify(result, null, 2));
      } catch (error) {
        console.error('✗ Call failed:', error.message);
        console.log('Hint: This tool may require specific parameters');
      }
    }

    // 5. Test resources
    try {
      console.log('\nGetting resource list...');
      const resources = await client.listResources();
      if (resources.resources && resources.resources.length > 0) {
        console.log(`✓ Found ${resources.resources.length} resources`);
        resources.resources.forEach((resource, index) => {
          console.log(`${index + 1}. ${resource.name} (${resource.uri})`);
        });
      } else {
        console.log('This server has no resources');
      }
    } catch (error) {
      console.log('This server does not support resources');
    }

    // 6. Test prompts
    try {
      console.log('\nGetting prompt list...');
      const prompts = await client.listPrompts();
      if (prompts.prompts && prompts.prompts.length > 0) {
        console.log(`✓ Found ${prompts.prompts.length} prompts`);
        prompts.prompts.forEach((prompt, index) => {
          console.log(`${index + 1}. ${prompt.name} - ${prompt.description}`);
        });
      } else {
        console.log('This server has no prompts');
      }
    } catch (error) {
      console.log('This server does not support prompts');
    }

    console.log('\n✅ Test completed! Service is running normally.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nPossible causes:');
    console.error('1. Server is not running or inaccessible');
    console.error('2. CORS configuration issue');
    console.error('3. Network connection problem');
  } finally {
    console.log('\nDisconnecting...');
    client.disconnect();
    console.log('Test finished 👋\n');
  }
}

// Run test
testOnlineService().catch(console.error);
