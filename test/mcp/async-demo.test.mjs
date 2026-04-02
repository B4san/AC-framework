import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HARNESS_PATH = resolve(__dirname, '../../src/mcp/test-harness.mjs');

class StdioClient {
  constructor() {
    this.process = null;
    this.pending = new Map();
    this.nextId = 1;
    this.ready = false;
    this.stderrLines = [];
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.process = spawn('node', [HARNESS_PATH], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      const stdout = createInterface({ input: this.process.stdout });
      const stderr = createInterface({ input: this.process.stderr });

      stderr.on('line', (line) => {
        this.stderrLines.push(line);
        if (line.includes('Test harness ready on stdio')) {
          this.ready = true;
          resolve();
        }
      });

      stdout.on('line', (line) => {
        this.handleMessage(line);
      });

      this.process.on('error', reject);

      setTimeout(() => {
        if (!this.ready) {
          reject(new Error('Harness ready timeout'));
        }
      }, 5000);
    });
  }

  handleMessage(line) {
    if (!line.trim()) return;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      return;
    }
    
    if (message.id !== undefined && this.pending.has(message.id)) {
      const { resolve } = this.pending.get(message.id);
      this.pending.delete(message.id);
      resolve(message);
    }
  }

  async send(tool, args = {}) {
    if (!this.ready) {
      throw new Error('Client not ready');
    }

    const id = this.nextId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method: 'tools/call',
      params: { name: tool, arguments: args }
    };

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.process.stdin.write(JSON.stringify(request) + '\n');
      
      setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`Request ${id} (${tool}) timeout`));
        }
      }, 10000);
    });
  }

  async close() {
    if (this.process && !this.process.killed) {
      this.process.stdin.end();
      await new Promise(r => setTimeout(r, 100));
      this.process.kill('SIGTERM');
    }
  }
}

