import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { platform } from 'node:os';

function preferredOpenCodePath() {
  const home = process.env.HOME;
  if (!home) return null;
  return join(home, '.opencode', 'bin', 'opencode');
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: options.stdio || 'pipe',
    env: process.env,
    ...options,
  });
}

function runInstallCommand(command) {
  if (platform() === 'win32') {
    return run('cmd.exe', ['/c', command], { stdio: 'inherit' });
  }
  return run('bash', ['-lc', command], { stdio: 'inherit' });
}

export function hasCommand(command) {
  return Boolean(resolveCommandPath(command));
}

export function resolveCommandPath(command) {
  const preferredPath = command === 'opencode' ? preferredOpenCodePath() : null;
  if (preferredPath && existsSync(preferredPath)) {
    return preferredPath;
  }
  const locator = platform() === 'win32' ? 'where' : 'which';
  const result = run(locator, [command]);
  if (result.status !== 0) return null;
  const out = String(result.stdout || '').trim();
  if (!out) return null;
  return out.split('\n').map((line) => line.trim()).filter(Boolean)[0] || null;
}

export function installOpenCode() {
  if (hasCommand('opencode')) {
    return { success: true, installed: false, message: 'OpenCode already installed' };
  }

  if (platform() === 'win32') {
    return {
      success: false,
      installed: false,
      message: 'Automatic OpenCode installation is not supported on Windows in this flow',
    };
  }

  const result = run('bash', ['-lc', 'curl -fsSL https://opencode.ai/install | bash'], { stdio: 'inherit' });
  if (result.status !== 0) {
    return { success: false, installed: false, message: 'Failed to install OpenCode using installer script' };
  }

  return {
    success: hasCommand('opencode'),
    installed: true,
    message: hasCommand('opencode')
      ? 'OpenCode installed successfully'
      : 'OpenCode installer finished but binary is not available in PATH yet',
  };
}

function resolveTmuxInstallCommand() {
  if (platform() === 'darwin') {
    if (hasCommand('brew')) return 'brew install tmux';
    return null;
  }

  if (platform() === 'linux') {
    if (hasCommand('apt-get')) return 'sudo apt-get update && sudo apt-get install -y tmux';
    if (hasCommand('dnf')) return 'sudo dnf install -y tmux';
    if (hasCommand('yum')) return 'sudo yum install -y tmux';
    if (hasCommand('pacman')) return 'sudo pacman -S --noconfirm tmux';
    if (hasCommand('zypper')) return 'sudo zypper --non-interactive install tmux';
  }

  return null;
}

function resolveZellijInstallCommand() {
  if (platform() === 'darwin') {
    if (hasCommand('brew')) return 'brew install zellij';
    return null;
  }

  if (platform() === 'linux') {
    if (hasCommand('apt-get')) return 'sudo apt-get update && sudo apt-get install -y zellij';
    if (hasCommand('dnf')) return 'sudo dnf install -y zellij';
    if (hasCommand('yum')) return 'sudo yum install -y zellij';
    if (hasCommand('pacman')) return 'sudo pacman -S --noconfirm zellij';
    if (hasCommand('zypper')) return 'sudo zypper --non-interactive install zellij';
  }

  if (platform() === 'win32') {
    if (hasCommand('winget')) return 'winget install --id zellij-org.zellij -e';
    if (hasCommand('choco')) return 'choco install zellij -y';
    if (hasCommand('scoop')) return 'scoop install zellij';
  }

  return null;
}

export function installTmux() {
  if (hasCommand('tmux')) {
    return { success: true, installed: false, message: 'tmux already installed' };
  }

  const installCommand = resolveTmuxInstallCommand();
  if (!installCommand) {
    return {
      success: false,
      installed: false,
      message: 'No supported package manager detected for automatic tmux installation',
    };
  }

  const result = runInstallCommand(installCommand);
  if (result.status !== 0) {
    return { success: false, installed: false, message: 'tmux installation command failed' };
  }

  return {
    success: hasCommand('tmux'),
    installed: true,
    message: hasCommand('tmux')
      ? 'tmux installed successfully'
      : 'tmux installer finished but binary is not available in PATH yet',
  };
}

export function installZellij() {
  if (hasCommand('zellij')) {
    return { success: true, installed: false, message: 'zellij already installed' };
  }

  const installCommand = resolveZellijInstallCommand();
  if (!installCommand) {
    return {
      success: false,
      installed: false,
      message: 'No supported package manager detected for automatic zellij installation',
    };
  }

  const result = runInstallCommand(installCommand);
  if (result.status !== 0) {
    return { success: false, installed: false, message: 'zellij installation command failed' };
  }

  return {
    success: hasCommand('zellij'),
    installed: true,
    message: hasCommand('zellij')
      ? 'zellij installed successfully'
      : 'zellij installer finished but binary is not available in PATH yet',
  };
}

export function ensureCollabDependencies(options = {}) {
  const installTmuxEnabled = options.installTmux ?? true;
  const installZellijEnabled = options.installZellij ?? true;
  const opencode = installOpenCode();
  const tmux = installTmuxEnabled
    ? installTmux()
    : { success: hasCommand('tmux'), installed: false, message: hasCommand('tmux') ? 'tmux already installed' : 'tmux installation skipped' };
  const zellij = installZellijEnabled
    ? installZellij()
    : { success: hasCommand('zellij'), installed: false, message: hasCommand('zellij') ? 'zellij already installed' : 'zellij installation skipped' };

  const hasMultiplexer = tmux.success || zellij.success;
  return {
    opencode,
    tmux,
    zellij,
    success: opencode.success && hasMultiplexer,
  };
}
