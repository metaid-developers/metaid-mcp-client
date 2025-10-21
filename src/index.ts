import EventSource from 'eventsource';

export const DEFAULT_URL = 'https://api.metaid.io/mcp-service';

/**
 * MCP request interface
 */
export interface MCPRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: any;
}

/**
 * MCP response interface
 */
export interface MCPResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

/**
 * MCP client configuration
 */
export interface MCPClientConfig {
  baseUrl?: string;  // Optional, defaults to https://api.metaid.io/mcp-service
  timeout?: number;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
  onMessage?: (message: any) => void;
}

/**
 * MetaID MCP Client
 */
export class MCPClient {
  private baseUrl: string;
  private timeout: number;
  private eventSource?: EventSource;
  private sessionUrl?: string;
  private requestId = 0;
  private pendingRequests = new Map<number | string, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();

  private onConnectedCallback?: () => void;
  private onDisconnectedCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;
  private onMessageCallback?: (message: any) => void;

  constructor(config: MCPClientConfig = {}) {
    // Default to online service URL
    this.baseUrl = (config.baseUrl || DEFAULT_URL).replace(/\/$/, '');
    this.timeout = config.timeout || 30000;
    this.onConnectedCallback = config.onConnected;
    this.onDisconnectedCallback = config.onDisconnected;
    this.onErrorCallback = config.onError;
    this.onMessageCallback = config.onMessage;
  }

  /**
   * Connect to MCP server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sseUrl = `${this.baseUrl}/sse`;
      
      console.log(`Connecting to MCP server: ${sseUrl}`);
      
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        console.log('SSE connection established');
      };

      this.eventSource.addEventListener('endpoint', (event: any) => {
        try {
          // Endpoint data can be a JSON object or plain text URL
          let endpoint: string;
          try {
            const data = JSON.parse(event.data);
            endpoint = data.endpoint || data;
          } catch {
            // If not JSON, use raw data as URL
            endpoint = event.data.trim();
          }
          
          // Fix endpoint URL: replace server internal address with actual baseUrl
          // Example: http://0.0.0.0:7911/message?sessionId=xxx -> ${baseUrl}/message?sessionId=xxx
          try {
            const endpointUrl = new URL(endpoint);
            const baseUrlObj = new URL(this.baseUrl);
            
            // If endpoint host is 0.0.0.0 or localhost, replace with baseUrl host and path
            if (endpointUrl.hostname === '0.0.0.0' || 
                endpointUrl.hostname === 'localhost' || 
                endpointUrl.hostname === '127.0.0.1') {
              // Construct new URL: baseUrl + endpoint path
              const endpointPath = endpointUrl.pathname + endpointUrl.search;
              endpoint = this.baseUrl + (endpointPath.startsWith('/') ? endpointPath : '/' + endpointPath);
            }
          } catch (urlError) {
            console.warn('Failed to parse endpoint URL, using as-is:', urlError);
          }
          
          this.sessionUrl = endpoint;
          console.log('Session endpoint received:', this.sessionUrl);
          
          if (this.onConnectedCallback) {
            this.onConnectedCallback();
          }
          
          resolve();
        } catch (error) {
          console.error('Failed to parse endpoint event:', error);
          reject(error);
        }
      });

      this.eventSource.addEventListener('message', (event: any) => {
        try {
          const response: MCPResponse = JSON.parse(event.data);
          console.log('Received message:', response);
          
          if (this.onMessageCallback) {
            this.onMessageCallback(response);
          }

          // Handle pending requests
          if (response.id !== undefined) {
            const pending = this.pendingRequests.get(response.id);
            if (pending) {
              clearTimeout(pending.timeout);
              this.pendingRequests.delete(response.id);
              
              if (response.error) {
                pending.reject(new Error(response.error.message));
              } else {
                pending.resolve(response.result);
              }
            }
          }
        } catch (error) {
          console.error('Failed to parse message event:', error);
        }
      });

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        
        if (this.onErrorCallback) {
          this.onErrorCallback(new Error('SSE connection error'));
        }
        
        if (!this.sessionUrl) {
          reject(new Error('Failed to establish SSE connection'));
        }
      };

      // Timeout handling
      setTimeout(() => {
        if (!this.sessionUrl) {
          this.disconnect();
          reject(new Error('Connection timeout'));
        }
      }, this.timeout);
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
    
    this.sessionUrl = undefined;
    
    // Clean up all pending requests
    for (const [id, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    }
    this.pendingRequests.clear();
    
    if (this.onDisconnectedCallback) {
      this.onDisconnectedCallback();
    }
  }

  /**
   * Send MCP request
   */
  async request(method: string, params?: any): Promise<any> {
    if (!this.sessionUrl) {
      throw new Error('Not connected to MCP server');
    }

    const id = ++this.requestId;
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, this.timeout);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      // Send request
      fetch(this.sessionUrl!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
        })
        .catch((error) => {
          clearTimeout(timeout);
          this.pendingRequests.delete(id);
          reject(error);
        });
    });
  }

  /**
   * Initialize MCP session
   */
  async initialize(clientInfo: { name: string; version: string }): Promise<any> {
    return this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: { listChanged: true },
        sampling: {},
      },
      clientInfo,
    });
  }

  /**
   * List available tools
   */
  async listTools(): Promise<any> {
    return this.request('tools/list');
  }

  /**
   * Call a tool
   */
  async callTool(name: string, args?: any): Promise<any> {
    return this.request('tools/call', {
      name,
      arguments: args || {},
    });
  }

  /**
   * List resources
   */
  async listResources(): Promise<any> {
    return this.request('resources/list');
  }

  /**
   * Read a resource
   */
  async readResource(uri: string): Promise<any> {
    return this.request('resources/read', { uri });
  }

  /**
   * List prompts
   */
  async listPrompts(): Promise<any> {
    return this.request('prompts/list');
  }

  /**
   * Get a prompt
   */
  async getPrompt(name: string, args?: any): Promise<any> {
    return this.request('prompts/get', {
      name,
      arguments: args || {},
    });
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return !!this.sessionUrl && this.eventSource?.readyState === EventSource.OPEN;
  }
}

export default MCPClient;

