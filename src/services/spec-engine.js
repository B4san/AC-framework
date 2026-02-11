/**
 * spec-engine.js — Core logic for the acfm spec system.
 *
 * Pure filesystem operations: reads schemas, resolves artifact status,
 * manages change directories, parses tasks, generates instructions JSON.
 */

import { readFile, readdir, stat, mkdir, rename, access, writeFile } from 'node:fs/promises';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMAS_DIR = resolve(__dirname, '../schemas');
const OPENSPEC_DIR = 'openspec';

// ─── Schema Loading ──────────────────────────────────────────────────────────

/**
 * Load a schema definition from src/schemas/<name>/schema.yaml
 */
export async function loadSchema(schemaName) {
  const schemaPath = join(SCHEMAS_DIR, schemaName, 'schema.yaml');
  try {
    const content = await readFile(schemaPath, 'utf-8');
    return yaml.load(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Schema "${schemaName}" not found at ${schemaPath}`);
    }
    throw err;
  }
}

/**
 * List all available schemas by scanning src/schemas/
 */
export async function listSchemas() {
  const entries = await readdir(SCHEMAS_DIR, { withFileTypes: true });
  const schemas = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      try {
        const schema = await loadSchema(entry.name);
        schemas.push({ name: schema.name, description: schema.description });
      } catch {
        // skip invalid schema dirs
      }
    }
  }
  return schemas;
}

/**
 * Load a template file for a specific schema + artifact
 */
export async function loadTemplate(schemaName, artifactId) {
  // Try artifact-specific template first
  const candidates = [
    join(SCHEMAS_DIR, schemaName, 'templates', `${artifactId}.md`),
  ];
  for (const tplPath of candidates) {
    try {
      return await readFile(tplPath, 'utf-8');
    } catch {
      // try next
    }
  }
  return '';
}

// ─── Project Config ──────────────────────────────────────────────────────────

/**
 * Read the project's openspec/config.yaml
 */
export async function readProjectConfig(cwd = process.cwd()) {
  const configPath = join(cwd, OPENSPEC_DIR, 'config.yaml');
  try {
    const content = await readFile(configPath, 'utf-8');
    return yaml.load(content) || {};
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

/**
 * Check if openspec is initialized in the current project
 */
export async function isInitialized(cwd = process.cwd()) {
  try {
    await access(join(cwd, OPENSPEC_DIR, 'config.yaml'));
    return true;
  } catch {
    return false;
  }
}

// ─── Init ────────────────────────────────────────────────────────────────────

/**
 * Initialize the openspec/ directory structure
 */
export async function initProject(cwd = process.cwd(), schemaName = 'spec-driven') {
  // Validate schema exists
  await loadSchema(schemaName);

  const base = join(cwd, OPENSPEC_DIR);
  await mkdir(join(base, 'specs'), { recursive: true });
  await mkdir(join(base, 'changes'), { recursive: true });

  const configPath = join(base, 'config.yaml');
  try {
    await access(configPath);
    // Already exists, don't overwrite
    return { created: false, path: base };
  } catch {
    const configContent = `schema: ${schemaName}\n\n# Project context (optional)\n# This is shown to AI when creating artifacts.\n# Add your tech stack, conventions, style guides, domain knowledge, etc.\n# Example:\n#   context: |\n#     Tech stack: TypeScript, React, Node.js\n#     We use conventional commits\n#     Domain: e-commerce platform\n\n# Per-artifact rules (optional)\n# Add custom rules for specific artifacts.\n# Example:\n#   rules:\n#     proposal:\n#       - Keep proposals under 500 words\n#       - Always include a \"Non-goals\" section\n#     tasks:\n#       - Break tasks into chunks of max 2 hours\n`;
    await writeFile(configPath, configContent, 'utf-8');
    return { created: true, path: base };
  }
}

// ─── Change Management ───────────────────────────────────────────────────────

/**
 * Get the changes directory path
 */
function changesDir(cwd) {
  return join(cwd, OPENSPEC_DIR, 'changes');
}

/**
 * Create a new change directory with scaffolded files
 */
export async function createChange(name, cwd = process.cwd(), schemaOverride = null) {
  const config = await readProjectConfig(cwd);
  if (!config) {
    throw new Error('OpenSpec not initialized. Run `acfm spec init` first.');
  }

  const schemaName = schemaOverride || config.schema || 'spec-driven';
  const schema = await loadSchema(schemaName);

  const changeDir = join(changesDir(cwd), name);

  // Check if already exists
  try {
    await access(changeDir);
    throw new Error(`Change "${name}" already exists at ${changeDir}`);
  } catch (err) {
    if (err.message.includes('already exists')) throw err;
    // ENOENT is expected — proceed
  }

  await mkdir(changeDir, { recursive: true });

  // Write .openspec.yaml
  const meta = {
    schema: schemaName,
    name,
    createdAt: new Date().toISOString(),
  };
  await writeFile(join(changeDir, '.openspec.yaml'), yaml.dump(meta), 'utf-8');

  // Scaffold empty artifact files
  for (const artifact of schema.artifacts) {
    if (artifact.outputPath.endsWith('/')) {
      // Directory-based artifact (e.g., specs/)
      await mkdir(join(changeDir, artifact.outputPath), { recursive: true });
    } else {
      // File-based artifact — create empty placeholder
      await writeFile(join(changeDir, artifact.outputPath), '', 'utf-8');
    }
  }

  return { changeDir, schemaName, artifacts: schema.artifacts.map(a => a.id) };
}

/**
 * List all active (non-archived) changes
 */
export async function listChanges(cwd = process.cwd()) {
  const dir = changesDir(cwd);
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const changes = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'archive') continue;

    const changePath = join(dir, entry.name);
    const metaPath = join(changePath, '.openspec.yaml');
    let meta = {};
    try {
      const content = await readFile(metaPath, 'utf-8');
      meta = yaml.load(content) || {};
    } catch {
      // No metadata, still list it
    }

    // Get last modified time
    let lastModified;
    try {
      const stats = await stat(changePath);
      lastModified = stats.mtime.toISOString();
    } catch {
      lastModified = null;
    }

    // Count artifacts done
    const schemaName = meta.schema || 'spec-driven';
    let artifactsDone = 0;
    let artifactsTotal = 0;
    try {
      const schema = await loadSchema(schemaName);
      artifactsTotal = schema.artifacts.length;
      for (const artifact of schema.artifacts) {
        const done = await isArtifactDone(changePath, artifact);
        if (done) artifactsDone++;
      }
    } catch {
      // schema not found, just show name
    }

    changes.push({
      name: entry.name,
      schema: schemaName,
      lastModified,
      status: `${artifactsDone}/${artifactsTotal} artifacts`,
    });
  }

  // Sort by most recently modified
  changes.sort((a, b) => {
    if (!a.lastModified) return 1;
    if (!b.lastModified) return -1;
    return new Date(b.lastModified) - new Date(a.lastModified);
  });

  return changes;
}