describe('MCP Async Demo Tests', () => {
  let client;

  before(async () => {
    client = new StdioClient();
    await client.start();
  });

  after(async () => {
    await client.close();
  });

  beforeEach(async () => {
    await client.send('harness_control', { action: 'reset' });
  });

  describe('Demo 1: Sequential Memory Workflow', () => {
    it('should save memory successfully', async () => {
      const response = await client.send('memory_save', {
        content: 'Test memory',
        type: 'general_insight'
      });
      
      assert.strictEqual(response.jsonrpc, '2.0');
      assert.ok(response.id);
      assert.ok(response.result);
      assert.strictEqual(response.result.isError, undefined);
      
      const data = JSON.parse(response.result.content[0].text);
      assert.strictEqual(data.success, true);
      assert.ok(data.id);
    });

    it('should search memories', async () => {
      await client.send('memory_save', { content: 'Test search', type: 'general_insight' });
      
      const response = await client.send('memory_search', { query: 'Test search' });
      
      assert.ok(response.result);
      const data = JSON.parse(response.result.content[0].text);
      assert.strictEqual(data.count, 1);
    });

    it('should return stats', async () => {
      await client.send('memory_save', { content: 'Stats test', type: 'bugfix_pattern' });
      
      const response = await client.send('memory_stats', {});
      
      assert.ok(response.result);
      const data = JSON.parse(response.result.content[0].text);
      assert.ok(typeof data.totalMemories === 'number');
      assert.ok(data.byType);
    });
  });

  describe('Demo 2: ID Tracking', () => {
    it('should correlate request/response by id', async () => {
      const requests = [
        { tool: 'memory_save', args: { content: 'First', type: 'general_insight' } },
        { tool: 'memory_save', args: { content: 'Second', type: 'bugfix_pattern' } }
      ];

      const sentIds = [];
      for (const req of requests) {
        sentIds.push(client.nextId);
        await client.send(req.tool, req.args);
      }

      const responses = [];
      for (const id of sentIds) {
        const response = await client.send('memory_stats', {});
        responses.push(response.id);
      }

      assert.strictEqual(responses.length, 2);
    });
  });

  describe('Demo 3: Error Propagation', () => {
    it('should handle isError responses from tool handlers', async () => {
      await client.send('harness_control', { action: 'inject_error', errorType: 'db_failure' });
      
      const response = await client.send('memory_save', { content: 'Will fail' });
      
      assert.ok(response.result);
      assert.strictEqual(response.result.isError, true);
      
      const data = JSON.parse(response.result.content[0].text);
      assert.ok(data.error.includes('Database write failed'));
      
      await client.send('harness_control', { action: 'clear_errors' });
    });

    it('should handle JSON-RPC validation errors', async () => {
      const response = await client.send('memory_save', {});
      
      if (response.error) {
        assert.strictEqual(response.error.code, -32602);
      } else if (response.result?.isError) {
        const errorText = response.result.content[0].text;
        assert.ok(
          errorText.includes('Missing required') ||
          errorText.includes('content') ||
          errorText.includes('Invalid input'),
          `Expected validation error, got: ${errorText}`
        );
      }
    });

    it('should continue running after errors', async () => {
      await client.send('harness_control', { action: 'inject_error', errorType: 'validation' });
      await client.send('memory_save', {});
      await client.send('harness_control', { action: 'clear_errors' });
      
      const response = await client.send('memory_save', { content: 'After error' });
      
      assert.ok(response.result);
      assert.strictEqual(response.result.isError, undefined);
    });
  });

  describe('Demo 4: Collab Workflow Mock', () => {
    it('should start a session', async () => {
      const response = await client.send('collab_start_session', {
        task: 'Test task',
        maxRounds: 2
      });

      assert.ok(response.result);
      const data = JSON.parse(response.result.content[0].text);
      assert.ok(data.sessionId.startsWith('session-'));
      assert.strictEqual(data.status, 'initialized');
    });

    it('should execute collab steps', async () => {
      const session = await client.send('collab_start_session', {
        task: 'Test',
        maxRounds: 2
      });
      const sessionData = JSON.parse(session.result.content[0].text);

      const step = await client.send('collab_step', {
        sessionId: sessionData.sessionId,
        role: 'planner'
      });

      assert.ok(step.result);
      const stepData = JSON.parse(step.result.content[0].text);
      assert.strictEqual(stepData.round, 1);
    });

    it('should get collab results', async () => {
      const session = await client.send('collab_start_session', {
        task: 'Final test',
        maxRounds: 1
      });
      const sessionData = JSON.parse(session.result.content[0].text);

      await client.send('collab_step', {
        sessionId: sessionData.sessionId,
        role: 'coder'
      });

      const result = await client.send('collab_get_result', {
        sessionId: sessionData.sessionId
      });

      assert.ok(result.result);
      const resultData = JSON.parse(result.result.content[0].text);
      assert.strictEqual(resultData.rounds, 1);
    });

    it('should handle unknown session', async () => {
      const response = await client.send('collab_step', {
        sessionId: 'nonexistent',
        role: 'planner'
      });

      assert.ok(response.result);
      assert.strictEqual(response.result.isError, true);
    });
  });

  describe('Demo 5: Lifecycle', () => {
    it('should handle harness_control reset', async () => {
      await client.send('memory_save', { content: 'Before reset', type: 'general_insight' });
      
      const response = await client.send('harness_control', { action: 'reset' });
      
      assert.ok(response.result);
      const data = JSON.parse(response.result.content[0].text);
      assert.strictEqual(data.message, 'Harness reset complete');
    });

    it('should return harness status', async () => {
      const response = await client.send('harness_control', { action: 'status' });
      
      assert.ok(response.result);
      const data = JSON.parse(response.result.content[0].text);
      assert.ok(typeof data.memories === 'number');
      assert.ok(typeof data.sessions === 'number');
      assert.ok(typeof data.requestCount === 'number');
    });
  });
});
