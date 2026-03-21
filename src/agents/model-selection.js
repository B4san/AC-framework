import { COLLAB_ROLES } from './constants.js';

export function normalizeModelId(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isValidModelId(value) {
  const normalized = normalizeModelId(value);
  if (!normalized) return false;
  return normalized.includes('/');
}

export function sanitizeRoleModels(input) {
  const out = {};
  if (!input || typeof input !== 'object') return out;
  for (const role of COLLAB_ROLES) {
    const normalized = normalizeModelId(input[role]);
    if (normalized) out[role] = normalized;
  }
  return out;
}

export function resolveRoleModel(state, role, fallbackModel = null) {
  const roleModels = sanitizeRoleModels(state?.roleModels);
  const roleModel = roleModels[role] || null;
  const globalModel = normalizeModelId(state?.model) || normalizeModelId(fallbackModel);
  return roleModel || globalModel || null;
}

export function buildEffectiveRoleModels(state, fallbackModel = null) {
  const effective = {};
  for (const role of COLLAB_ROLES) {
    effective[role] = resolveRoleModel(state, role, fallbackModel);
  }
  return effective;
}
