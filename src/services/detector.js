/**
 * Attempts to detect the current IDE/editor from environment variables.
 * Returns { ide, module } where `ide` is a display name and `module` is
 * the corresponding framework folder. Both are null when undetectable.
 */
export function detectIDE() {
  const env = process.env;

  // Cursor: sets CURSOR_TRACE_DIR or other CURSOR_* vars
  if (env.CURSOR_TRACE_DIR || Object.keys(env).some((k) => k.startsWith('CURSOR_'))) {
    return { ide: 'Cursor', module: '.cursor' };
  }

  // Windsurf: sets WINDSURF_* vars
  if (Object.keys(env).some((k) => k.startsWith('WINDSURF_'))) {
    return { ide: 'Windsurf', module: '.windsurf' };
  }

  // Trae: sets TRAE_* vars
  if (Object.keys(env).some((k) => k.startsWith('TRAE_'))) {
    return { ide: 'Trae', module: '.trae' };
  }

  // VS Code / GitHub Copilot (without Cursor/Windsurf/Trae)
  if (env.TERM_PROGRAM === 'vscode' || env.VSCODE_PID || env.VSCODE_CWD) {
    return { ide: 'VS Code (Copilot)', module: '.github' };
  }

  return { ide: null, module: null };
}
