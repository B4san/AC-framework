/**
 * memory.js — Comando `acfm memory` y subcomandos
 * 
 * Sistema de memoria persistente con funcionalidades avanzadas:
 * - Búsqueda semántica simple (FTS5)
 * - Grafo de conexiones
 * - Análisis de patrones
 * - Contexto predictivo
 * - Sync inteligente
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { initDatabase, isDatabaseInitialized } from '../memory/database.js';
import {
  saveMemory,
  searchMemories,
  getContext,
  getTimeline,
  getMemory,
  updateMemory,
  deleteMemory,
  startSession,
  endSession,
  getStats,
  findPatterns,
  getConnections,
  anticipateNeeds,
  exportMemories,
  importMemories,
  pruneMemories,
  MEMORY_TYPES
} from '../memory/index.js';
import { truncate, extractKeywords } from '../memory/utils.js';
import { AutoSaveManager } from '../memory/autosave.js';

// Helper de output
function output(data, json) {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
}

// Helper para formatear memoria
function formatMemoryLine(memory, index = null) {
  const prefix = index !== null ? chalk.gray(`${index}.`) : '';
  const idBadge = chalk.gray(`[#${memory.id}]`);
  const typeBadge = chalk.cyan(`[${memory.type}]`);
  const importanceColor = {
    critical: chalk.red,
    high: chalk.yellow,
    medium: chalk.white,
    low: chalk.gray
  }[memory.importance] || chalk.white;
  
  const confidence = chalk.dim(`${Math.round(memory.confidence * 100)}%`);
  const content = truncate(memory.content, 80);
  
  return `${prefix} ${idBadge} ${typeBadge} ${importanceColor(content)} ${confidence}`;
}

export function memoryCommand() {
  const memory = new Command('memory')
    .description('AC Framework Memory — Sistema de memoria autónoma persistente');

  // ─── acfm memory init ──────────────────────────────────────────────────────
  memory
    .command('init')
    .description('Inicializa la base de datos de memoria')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      try {
        if (isDatabaseInitialized()) {
          output({ initialized: false, reason: 'already_initialized' }, opts.json);
          if (!opts.json) console.log(chalk.yellow('Memory database already initialized'));
          return;
        }
        
        initDatabase();
        const dbPath = join(homedir(), '.acfm', 'memory.db');
        
        output({ initialized: true, path: dbPath }, opts.json);
        if (!opts.json) {
          console.log(chalk.green('✓ Memory system initialized'));
          console.log(chalk.dim(`  Database: ${dbPath}`));
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory save ──────────────────────────────────────────────────────
  memory
    .command('save <content>')
    .description('Guarda una observación en memoria')
    .option('-t, --type <type>', 'Tipo de memoria', 'general_insight')
    .option('--topic-key <key>', 'Clave única para deduplicación')
    .option('--project <path>', 'Proyecto asociado')
    .option('--change <name>', 'Change de .acfm asociado')
    .option('--tags <tags>', 'Tags separados por coma')
    .option('--importance <level>', 'critical|high|medium|low')
    .option('--code-snippet <code>', 'Snippet de código relacionado')
    .option('--error <msg>', 'Mensaje de error relacionado')
    .option('--solution <sol>', 'Solución aplicada')
    .option('--confidence <score>', 'Score de confianza 0-1')
    .option('--json', 'Output as JSON')
    .action((content, opts) => {
      try {
        ensureInitialized();
        
        const result = saveMemory({
          content,
          type: opts.type,
          topicKey: opts.topicKey,
          projectPath: opts.project,
          changeName: opts.change,
          tags: opts.tags ? opts.tags.split(',').map(t => t.trim()) : undefined,
          importance: opts.importance,
          codeSnippet: opts.codeSnippet,
          errorMessage: opts.error,
          solution: opts.solution,
          confidence: opts.confidence ? parseFloat(opts.confidence) : undefined
        });
        
        output({ 
          success: true, 
          id: result.id, 
          operation: result.operation,
          revisionCount: result.revisionCount 
        }, opts.json);
        
        if (!opts.json) {
          const opLabel = result.operation === 'updated' ? chalk.yellow('updated') : chalk.green('saved');
          console.log(`✓ Memory ${opLabel} [#${result.id}]`);
          if (result.revisionCount > 0) {
            console.log(chalk.dim(`  Revision #${result.revisionCount}`));
          }
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory search ────────────────────────────────────────────────────
  memory
    .command('search <query>')
    .description('Búsqueda full-text en memorias')
    .option('-l, --limit <n>', 'Límite de resultados', '10')
    .option('--type <type>', 'Filtrar por tipo')
    .option('--project <path>', 'Filtrar por proyecto')
    .option('--change <name>', 'Filtrar por change')
    .option('--importance <level>', 'Filtrar por importancia')
    .option('--since <date>', 'Desde fecha (ISO)')
    .option('--min-confidence <score>', 'Confianza mínima', '0')
    .option('--json', 'Output as JSON')
    .action((query, opts) => {
      try {
        ensureInitialized();
        
        const results = searchMemories(query, {
          limit: parseInt(opts.limit),
          type: opts.type,
          projectPath: opts.project,
          changeName: opts.change,
          importance: opts.importance,
          since: opts.since,
          minConfidence: parseFloat(opts.minConfidence)
        });
        
        output({ query, count: results.length, results }, opts.json);
        
        if (!opts.json) {
          if (results.length === 0) {
            console.log(chalk.dim('No memories found'));
            return;
          }
          
          console.log(chalk.bold(`Found ${results.length} memories`));
          console.log();
          
          results.forEach((mem, i) => {
            console.log(formatMemoryLine(mem, i + 1));
            if (mem.tags.length > 0) {
              console.log(chalk.gray(`   Tags: ${mem.tags.join(', ')}`));
            }
          });
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory recall ────────────────────────────────────────────────────
  memory
    .command('recall [task]')
    .description('Recupera contexto relevante para tarea actual')
    .option('-p, --project <path>', 'Proyecto actual', process.cwd())
    .option('-c, --change <name>', 'Change actual')
    .option('-l, --limit <n>', 'Cantidad de memorias', '5')
    .option('--days <n>', 'Días hacia atrás', '30')
    .option('--json', 'Output as JSON')
    .action((task, opts) => {
      try {
        ensureInitialized();
        
        // Si se proporciona tarea, buscar similitud
        let results;
        if (task) {
          const keywords = extractKeywords(task, 8);
          results = searchMemories(keywords.join(' OR '), {
            projectPath: opts.project,
            limit: parseInt(opts.limit),
            minConfidence: 0.5
          });
        } else {
          // Contexto general del proyecto
          results = getContext({
            projectPath: opts.project,
            changeName: opts.change,
            limit: parseInt(opts.limit),
            lookbackDays: parseInt(opts.days)
          });
        }
        
        output({ 
          task: task || null,
          project: opts.project,
          count: results.length,
          memories: results 
        }, opts.json);
        
        if (!opts.json) {
          if (results.length === 0) {
            console.log(chalk.dim('No relevant memories found'));
            return;
          }
          
          const header = task 
            ? `Relevant memories for: "${truncate(task, 50)}"`
            : 'Context for current project';
          
          console.log(chalk.bold(header));
          console.log();
          
          results.forEach((mem, i) => {
            console.log(formatMemoryLine(mem, i + 1));
            if (mem.changeName) {
              console.log(chalk.gray(`   From change: ${mem.changeName}`));
            }
          });
          
          console.log();
          console.log(chalk.dim('Use `acfm memory get <id>` for full details'));
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory get ───────────────────────────────────────────────────────
  memory
    .command('get <id>')
    .description('Muestra una memoria completa por ID')
    .option('--json', 'Output as JSON')
    .action((id, opts) => {
      try {
        ensureInitialized();
        
        const memory = getMemory(parseInt(id));
        
        if (!memory) {
          output({ error: 'Memory not found' }, opts.json);
          if (!opts.json) console.log(chalk.yellow('Memory not found'));
          process.exit(1);
        }
        
        output({ memory }, opts.json);
        
        if (!opts.json) {
          const importanceColor = {
            critical: chalk.red,
            high: chalk.yellow,
            medium: chalk.white,
            low: chalk.gray
          }[memory.importance] || chalk.white;
          
          console.log(chalk.bold(`Memory #${memory.id}`));
          console.log(chalk.gray('─'.repeat(50)));
          console.log(`${chalk.cyan('Type:')} ${memory.type}`);
          console.log(`${chalk.cyan('Importance:')} ${importanceColor(memory.importance)}`);
          console.log(`${chalk.cyan('Confidence:')} ${Math.round(memory.confidence * 100)}%`);
          console.log(`${chalk.cyan('Created:')} ${memory.createdAt}`);
          console.log();
          console.log(chalk.bold('Content:'));
          console.log(memory.content);
          
          if (memory.codeSnippet) {
            console.log();
            console.log(chalk.bold('Code:'));
            console.log(chalk.gray(memory.codeSnippet));
          }
          
          if (memory.errorMessage) {
            console.log();
            console.log(chalk.bold('Error:'));
            console.log(chalk.red(memory.errorMessage));
          }
          
          if (memory.solution) {
            console.log();
            console.log(chalk.bold('Solution:'));
            console.log(chalk.green(memory.solution));
          }
          
          if (memory.tags.length > 0) {
            console.log();
            console.log(`${chalk.cyan('Tags:')} ${memory.tags.join(', ')}`);
          }
          
          console.log();
          console.log(chalk.gray(`Accessed ${memory.accessCount} times`));
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory timeline ──────────────────────────────────────────────────
  memory
    .command('timeline <id>')
    .description('Muestra timeline cronológico alrededor de una memoria')
    .option('-w, --window <n>', 'Ventana de memorias', '3')
    .option('--json', 'Output as JSON')
    .action((id, opts) => {
      try {
        ensureInitialized();
        
        const timeline = getTimeline(parseInt(id), {
          window: parseInt(opts.window)
        });
        
        if (!timeline) {
          output({ error: 'Memory not found' }, opts.json);
          if (!opts.json) console.log(chalk.yellow('Memory not found'));
          process.exit(1);
        }
        
        output({ timeline }, opts.json);
        
        if (!opts.json) {
          console.log(chalk.bold(`Timeline for Memory #${timeline.base.id}`));
          console.log();
          
          timeline.before.forEach(mem => {
            console.log(chalk.gray('←') + ' ' + formatMemoryLine(mem));
          });
          
          console.log();
          console.log(chalk.cyan('●') + ' ' + chalk.bold(formatMemoryLine(timeline.base)));
          console.log();
          
          timeline.after.forEach(mem => {
            console.log(chalk.gray('→') + ' ' + formatMemoryLine(mem));
          });
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory connections ───────────────────────────────────────────────
  memory
    .command('connections <id>')
    .description('Muestra grafo de conexiones entre memorias')
    .option('-d, --depth <n>', 'Profundidad de búsqueda', '1')
    .option('--json', 'Output as JSON')
    .action((id, opts) => {
      try {
        ensureInitialized();
        
        const connections = getConnections(parseInt(id), parseInt(opts.depth));
        
        output({ baseId: parseInt(id), connections }, opts.json);
        
        if (!opts.json) {
          if (connections.length === 0) {
            console.log(chalk.dim('No connections found'));
            return;
          }
          
          console.log(chalk.bold(`Connections for Memory #${id}`));
          console.log();
          
          connections.forEach(conn => {
            const arrow = conn.depth === 1 ? '→' : '⇢';
            console.log(`${'  '.repeat(conn.depth - 1)}${arrow} [#${conn.to}] (depth ${conn.depth})`);
          });
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory patterns ──────────────────────────────────────────────────
  memory
    .command('patterns')
    .description('Analiza y muestra patrones en las memorias')
    .option('--type <type>', 'Filtrar por tipo')
    .option('--min-frequency <n>', 'Frecuencia mínima', '2')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      try {
        ensureInitialized();
        
        const patterns = findPatterns({
          type: opts.type,
          minFrequency: parseInt(opts.minFrequency)
        });
        
        output({ patterns }, opts.json);
        
        if (!opts.json) {
          if (patterns.length === 0) {
            console.log(chalk.dim('No patterns found'));
            return;
          }
          
          console.log(chalk.bold('Detected Patterns'));
          console.log();
          
          patterns.forEach(p => {
            console.log(`${chalk.cyan(p.topic_key)} ${chalk.gray(`(${p.frequency}×)`)}`);
            console.log(`  Type: ${p.type} | Last: ${p.last_seen.slice(0, 10)}`);
          });
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory anticipate ────────────────────────────────────────────────
  memory
    .command('anticipate <task>')
    .description('Predice memorias relevantes para una tarea futura')
    .option('-p, --project <path>', 'Proyecto', process.cwd())
    .option('-l, --limit <n>', 'Límite', '5')
    .option('--json', 'Output as JSON')
    .action((task, opts) => {
      try {
        ensureInitialized();
        
        const memories = anticipateNeeds(task, opts.project);
        
        output({ task, suggestions: memories.slice(0, parseInt(opts.limit)) }, opts.json);
        
        if (!opts.json) {
          console.log(chalk.bold(`Anticipated memories for: "${truncate(task, 50)}"`));
          console.log();
          
          if (memories.length === 0) {
            console.log(chalk.dim('No relevant memories found'));
            return;
          }
          
          console.log(chalk.yellow('You should know:'));
          memories.slice(0, parseInt(opts.limit)).forEach((mem, i) => {
            console.log(`${i + 1}. ${truncate(mem.content, 70)}`);
          });
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory stats ─────────────────────────────────────────────────────
  memory
    .command('stats')
    .description('Estadísticas del sistema de memoria')
    .option('-p, --project <path>', 'Filtrar por proyecto')
    .option('--since <date>', 'Desde fecha')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      try {
        ensureInitialized();
        
        const stats = getStats({
          projectPath: opts.project,
          since: opts.since
        });
        
        output(stats, opts.json);
        
        if (!opts.json) {
          console.log(chalk.bold('Memory System Statistics'));
          console.log();
          console.log(`${chalk.cyan('Total memories:')} ${stats.total}`);
          
          console.log();
          console.log(chalk.bold('By Type:'));
          stats.byType.forEach(t => {
            console.log(`  ${chalk.gray(t.type.padEnd(25))} ${t.count}`);
          });
          
          console.log();
          console.log(chalk.bold('By Importance:'));
          stats.byImportance.forEach(i => {
            const color = i.importance === 'critical' ? chalk.red :
                         i.importance === 'high' ? chalk.yellow :
                         i.importance === 'medium' ? chalk.white : chalk.gray;
            console.log(`  ${color(i.importance.padEnd(10))} ${i.count}`);
          });
          
          if (stats.mostAccessed.length > 0) {
            console.log();
            console.log(chalk.bold('Most Accessed:'));
            stats.mostAccessed.forEach(m => {
              console.log(`  [#${m.id}] ${truncate(m.preview, 40)} ${chalk.gray(`(${m.accessCount}×)`)}`);
            });
          }
          
          if (stats.commonErrors.length > 0) {
            console.log();
            console.log(chalk.bold('Common Errors:'));
            stats.commonErrors.forEach(e => {
              console.log(`  ${chalk.red(truncate(e.error, 40))} ${chalk.gray(`(${e.count}×)`)}`);
            });
          }
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory export ────────────────────────────────────────────────────
  memory
    .command('export [file]')
    .description('Exporta memorias a JSON')
    .option('--shareable-only', 'Solo memorias compartibles', true)
    .option('--project <path>', 'Filtrar por proyecto')
    .option('--since <date>', 'Desde fecha')
    .option('--json', 'Output as JSON (para stdout)')
    .action((file, opts) => {
      try {
        ensureInitialized();
        
        const memories = exportMemories({
          shareableOnly: opts.shareableOnly,
          projectPath: opts.project,
          since: opts.since
        });
        
        const exportData = {
          exportedAt: new Date().toISOString(),
          count: memories.length,
          memories
        };
        
        if (file && !opts.json) {
          writeFileSync(file, JSON.stringify(exportData, null, 2));
          console.log(chalk.green(`✓ Exported ${memories.length} memories to ${file}`));
        } else {
          output(exportData, true);
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory import ────────────────────────────────────────────────────
  memory
    .command('import <file>')
    .description('Importa memorias desde JSON')
    .option('--merge', 'Merge con existentes (upsert)', true)
    .option('--json', 'Output as JSON')
    .action((file, opts) => {
      try {
        ensureInitialized();
        
        const data = JSON.parse(readFileSync(file, 'utf-8'));
        const memories = data.memories || data;
        
        const results = importMemories(memories, { merge: opts.merge });
        
        const success = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        output({ 
          imported: success.length,
          failed: failed.length,
          results 
        }, opts.json);
        
        if (!opts.json) {
          console.log(chalk.green(`✓ Imported ${success.length} memories`));
          if (failed.length > 0) {
            console.log(chalk.red(`✗ Failed: ${failed.length}`));
          }
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory prune ─────────────────────────────────────────────────────
  memory
    .command('prune')
    .description('Archiva memorias obsoletas')
    .option('--older-than <days>', 'Días de antigüedad', '90')
    .option('--dry-run', 'Mostrar sin archivar')
    .option('--json', 'Output as JSON')
    .action((opts) => {
      try {
        ensureInitialized();
        
        if (opts.dryRun) {
          // Contar sin archivar
          const stats = getStats();
          const cutoff = new Date();
          cutoff.setDate(cutoff.getDate() - parseInt(opts.olderThan));
          
          output({ 
            dryRun: true,
            wouldArchive: 'N/A (use actual prune)',
            cutoff: cutoff.toISOString()
          }, opts.json);
          
          if (!opts.json) {
            console.log(chalk.yellow('Dry run - no memories archived'));
            console.log(chalk.dim(`Cutoff: ${cutoff.toISOString().slice(0, 10)}`));
          }
          return;
        }
        
        const result = pruneMemories({
          olderThanDays: parseInt(opts.olderThan),
          lowConfidence: true,
          unused: true
        });
        
        output({ archived: result.archived }, opts.json);
        
        if (!opts.json) {
          console.log(chalk.green(`✓ Archived ${result.archived} memories`));
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory delete ────────────────────────────────────────────────────
  memory
    .command('delete <id>')
    .description('Elimina (soft-delete) una memoria')
    .option('--json', 'Output as JSON')
    .action((id, opts) => {
      try {
        ensureInitialized();
        
        const success = deleteMemory(parseInt(id));
        
        output({ success }, opts.json);
        
        if (!opts.json) {
          if (success) {
            console.log(chalk.green(`✓ Memory #${id} deleted`));
          } else {
            console.log(chalk.yellow('Memory not found'));
          }
        }
      } catch (err) {
        output({ error: err.message }, opts.json);
        if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });

  // ─── acfm memory session ───────────────────────────────────────────────────
  const sessionCmd = new Command('session')
  .description('Gestión de sesiones de memoria');
  
  sessionCmd
  .command('start')
  .description('Inicia nueva sesión')
  .option('-p, --project <path>', 'Proyecto', process.cwd())
  .option('-c, --change <name>', 'Change')
  .option('--json', 'Output as JSON')
  .action((opts) => {
    try {
      ensureInitialized();
      
      const sessionId = startSession(opts.project, opts.change);
      
      output({ sessionId, project: opts.project, change: opts.change }, opts.json);
      
      if (!opts.json) {
        console.log(chalk.green('✓ Session started'));
        console.log(chalk.dim(`  ID: ${sessionId}`));
      }
    } catch (err) {
      output({ error: err.message }, opts.json);
      if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });
  
  sessionCmd
  .command('end <sessionId>')
  .description('Finaliza sesión')
  .option('-s, --summary <text>', 'Resumen de la sesión')
  .option('--json', 'Output as JSON')
  .action((sessionId, opts) => {
    try {
      ensureInitialized();
      
      endSession(sessionId, opts.summary);
      
      output({ ended: true, sessionId }, opts.json);
      
      if (!opts.json) {
        console.log(chalk.green('✓ Session ended'));
        if (opts.summary) {
          console.log(chalk.dim('Summary saved as memory'));
        }
      }
    } catch (err) {
      output({ error: err.message }, opts.json);
      if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });
  
  memory.addCommand(sessionCmd);
  
  // ─── acfm memory install-mcps ───────────────────────────────────────────────
  memory
  .command('install-mcps')
  .description('Instala servidores MCP para asistentes de IA detectados')
  .option('--all', 'Instalar para todos (sin requerir detección)', false)
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    try {
      const { detectAndInstallMCPs, installAllMCPs, ASSISTANTS, isAssistantInstalled } = await import('../services/mcp-installer.js');
      
      const result = opts.all ? installAllMCPs() : detectAndInstallMCPs();
      
      output({ total: result.total ?? result.installed, success: result.success }, opts.json);
      
      if (!opts.json) {
        if (!opts.all) {
          if (result.installed === 0) {
            console.log(chalk.yellow('No AI assistants detected.'));
            console.log(chalk.dim('Use --all to install for all supported assistants.'));
            return;
          }
          for (const assistant of ASSISTANTS) {
            if (isAssistantInstalled(assistant)) {
              console.log(
                chalk.cyan('◆ ') + chalk.bold(assistant.name) +
                chalk.dim(` → ${assistant.configPath}`)
              );
            }
          }
        }
        console.log(chalk.green(`\n✓ MCP servers installed (${result.success}/${result.total ?? result.installed})`));
      }
    } catch (err) {
      output({ error: err.message }, opts.json);
      if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });
  
  // ─── acfm memory uninstall-mcps ───────────────────────────────────────────
  memory
  .command('uninstall-mcps')
  .description('Desinstala servidores MCP de asistentes de IA')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    try {
      const { uninstallAllMCPs } = await import('../services/mcp-installer.js');
      const result = uninstallAllMCPs();
      
      output({ success: result.success }, opts.json);
      
      if (!opts.json) {
        console.log(chalk.green(`✓ MCP servers uninstalled (${result.success})`));
      }
    } catch (err) {
      output({ error: err.message }, opts.json);
      if (!opts.json) console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });
  
  return memory;
}

// Helper
function ensureInitialized() {
  if (!isDatabaseInitialized()) {
    throw new Error('Memory system not initialized. Run: acfm memory init');
  }
}
