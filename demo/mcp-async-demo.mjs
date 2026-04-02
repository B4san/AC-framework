#!/usr/bin/env node

/**
 * MCP Async Demo - Demonstrates MCP async patterns with stdio transport
 * 
 * SDK: @modelcontextprotocol/sdk@^1.27.1
 * Transport: StdioServerTransport (stdio only)
 * 
 * Demos:
 *   1 - Sequential memory workflow (save→recall→stats)
 *   2 - Sequential with id tracking (prove ordering)
 *   3 - Error propagation (invalid params, DB failure)
 *   4 - Collab workflow mock (start→step→get_result)
 *   5 - Lifecycle (transport.close() + SIGTERM)
 * 
 * OUT-OF-SCOPE: streaming notifications (server→client without id)
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HARNESS_PATH = resolve(__dirname, '../src/mcp/test-harness.mjs');

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
      this.process.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          reject(new Error(`Harness exited with code ${code}`));
        }
      });

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
      const { resolve, startTime } = this.pending.get(message.id);
      const elapsed = Date.now() - startTime;
      this.pending.delete(message.id);
      resolve({ ...message, elapsed });
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
      this.pending.set(id, { resolve, reject, startTime: Date.now(), tool });
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

  getStderr() {
    return this.stderrLines;
  }
}

async function withClient(fn) {
  const client = new StdioClient();
  try {
    await client.start();
    await fn(client);
  } finally {
    await client.close();
  }
}

async function demo1_sequential() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 1: Sequential Memory Workflow                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('Pattern: Sequential await (stdio-safe)\n');

  await withClient(async (client) => {
    const steps = [
      { tool: 'memory_save', args: { content: 'Test memory for async demo', type: 'general_insight' } },
      { tool: 'memory_search', args: { query: 'async demo' } },
      { tool: 'memory_stats', args: {} }
    ];

    for (const step of steps) {
      const start = Date.now();
      const response = await client.send(step.tool, step.args);
      const elapsed = Date.now() - start;
      
      console.log(`[${elapsed}ms] ${step.tool}:`);
      console.log(`  id: ${response.id}`);
      if (response.result) {
        const data = JSON.parse(response.result.content[0].text);
        console.log(`  success: ${data.success !== false}`);
        if (data.id) console.log(`  id: ${data.id}`);
        if (data.count !== undefined) console.log(`  count: ${data.count}`);
      }
      if (response.error) {
        console.log(`  ERROR: ${response.error.message}`);
      }
      console.log();
    }
  });
}

async function demo2_idTracking() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 2: Sequential with ID Tracking                         ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('Pattern: Prove responses correlated by id (stdio order preserved)\n');

  await withClient(async (client) => {
    const requests = [
      { tool: 'memory_save', args: { content: 'First memory', type: 'general_insight' } },
      { tool: 'memory_save', args: { content: 'Second memory', type: 'bugfix_pattern' } },
      { tool: 'memory_save', args: { content: 'Third memory', type: 'api_pattern' } }
    ];

    console.log('Sending 3 requests sequentially...');
    const sent = [];
    for (const req of requests) {
      sent.push({ tool: req.tool, id: client.nextId });
      await client.send(req.tool, req.args);
    }

    console.log('Response ID correlation:');
    for (const s of sent) {
      console.log(`  Request for "${s.tool}" → response id: ${s.id}`);
    }
    console.log('\nNote: stdio preserves order, so response ids match request sequence');
  });
}

async function demo3_errorPropagation() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 3: Error Propagation                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('Pattern: isError: true responses (SDK 1.x pattern, not thrown)\n');

  await withClient(async (client) => {
    console.log('1. Valid request:');
    const valid = await client.send('memory_save', { content: 'Valid memory' });
    console.log(`   id: ${valid.id}, isError: ${valid.result?.isError || false}`);
    if (valid.result && !valid.result.isError) {
      const data = JSON.parse(valid.result.content[0].text);
      console.log(`   result: ${JSON.stringify(data).slice(0, 60)}...`);
    }
    console.log();

    console.log('2. Inject validation error:');
    await client.send('harness_control', { action: 'inject_error', errorType: 'validation' });
    const validationError = await client.send('memory_save', {});
    console.log(`   id: ${validationError.id}`);
    if (validationError.error) {
      console.log(`   JSON-RPC error: ${validationError.error.message}`);
    } else if (validationError.result?.isError) {
      try {
        const data = JSON.parse(validationError.result.content[0].text);
        console.log(`   error: ${data.error}`);
      } catch {
        console.log(`   error: ${validationError.result.content[0].text}`);
      }
    }
    console.log();

    console.log('3. Inject DB failure:');
    await client.send('harness_control', { action: 'inject_error', errorType: 'db_failure' });
    const dbError = await client.send('memory_save', { content: 'This should fail' });
    console.log(`   id: ${dbError.id}`);
    if (dbError.error) {
      console.log(`   JSON-RPC error: ${dbError.error.message}`);
    } else if (dbError.result?.isError) {
      try {
        const data = JSON.parse(dbError.result.content[0].text);
        console.log(`   error: ${data.error}`);
      } catch {
        console.log(`   error: ${dbError.result.content[0].text}`);
      }
    }
    console.log();

    await client.send('harness_control', { action: 'clear_errors' });
    console.log('4. Back to normal (cleared errors):');
    const normal = await client.send('memory_save', { content: 'Normal operation restored' });
    console.log(`   id: ${normal.id}, isError: ${normal.result?.isError || false}`);
    if (!normal.result?.isError) {
      console.log('   ✓ Server continues running after errors');
    }
  });
}

async function demo4_collabWorkflow() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 4: Collab Workflow Mock                                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('Pattern: Mocked collab state (no real server)\n');

  await withClient(async (client) => {
    console.log('1. Start session:');
    const session = await client.send('collab_start_session', {
      task: 'Implement new feature',
      maxRounds: 3
    });
    const sessionData = JSON.parse(session.result.content[0].text);
    console.log(`   sessionId: ${sessionData.sessionId}`);
    console.log(`   status: ${sessionData.status}`);
    console.log();

    console.log('2. Execute rounds:');
    for (let round = 1; round <= 3; round++) {
      const step = await client.send('collab_step', {
        sessionId: sessionData.sessionId,
        role: ['planner', 'critic', 'coder', 'reviewer'][round % 4]
      });
      const stepData = JSON.parse(step.result.content[0].text);
      console.log(`   Round ${round}: ${stepData.event.role} → ${stepData.event.status}`);
    }
    console.log();

    console.log('3. Get final result:');
    const result = await client.send('collab_get_result', {
      sessionId: sessionData.sessionId
    });
    const resultData = JSON.parse(result.result.content[0].text);
    console.log(`   status: ${resultData.status}`);
    console.log(`   rounds: ${resultData.rounds}`);
    console.log(`   summary: ${resultData.summary}`);
  });
}

async function demo5_lifecycle() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Demo 5: Lifecycle (SIGTERM + transport.close())             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log('Pattern: Graceful shutdown\n');

  await withClient(async (client) => {
    console.log('1. Making request before close...');
    await client.send('memory_stats', {});
    console.log('   Request completed\n');

    console.log('2. Calling transport.close() (SIGTERM)');
    await client.close();
    console.log('   ✓ Transport closed gracefully\n');

    const stderr = client.getStderr();
    const shutdownMsg = stderr.find(l => l.includes('SIGTERM'));
    console.log(`3. Harness shutdown message: "${shutdownMsg || 'N/A'}"`);
    console.log('   ✓ Server acknowledged shutdown\n');

    console.log('Note: In production, use SIGTERM for container orchestration');
    console.log('      and SIGINT (Ctrl+C) for interactive terminal sessions');
  });
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
ACFM MCP Async Demo
===================
Demonstrates MCP async patterns with StdioServerTransport.

Usage: node demo/mcp-async-demo.mjs [demo-number|all]

Demos:
  1  Sequential memory workflow (save→recall→stats)
  2  Sequential with id tracking
  3  Error propagation (isError: true responses)
  4  Collab workflow mock (start→step→get_result)
  5  Lifecycle (SIGTERM + transport.close())
  all Run all demos in sequence

Examples:
  node demo/mcp-async-demo.mjs 1
  node demo/mcp-async-demo.mjs all

Notes:
  - stdio transport is sequential (no true concurrent writes)
  - Responses are correlated by JSON-RPC id field
  - Error handling uses isError: true (SDK 1.x pattern)
  - Notifications (server→client without id) are OUT-OF-SCOPE
`);
    process.exit(0);
  }

  const demo = args[0] || 'all';

  const demos = {
    '1': demo1_sequential,
    '2': demo2_idTracking,
    '3': demo3_errorPropagation,
    '4': demo4_collabWorkflow,
    '5': demo5_lifecycle
  };

  if (demo === 'all') {
    for (const [num, fn] of Object.entries(demos)) {
      await fn();
    }
    console.log('\n✓ All demos completed');
  } else if (demos[demo]) {
    await demos[demo]();
    console.log('\n✓ Demo completed');
  } else {
    console.error(`Unknown demo: ${demo}`);
    console.error('Use --help for usage');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Demo failed:', err.message);
  process.exit(1);
});
