import { spawn } from 'node:child_process';

function parseOpenCodeRunOutput(stdout) {
  const ndjsonLines = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (ndjsonLines.length > 0) {
    const textChunks = [];
    for (const line of ndjsonLines) {
      try {
        const event = JSON.parse(line);
        const text = event?.part?.text;
        if (typeof text === 'string' && text.trim()) {
          textChunks.push(text.trim());
        }
      } catch {
        // ignore malformed lines and continue
      }
    }
    if (textChunks.length > 0) {
      return textChunks.join('\n\n');
    }
  }

  try {
    const parsed = JSON.parse(stdout);
    if (Array.isArray(parsed)) {
      const textParts = parsed
        .filter((event) => event?.type === 'message' && Array.isArray(event?.parts))
        .flatMap((event) => event.parts)
        .filter((part) => part?.type === 'text' && typeof part?.text === 'string')
        .map((part) => part.text.trim())
        .filter(Boolean);
      if (textParts.length > 0) return textParts.join('\n\n');
    }
  } catch {
    // ignore JSON parse errors and fallback to raw output
  }

  return stdout.trim();
}

function parseOpenCodeEvents(stdout) {
  const lines = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const events = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line));
    } catch {
      // ignore malformed event lines
    }
  }
  return events;
}

export async function runOpenCodePromptDetailed({ prompt, cwd, model, agent, timeoutMs = 180000, binaryPath }) {
  const binary = binaryPath || process.env.ACFM_OPENCODE_BIN || 'opencode';
  const args = ['run', '--format', 'json'];
  if (model) {
    args.push('--model', model);
  }
  if (agent) {
    args.push('--agent', agent);
  }
  args.push('--', prompt);

  const { stdout, stderr } = await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(binary, args, {
      cwd,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    let err = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1500).unref();
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      out += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      err += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      rejectPromise(error);
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        rejectPromise(new Error(`opencode timed out after ${timeoutMs}ms`));
        return;
      }
      if (code !== 0) {
        const details = [err.trim(), out.trim()].filter(Boolean).join(' | ');
        rejectPromise(new Error(details || `opencode exited with code ${code}${signal ? ` (${signal})` : ''}`));
        return;
      }
      resolvePromise({ stdout: out, stderr: err });
    });
  });

  const text = parseOpenCodeRunOutput(stdout);
  const events = parseOpenCodeEvents(stdout);

  return {
    text: text || (stderr?.trim() || ''),
    stdout,
    stderr,
    events,
  };
}

export async function runOpenCodePrompt({ prompt, cwd, model, agent, timeoutMs = 180000, binaryPath }) {
  const detailed = await runOpenCodePromptDetailed({
    prompt,
    cwd,
    model,
    agent,
    timeoutMs,
    binaryPath,
  });
  return detailed.text;
}

export async function listOpenCodeModels({ provider = null, binaryPath, refresh = false, timeoutMs = 45000 }) {
  const binary = binaryPath || process.env.ACFM_OPENCODE_BIN || 'opencode';
  const args = ['models'];
  if (provider) {
    args.push(provider);
  }
  if (refresh) {
    args.push('--refresh');
  }

  const stdout = await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(binary, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    let err = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 1500).unref();
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      out += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      err += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      rejectPromise(error);
    });

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (timedOut) {
        rejectPromise(new Error(`opencode models timed out after ${timeoutMs}ms`));
        return;
      }
      if (code !== 0) {
        const details = [err.trim(), out.trim()].filter(Boolean).join(' | ');
        rejectPromise(new Error(details || `opencode models exited with code ${code}${signal ? ` (${signal})` : ''}`));
        return;
      }
      resolvePromise(out);
    });
  });

  const models = stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.includes('/'));

  return [...new Set(models)].sort((a, b) => a.localeCompare(b));
}
