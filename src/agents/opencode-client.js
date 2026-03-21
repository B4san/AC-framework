import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

function parseOpenCodeRunOutput(stdout) {
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

export async function runOpenCodePrompt({ prompt, cwd, model, agent, timeoutMs = 180000, binaryPath }) {
  const binary = binaryPath || process.env.ACFM_OPENCODE_BIN || 'opencode';
  const args = ['run', '--format', 'json'];
  if (model) {
    args.push('--model', model);
  }
  if (agent) {
    args.push('--agent', agent);
  }
  args.push('--', prompt);

  const { stdout, stderr } = await execFileAsync(binary, args, {
    cwd,
    timeout: timeoutMs,
    maxBuffer: 10 * 1024 * 1024,
  });

  const parsed = parseOpenCodeRunOutput(stdout);
  if (!parsed && stderr?.trim()) {
    return stderr.trim();
  }
  return parsed;
}
