/**
 * utils.js — Utilidades para el sistema de memoria
 */

/**
 * Redacta contenido entre etiquetas <private>
 */
export function redactPrivateContent(content) {
  if (!content) return content;
  
  const privateRegex = /<private>[\s\S]*?<\/private>/gi;
  return content.replace(privateRegex, '[REDACTED PRIVATE CONTENT]');
}

/**
 * Extrae palabras clave de un texto
 */
export function extractKeywords(text, maxKeywords = 5) {
  if (!text) return [];
  
  const stopWords = new Set([
    'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al',
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'en', 'y', 'o', 'pero', 'por', 'para', 'con', 'sin', 'sobre', 'entre',
    'in', 'and', 'or', 'but', 'for', 'with', 'without', 'on', 'between',
    'que', 'como', 'cuando', 'donde', 'quien', 'cual', 'esto', 'eso',
    'that', 'what', 'when', 'where', 'who', 'which', 'this', 'that'
  ]);
  
  const wordCounts = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
    .reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
  
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Calcula similitud simple entre dos textos (Jaccard)
 */
export function textSimilarity(text1, text2) {
  const set1 = new Set(text1.toLowerCase().split(/\s+/));
  const set2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Trunca texto con ellipsis
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Detecta si un contenido parece código
 */
export function isCodeContent(text) {
  const codeIndicators = [
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /var\s+\w+\s*=/,
    /import\s+.*\s+from/,
    /export\s+(default\s+)?/,
    /class\s+\w+/,
    /if\s*\(.*\)\s*\{/,
    /for\s*\(.*\)\s*\{/,
    /```[\s\S]*```/
  ];
  
  return codeIndicators.some(pattern => pattern.test(text));
}

/**
 * Detecta lenguaje de programación
 */
export function detectLanguage(text) {
  if (/\.tsx?/.test(text) || /interface\s+\w+/.test(text) || /:\s*(string|number|boolean)/.test(text)) {
    return 'typescript';
  }
  if (/\.jsx?/.test(text) || /React\./.test(text) || /useState|useEffect/.test(text)) {
    return 'javascript';
  }
  if (/\.py/.test(text) || /def\s+\w+\s*\(/.test(text) || /import\s+\w+/.test(text)) {
    return 'python';
  }
  if (/\.go/.test(text) || /func\s+\w+\s*\(/.test(text) || /package\s+\w+/.test(text)) {
    return 'go';
  }
  if (/\.rs/.test(text) || /fn\s+\w+\s*\(/.test(text) || /let\s+mut/.test(text)) {
    return 'rust';
  }
  return 'unknown';
}

/**
 * Genera un resumen automático
 */
export function generateSummary(text, maxSentences = 2) {
  if (!text) return '';
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, maxSentences).join('. ') + '.';
}

/**
 * Sanitiza input para FTS5
 */
export function sanitizeFTSQuery(query) {
  // Escapar caracteres especiales de FTS5
  return query
    .replace(/"/g, '""')
    .replace(/\*/g, '')
    .replace(/^\^/g, '')
    .replace(/\$/g, '');
}
