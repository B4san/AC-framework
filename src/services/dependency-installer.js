import { spawnSync } from 'node:child_process';
import { platform } from 'node:os';

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: options.stdio || 'pipe',
    env: process.env,
    ...options,
  });
}

export function hasCommand(command) {
  const locator = platform() === 'win32' ? 'where' : 'which';
  const result = run(locator, [command]);
  return result.status === 0;
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

  const result = run('bash', ['-lc', installCommand], { stdio: 'inherit' });
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

export function ensureCollabDependencies() {
  const opencode = installOpenCode();
  const tmux = installTmux();
  return {
    opencode,
    tmux,
    success: opencode.success && tmux.success,
  };
}
