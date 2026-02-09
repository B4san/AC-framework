import { readdir, readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const SKILLS_ROOT = 'skills';

const AC_CANDIDATES = [
  'commands/ac.md',
  'commands/opsx/ac.md',
  'prompts/ac.md',
  'workflows/ac.md',
  'command/ac.md',
  'openspec/commands/ac.md',
];

function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function getSkillManifest(frameworkDir, assistant) {
  const skillsPath = join(frameworkDir, assistant, SKILLS_ROOT);
  const entries = await readdir(skillsPath, { withFileTypes: true });

  const skills = {};
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const skillPath = join(skillsPath, entry.name, 'SKILL.md');
    if (!(await pathExists(skillPath))) continue;
    const content = await readFile(skillPath, 'utf8');
    skills[entry.name] = sha256(content);
  }

  return skills;
}

async function getAcHash(frameworkDir, assistant) {
  for (const relPath of AC_CANDIDATES) {
    const full = join(frameworkDir, assistant, relPath);
    if (await pathExists(full)) {
      const content = await readFile(full, 'utf8');
      return { relPath, hash: sha256(content) };
    }
  }
  return null;
}

export async function verifyFrameworkParity({ frameworkDir = 'framework', reference = '.claude' } = {}) {
  const entries = await readdir(frameworkDir, { withFileTypes: true });
  const assistants = entries
    .filter((e) => e.isDirectory() && e.name.startsWith('.') && e.name !== '.clinerules')
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  if (!assistants.includes(reference)) {
    throw new Error(`Reference assistant ${reference} was not found under ${frameworkDir}`);
  }

  const drift = [];
  const referenceSkills = await getSkillManifest(frameworkDir, reference);
  const referenceAc = await getAcHash(frameworkDir, reference);

  for (const assistant of assistants) {
    const skills = await getSkillManifest(frameworkDir, assistant);
    const ac = await getAcHash(frameworkDir, assistant);

    const allSkills = new Set([...Object.keys(referenceSkills), ...Object.keys(skills)]);
    for (const skill of [...allSkills].sort()) {
      if (!(skill in skills)) {
        drift.push({ assistant, type: 'missing_skill', path: `${assistant}/skills/${skill}/SKILL.md` });
        continue;
      }
      if (!(skill in referenceSkills)) {
        drift.push({ assistant, type: 'extra_skill', path: `${assistant}/skills/${skill}/SKILL.md` });
        continue;
      }
      if (skills[skill] !== referenceSkills[skill]) {
        drift.push({ assistant, type: 'skill_content_mismatch', path: `${assistant}/skills/${skill}/SKILL.md` });
      }
    }

    if (referenceAc && ac && referenceAc.hash !== ac.hash) {
      drift.push({
        assistant,
        type: 'ac_content_mismatch',
        path: `${assistant}/${ac.relPath}`,
      });
    }
  }

  return { assistants, reference, drift };
}
