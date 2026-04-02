import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chmod, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { arch, homedir, platform } from 'node:os';
import { createHash } from 'node:crypto';

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

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ac-framework',
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) while fetching ${url}`);
  }
  return response.json();
}

function sha256HexFromBuffer(buffer) {
  const hash = createHash('sha256');
  hash.update(buffer);
  return hash.digest('hex');
}

function managedToolsRoot() {
  return join(homedir(), '.acfm', 'tools', 'zellij');
}

function platformAssetPrefix() {
  const p = platform();
  const a = arch();
  if (p === 'linux' && a === 'x64') return 'zellij-x86_64-unknown-linux-musl';
  if (p === 'linux' && a === 'arm64') return 'zellij-aarch64-unknown-linux-musl';
  if (p === 'darwin' && a === 'x64') return 'zellij-x86_64-apple-darwin';
  if (p === 'darwin' && a === 'arm64') return 'zellij-aarch64-apple-darwin';
  if (p === 'win32' && a === 'x64') return 'zellij-x86_64-pc-windows-msvc';
  return null;
}

function managedZellijBinaryPath(version) {
  const fileName = platform() === 'win32' ? 'zellij.exe' : 'zellij';
  return join(managedToolsRoot(), version, fileName);
}

function extractTarball(tarPath, outputDir) {
  return run('tar', ['-xzf', tarPath, '-C', outputDir]);
}

function findReleaseAsset(release, suffix) {
  return (release.assets || []).find((asset) => asset.name === suffix) || null;
}

export function resolveManagedZellijPath(config = null) {
  const fromEnv = process.env.ACFM_ZELLIJ_BIN;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const configured = config?.agents?.zellij?.binaryPath;
  if (configured && existsSync(configured)) return configured;
  return null;
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

export async function installManagedZellijLatest() {
  const existingSystem = resolveCommandPath('zellij');
  if (existingSystem) {
    return {
      success: true,
      installed: false,
      version: null,
      binaryPath: existingSystem,
      message: 'zellij already installed in system PATH',
      source: 'system',
    };
  }

  const prefix = platformAssetPrefix();
  if (!prefix) {
    return {
      success: false,
      installed: false,
      version: null,
      binaryPath: null,
      message: `Unsupported OS/arch for managed zellij install: ${platform()}/${arch()}`,
      source: 'managed',
    };
  }

  try {
    const release = await fetchJson('https://api.github.com/repos/zellij-org/zellij/releases/latest');
    const version = String(release.tag_name || '').trim() || 'latest';

    if (platform() === 'win32') {
      const zipAsset = findReleaseAsset(release, `${prefix}.zip`);
      if (!zipAsset) {
        throw new Error(`No matching Windows asset found for ${prefix}`);
      }
      return {
        success: false,
        installed: false,
        version,
        binaryPath: null,
        message: 'Managed Windows zellij install is not implemented yet; use winget/choco/scoop.',
        source: 'managed',
      };
    }

    const tarAsset = findReleaseAsset(release, `${prefix}.tar.gz`);
    if (!tarAsset?.browser_download_url) {
      throw new Error(`No matching zellij asset found for ${prefix}`);
    }

    const targetDir = join(managedToolsRoot(), version);
    const binaryPath = managedZellijBinaryPath(version);
    if (existsSync(binaryPath)) {
      return {
        success: true,
        installed: false,
        version,
        binaryPath,
        message: `Managed zellij already installed (${version})`,
        source: 'managed',
      };
    }

    await mkdir(targetDir, { recursive: true });
    const tmpTarPath = join(targetDir, `${prefix}.tar.gz.download`);
    const response = await fetch(tarAsset.browser_download_url, {
      headers: { 'User-Agent': 'ac-framework' },
    });
    if (!response.ok) {
      throw new Error(`Failed downloading ${tarAsset.name} (${response.status})`);
    }
    const raw = Buffer.from(await response.arrayBuffer());

    const expectedDigest = String(tarAsset.digest || '').replace(/^sha256:/, '');
    if (expectedDigest) {
      const actualDigest = sha256HexFromBuffer(raw);
      if (actualDigest !== expectedDigest) {
        throw new Error(`Digest mismatch for ${tarAsset.name}`);
      }
    }

    await writeFile(tmpTarPath, raw);
    const extracted = extractTarball(tmpTarPath, targetDir);
    await rm(tmpTarPath, { force: true });
    if (extracted.status !== 0) {
      throw new Error('Failed extracting zellij tarball');
    }
    if (!existsSync(binaryPath)) {
      throw new Error(`zellij binary not found after extraction at ${binaryPath}`);
    }
    await chmod(binaryPath, 0o755);

    const versionProbe = run(binaryPath, ['--version']);
    if (versionProbe.status !== 0) {
      throw new Error('Installed zellij binary failed version check');
    }

    return {
      success: true,
      installed: true,
      version,
      binaryPath,
      message: `Managed zellij installed (${version})`,
      source: 'managed',
    };
  } catch (error) {
    return {
      success: false,
      installed: false,
      version: null,
      binaryPath: null,
      message: `Managed zellij install failed: ${error.message}`,
      source: 'managed',
    };
  }
}

export async function ensureCollabDependencies(options = {}) {
  const installTmuxEnabled = options.installTmux ?? true;
  const installZellijEnabled = options.installZellij ?? true;
  const preferManagedZellij = options.preferManagedZellij ?? false;
  const opencode = installOpenCode();
  const tmux = installTmuxEnabled
    ? installTmux()
    : { success: hasCommand('tmux'), installed: false, message: hasCommand('tmux') ? 'tmux already installed' : 'tmux installation skipped' };
  const zellij = installZellijEnabled
    ? (preferManagedZellij ? await installManagedZellijLatest() : installZellij())
    : { success: hasCommand('zellij'), installed: false, message: hasCommand('zellij') ? 'zellij already installed' : 'zellij installation skipped' };

  const hasMultiplexer = tmux.success || zellij.success;
  return {
    opencode,
    tmux,
    zellij,
    success: opencode.success && hasMultiplexer,
  };
}
