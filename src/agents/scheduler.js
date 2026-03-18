export function nextRole(state) {
  const roles = state.roles || [];
  if (roles.length === 0) {
    throw new Error('No roles configured for collaborative session');
  }

  const index = state.nextRoleIndex ?? 0;
  const role = roles[index % roles.length];
  const nextRoleIndex = (index + 1) % roles.length;
  const round = nextRoleIndex === 0 ? state.round + 1 : state.round;

  return {
    role,
    nextRoleIndex,
    round,
  };
}

export function shouldStop(state) {
  if (state.status && state.status !== 'running') return true;
  return state.round > state.maxRounds;
}