// ─── Artifact Status ─────────────────────────────────────────────────────────

/**
 * Check if a single artifact is "done" (file exists and has content)
 */
async function isArtifactDone(changePath, artifact) {
  const fullPath = join(changePath, artifact.outputPath);

  if (artifact.outputPath.endsWith('/')) {
    // Directory-based: check if any .md files exist inside
    try {
      const files = await readdir(fullPath, { recursive: true });
      const mdFiles = files.filter(f => typeof f === 'string' && f.endsWith('.md'));
      if (mdFiles.length === 0) return false;
      // Check at least one has content
      for (const f of mdFiles) {
        const content = await readFile(join(fullPath, f), 'utf-8');
        if (content.trim().length > 0) return true;
      }
      return false;
    } catch {
      return false;
    }
  } else {
    // File-based: check exists and has content
    try {
      const content = await readFile(fullPath, 'utf-8');
      return content.trim().length > 0;
    } catch {
      return false;
    }
  }
}

/**
 * Get full status for a change, including per-artifact status
 */
export async function getChangeStatus(name, cwd = process.cwd()) {
  const changePath = join(changesDir(cwd), name);

  // Read change metadata
  const metaPath = join(changePath, '.openspec.yaml');
  let meta;
  try {
    const content = await readFile(metaPath, 'utf-8');
    meta = yaml.load(content) || {};
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Change "${name}" not found.`);
    }
    throw err;
  }

  const schemaName = meta.schema || 'spec-driven';
  const schema = await loadSchema(schemaName);

  // Build status for each artifact
  const doneMap = {};
  for (const artifact of schema.artifacts) {
    doneMap[artifact.id] = await isArtifactDone(changePath, artifact);
  }

  const artifacts = schema.artifacts.map(artifact => {
    const done = doneMap[artifact.id];
    let status;
    if (done) {
      status = 'done';
    } else {
      // Check if all dependencies are done
      const allDepsDone = artifact.dependencies.every(dep => doneMap[dep]);
      status = allDepsDone ? 'ready' : 'blocked';
    }
    return {
      id: artifact.id,
      status,
      dependencies: artifact.dependencies,
    };
  });

  const isComplete = artifacts.every(a => a.status === 'done');

  return {
    schemaName,
    artifacts,
    isComplete,
    applyRequires: schema.applyRequires || [],
  };
}

// ─── Instructions ────────────────────────────────────────────────────────────

/**
 * Get instructions for creating a specific artifact
 */
export async function getArtifactInstructions(artifactId, changeName, cwd = process.cwd()) {
  const changePath = join(changesDir(cwd), changeName);
  const config = await readProjectConfig(cwd);
  if (!config) {
    throw new Error('OpenSpec not initialized. Run `acfm spec init` first.');
  }

  const metaPath = join(changePath, '.openspec.yaml');
  let meta;
  try {
    const content = await readFile(metaPath, 'utf-8');
    meta = yaml.load(content) || {};
  } catch {
    throw new Error(`Change "${changeName}" not found.`);
  }

  const schemaName = meta.schema || config.schema || 'spec-driven';
  const schema = await loadSchema(schemaName);

  const artifact = schema.artifacts.find(a => a.id === artifactId);
  if (!artifact) {
    throw new Error(`Artifact "${artifactId}" not found in schema "${schemaName}". Available: ${schema.artifacts.map(a => a.id).join(', ')}`);
  }

  // Load template
  const template = await loadTemplate(schemaName, artifactId);

  // Build context from config
  const context = config.context || '';

  // Build rules from config
  let rules = '';
  if (config.rules && config.rules[artifactId]) {
    const artifactRules = config.rules[artifactId];
    if (Array.isArray(artifactRules)) {
      rules = artifactRules.map(r => `- ${r}`).join('\n');
    } else {
      rules = String(artifactRules);
    }
  }

  // Build dependencies (paths to completed artifact files the agent should read)
  const dependencies = [];
  for (const depId of artifact.dependencies) {
    const depArtifact = schema.artifacts.find(a => a.id === depId);
    if (depArtifact) {
      const depPath = join(OPENSPEC_DIR, 'changes', changeName, depArtifact.outputPath);
      dependencies.push(depPath);
    }
  }

  // Build output path
  const outputPath = join(OPENSPEC_DIR, 'changes', changeName, artifact.outputPath);

  // Build instruction from schema
  const instruction = artifact.instruction || '';

  // Determine what this artifact unlocks
  const unlocks = artifact.unlocks || [];

  return {
    context,
    rules,
    template,
    instruction: instruction.trim(),
    outputPath,
    dependencies,
    unlocks,
  };
}

/**
 * Get instructions for the apply phase (implementing tasks)
 */
export async function getApplyInstructions(changeName, cwd = process.cwd()) {
  const changePath = join(changesDir(cwd), changeName);
  const config = await readProjectConfig(cwd);
  if (!config) {
    throw new Error('OpenSpec not initialized. Run `acfm spec init` first.');
  }

  const metaPath = join(changePath, '.openspec.yaml');
  let meta;
  try {
    const content = await readFile(metaPath, 'utf-8');
    meta = yaml.load(content) || {};
  } catch {
    throw new Error(`Change "${changeName}" not found.`);
  }

  const schemaName = meta.schema || config.schema || 'spec-driven';
  const schema = await loadSchema(schemaName);

  // Check if apply requirements are met
  const doneMap = {};
  for (const artifact of schema.artifacts) {
    doneMap[artifact.id] = await isArtifactDone(changePath, artifact);
  }

  const applyReqs = schema.applyRequires || [];
  const missingReqs = applyReqs.filter(id => !doneMap[id]);

  if (missingReqs.length > 0) {
    return {
      contextFiles: [],
      progress: { total: 0, complete: 0, remaining: 0 },
      state: 'blocked',
      instruction: `Cannot apply: missing required artifacts: ${missingReqs.join(', ')}. Use openspec-continue-change to create them first.`,
      tasks: [],
    };
  }

  // Build context files — all completed artifacts
  const contextFiles = [];
  for (const artifact of schema.artifacts) {
    if (doneMap[artifact.id]) {
      const artifactPath = join(OPENSPEC_DIR, 'changes', changeName, artifact.outputPath);
      contextFiles.push(artifactPath);
    }
  }

  // Parse tasks.md for progress
  const tasksPath = join(changePath, 'tasks.md');
  let tasks = [];
  let total = 0;
  let complete = 0;
  try {
    const tasksContent = await readFile(tasksPath, 'utf-8');
    const lines = tasksContent.split('\n');
    for (const line of lines) {
      const checkedMatch = line.match(/^- \[x\]\s+(.+)/i);
      const uncheckedMatch = line.match(/^- \[ \]\s+(.+)/);
      if (checkedMatch) {
        tasks.push({ task: checkedMatch[1].trim(), done: true });
        total++;
        complete++;
      } else if (uncheckedMatch) {
        tasks.push({ task: uncheckedMatch[1].trim(), done: false });
        total++;
      }
    }
  } catch {
    // tasks.md doesn't exist or is empty
  }

  const remaining = total - complete;

  // Determine state
  let state;
  if (total === 0) {
    state = 'blocked';
  } else if (remaining === 0) {
    state = 'all_done';
  } else {
    state = 'in_progress';
  }

  // Build dynamic instruction
  let instruction;
  if (state === 'all_done') {
    instruction = 'All tasks are complete. Consider running openspec-verify-change to validate, then openspec-archive-change to archive.';
  } else if (state === 'blocked') {
    instruction = 'No tasks found. Create tasks first using openspec-continue-change.';
  } else {
    instruction = `${remaining} of ${total} tasks remaining. Implement each pending task, following the specs and design. Mark tasks as [x] when complete.`;
  }

  return {
    contextFiles,
    progress: { total, complete, remaining },
    state,
    instruction,
    tasks,
  };
}

// ─── Archive ─────────────────────────────────────────────────────────────────

/**
 * Archive a completed change
 */
export async function archiveChange(name, cwd = process.cwd()) {
  const changePath = join(changesDir(cwd), name);

  // Verify change exists
  try {
    await access(changePath);
  } catch {
    throw new Error(`Change "${name}" not found.`);
  }

  const archiveDir = join(changesDir(cwd), 'archive');
  await mkdir(archiveDir, { recursive: true });

  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const archiveName = `${dateStr}-${name}`;
  const archivePath = join(archiveDir, archiveName);

  await rename(changePath, archivePath);

  return { archivedTo: archivePath, archiveName };
}

// ─── Global Status ───────────────────────────────────────────────────────────

/**
 * Get global initialization status (used by onboard skill's preflight)
 */
export async function getGlobalStatus(cwd = process.cwd()) {
  const initialized = await isInitialized(cwd);
  if (!initialized) {
    return { initialized: false };
  }

  const config = await readProjectConfig(cwd);
  const changes = await listChanges(cwd);

  return {
    initialized: true,
    schema: config?.schema || 'spec-driven',
    activeChanges: changes.length,
    changes,
  };
}

// ─── Validate ────────────────────────────────────────────────────────────────

/**
 * Validate a change's artifacts for structural correctness
 */
export async function validateChange(name, cwd = process.cwd()) {
  const changePath = join(changesDir(cwd), name);
  const issues = [];

  // Check change exists
  try {
    await access(changePath);
  } catch {
    throw new Error(`Change "${name}" not found.`);
  }

  // Read metadata
  const metaPath = join(changePath, '.openspec.yaml');
  let meta;
  try {
    const content = await readFile(metaPath, 'utf-8');
    meta = yaml.load(content) || {};
  } catch {
    issues.push({ severity: 'error', message: 'Missing .openspec.yaml metadata file' });
    return { valid: false, issues };
  }

  const schemaName = meta.schema || 'spec-driven';
  let schema;
  try {
    schema = await loadSchema(schemaName);
  } catch {
    issues.push({ severity: 'error', message: `Schema "${schemaName}" not found` });
    return { valid: false, issues };
  }

  // Check each artifact
  for (const artifact of schema.artifacts) {
    const done = await isArtifactDone(changePath, artifact);
    if (!done) {
      issues.push({
        severity: 'warning',
        message: `Artifact "${artifact.id}" is empty or missing`,
      });
    } else {
      // Artifact exists — do basic content validation
      if (!artifact.outputPath.endsWith('/')) {
        const content = await readFile(join(changePath, artifact.outputPath), 'utf-8');
        if (content.trim().length < 20) {
          issues.push({
            severity: 'warning',
            message: `Artifact "${artifact.id}" has very little content (${content.trim().length} chars)`,
          });
        }
      }
    }
  }

  // Check tasks.md for unchecked items
  try {
    const tasksContent = await readFile(join(changePath, 'tasks.md'), 'utf-8');
    const unchecked = (tasksContent.match(/^- \[ \]/gm) || []).length;
    const checked = (tasksContent.match(/^- \[x\]/gim) || []).length;
    if (unchecked > 0) {
      issues.push({
        severity: 'info',
        message: `${unchecked} of ${unchecked + checked} tasks are still pending`,
      });
    }
  } catch {
    // no tasks.md
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
  };
}
