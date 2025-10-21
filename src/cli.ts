#!/usr/bin/env node

import { Command } from 'commander';
import { MCPClient, DEFAULT_URL } from './index';

const program = new Command();
const url = DEFAULT_URL;

program
  .name('metaid-mcp-client')
  .description('MetaID MCP Client - CLI tool for testing MCP servers')
  .version('1.0.0');

program
  .command('connect')
  .description('Connect to MCP server')
  .requiredOption('-u, --url <url>', 'MCP server URL', url)
  .action(async (options) => {
    console.log(`Connecting to ${options.url}...`);
    
    const client = new MCPClient({
      baseUrl: options.url,
      onConnected: () => console.log('✓ Connected'),
      onDisconnected: () => console.log('✗ Disconnected'),
      onError: (error) => console.error('Error:', error.message),
      onMessage: (msg) => console.log('Message:', JSON.stringify(msg, null, 2)),
    });

    try {
      await client.connect();
      
      // Initialize
      console.log('\nInitializing...');
      const initResult = await client.initialize({
        name: 'metaid-mcp-client',
        version: '1.0.0',
      });
      console.log('Init result:', JSON.stringify(initResult, null, 2));

      // List tools
      console.log('\nListing tools...');
      const tools = await client.listTools();
      console.log('Tools:', JSON.stringify(tools, null, 2));

      // Keep connection alive
      console.log('\nPress Ctrl+C to exit...');
      process.on('SIGINT', () => {
        console.log('\nDisconnecting...');
        client.disconnect();
        process.exit(0);
      });
    } catch (error: any) {
      console.error('Error:', error.message);
      client.disconnect();
      process.exit(1);
    }
  });

program
  .command('tools')
  .description('List available tools')
  .requiredOption('-u, --url <url>', 'MCP server URL', url)
  .action(async (options) => {
    const client = new MCPClient({ baseUrl: options.url });

    try {
      await client.connect();
      await client.initialize({ name: 'metaid-mcp-client', version: '1.0.0' });
      
      const result = await client.listTools();
      console.log(JSON.stringify(result, null, 2));
      
      client.disconnect();
    } catch (error: any) {
      console.error('Error:', error.message);
      client.disconnect();
      process.exit(1);
    }
  });

program
  .command('call')
  .description('Call a tool')
  .requiredOption('-u, --url <url>', 'MCP server URL', url)
  .requiredOption('-n, --name <name>', 'Tool name')
  .option('-a, --args <json>', 'Tool arguments as JSON', '{}')
  .action(async (options) => {
    const client = new MCPClient({ baseUrl: options.url });

    try {
      await client.connect();
      await client.initialize({ name: 'metaid-mcp-client', version: '1.0.0' });
      
      const args = JSON.parse(options.args);
      const result = await client.callTool(options.name, args);
      console.log(JSON.stringify(result, null, 2));
      
      client.disconnect();
    } catch (error: any) {
      console.error('Error:', error.message);
      client.disconnect();
      process.exit(1);
    }
  });

program.parse();

