export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatFolderName(name) {
  const clean = name.startsWith('.') ? name.slice(1) : name;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function formatTemplateName(name) {
  return name
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
