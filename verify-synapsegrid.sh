#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ACFM_CMD=(node "$ROOT_DIR/bin/acfm.js")

TASK="synapsegrid validation task"
ROUNDS="1"
AUTO_SETUP="0"
KEEP_SESSION="0"
VERBOSE="0"
MODEL_PLANNER=""
MODEL_CRITIC=""
MODEL_CODER=""
MODEL_REVIEWER=""

usage() {
  cat <<'USAGE'
Usage: ./verify-synapsegrid.sh [options]

Options:
  --task <text>         Task used to start collaborative session
  --rounds <n>          Max rounds for the session (default: 1)
  --auto-setup          Run `acfm agents setup --json` if deps are missing
  --keep-session        Do not stop session at end
  --model-planner <id>  Model for planner role (provider/model)
  --model-critic <id>   Model for critic role (provider/model)
  --model-coder <id>    Model for coder role (provider/model)
  --model-reviewer <id> Model for reviewer role (provider/model)
  --verbose             Print command outputs
  -h, --help            Show this help

Examples:
  ./verify-synapsegrid.sh
  ./verify-synapsegrid.sh --task "mobile app for tasks" --rounds 2
  ./verify-synapsegrid.sh --model-planner opencode/gpt-5.1-codex --model-coder opencode/gpt-5.1-codex
  ./verify-synapsegrid.sh --auto-setup --verbose
USAGE
}

log() { printf '[verify] %s\n' "$*"; }
fail() { printf '[verify][error] %s\n' "$*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task)
      TASK="${2:-}"
      shift 2
      ;;
    --rounds)
      ROUNDS="${2:-}"
      shift 2
      ;;
    --auto-setup)
      AUTO_SETUP="1"
      shift
      ;;
    --keep-session)
      KEEP_SESSION="1"
      shift
      ;;
    --model-planner)
      MODEL_PLANNER="${2:-}"
      shift 2
      ;;
    --model-critic)
      MODEL_CRITIC="${2:-}"
      shift 2
      ;;
    --model-coder)
      MODEL_CODER="${2:-}"
      shift 2
      ;;
    --model-reviewer)
      MODEL_REVIEWER="${2:-}"
      shift 2
      ;;
    --verbose)
      VERBOSE="1"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown option: $1"
      ;;
  esac
done

if ! [[ "$ROUNDS" =~ ^[0-9]+$ ]] || [[ "$ROUNDS" -le 0 ]]; then
  fail "--rounds must be a positive integer"
fi

if ! command -v node >/dev/null 2>&1; then
  fail "node is required"
fi

if [[ ! -f "$ROOT_DIR/bin/acfm.js" ]]; then
  fail "Cannot find $ROOT_DIR/bin/acfm.js"
fi

SESSION_ID=""
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

run_json() {
  local out_file="$1"
  shift
  if [[ "$VERBOSE" == "1" ]]; then
    "${ACFM_CMD[@]}" "$@" | tee "$out_file"
  else
    "${ACFM_CMD[@]}" "$@" >"$out_file"
  fi
}

extract_json_value() {
  local json_file="$1"
  local expression="$2"
  node -e "const fs=require('fs');const v=(JSON.parse(fs.readFileSync(process.argv[1],'utf8'))${expression});if(v===undefined||v===null){process.exit(2)};if(typeof v==='object'){console.log(JSON.stringify(v));}else{console.log(String(v));}" "$json_file"
}

has_cmd() {
  command -v "$1" >/dev/null 2>&1
}

has_opencode_bin() {
  if has_cmd opencode; then
    return 0
  fi
  [[ -x "$HOME/.opencode/bin/opencode" ]]
}

stop_session() {
  if [[ -z "$SESSION_ID" ]]; then
    return 0
  fi
  if [[ "$KEEP_SESSION" == "1" ]]; then
    log "Keeping session $SESSION_ID (requested by --keep-session)"
    return 0
  fi
  if [[ "$VERBOSE" == "1" ]]; then
    "${ACFM_CMD[@]}" agents stop || true
  else
    "${ACFM_CMD[@]}" agents stop >/dev/null 2>&1 || true
  fi
}

trap 'stop_session' INT TERM

log "Checking dependencies (opencode + tmux)"
if ! has_opencode_bin || ! has_cmd tmux; then
  if [[ "$AUTO_SETUP" == "1" ]]; then
    log "Missing dependencies, running agents setup"
    run_json "$TMP_DIR/setup.json" agents setup --json || true
  fi
fi

if ! has_opencode_bin; then
  fail "OpenCode not found. Install and retry, or run with --auto-setup"
fi
if ! has_cmd tmux; then
  fail "tmux not found. Install and retry, or run with --auto-setup"
fi

log "Starting session"
START_ARGS=(agents start --task "$TASK" --rounds "$ROUNDS" --json)
if [[ -n "$MODEL_PLANNER" ]]; then START_ARGS+=(--model-planner "$MODEL_PLANNER"); fi
if [[ -n "$MODEL_CRITIC" ]]; then START_ARGS+=(--model-critic "$MODEL_CRITIC"); fi
if [[ -n "$MODEL_CODER" ]]; then START_ARGS+=(--model-coder "$MODEL_CODER"); fi
if [[ -n "$MODEL_REVIEWER" ]]; then START_ARGS+=(--model-reviewer "$MODEL_REVIEWER"); fi
run_json "$TMP_DIR/start.json" "${START_ARGS[@]}"
SESSION_ID="$(extract_json_value "$TMP_DIR/start.json" '.sessionId')"
TMUX_SESSION="$(extract_json_value "$TMP_DIR/start.json" '.tmuxSessionName')"
START_STATUS="$(extract_json_value "$TMP_DIR/start.json" '.status')"

[[ -n "$SESSION_ID" ]] || fail "Missing sessionId after start"
[[ -n "$TMUX_SESSION" ]] || fail "Missing tmuxSessionName after start"
[[ "$START_STATUS" == "running" ]] || fail "Unexpected start status: $START_STATUS"

log "Verifying tmux session exists: $TMUX_SESSION"
tmux has-session -t "$TMUX_SESSION"

log "Checking status"
run_json "$TMP_DIR/status.json" agents status --json
STATUS_SESSION_ID="$(extract_json_value "$TMP_DIR/status.json" '.sessionId')"
[[ "$STATUS_SESSION_ID" == "$SESSION_ID" ]] || fail "Status sessionId mismatch"

if [[ -n "$MODEL_PLANNER" ]]; then
  STATUS_MODEL="$(extract_json_value "$TMP_DIR/status.json" '.effectiveRoleModels.planner')"
  [[ "$STATUS_MODEL" == "$MODEL_PLANNER" ]] || fail "planner model mismatch: expected $MODEL_PLANNER got $STATUS_MODEL"
fi
if [[ -n "$MODEL_CRITIC" ]]; then
  STATUS_MODEL="$(extract_json_value "$TMP_DIR/status.json" '.effectiveRoleModels.critic')"
  [[ "$STATUS_MODEL" == "$MODEL_CRITIC" ]] || fail "critic model mismatch: expected $MODEL_CRITIC got $STATUS_MODEL"
fi
if [[ -n "$MODEL_CODER" ]]; then
  STATUS_MODEL="$(extract_json_value "$TMP_DIR/status.json" '.effectiveRoleModels.coder')"
  [[ "$STATUS_MODEL" == "$MODEL_CODER" ]] || fail "coder model mismatch: expected $MODEL_CODER got $STATUS_MODEL"
fi
if [[ -n "$MODEL_REVIEWER" ]]; then
  STATUS_MODEL="$(extract_json_value "$TMP_DIR/status.json" '.effectiveRoleModels.reviewer')"
  [[ "$STATUS_MODEL" == "$MODEL_REVIEWER" ]] || fail "reviewer model mismatch: expected $MODEL_REVIEWER got $STATUS_MODEL"
fi

log "Collecting logs"
run_json "$TMP_DIR/logs1.json" agents logs --role all --lines 120 --json
LOG_COUNT="$(extract_json_value "$TMP_DIR/logs1.json" '.logs.length')"
[[ "$LOG_COUNT" == "4" ]] || fail "Expected 4 role logs, got $LOG_COUNT"

if node -e "const fs=require('fs');const t=fs.readFileSync(process.argv[1],'utf8');process.exit(t.includes('spawn opencode ENOENT')?0:1)" "$TMP_DIR/logs1.json"; then
  fail "Detected 'spawn opencode ENOENT' in logs"
fi

log "Sending follow-up message"
run_json "$TMP_DIR/send.json" agents send "validation follow-up" --json
SENT_OK="$(extract_json_value "$TMP_DIR/send.json" '.accepted')"
[[ "$SENT_OK" == "true" ]] || fail "Send message was not accepted"

log "Exporting transcript"
EXPORT_FILE="$TMP_DIR/transcript.md"
if [[ "$VERBOSE" == "1" ]]; then
  "${ACFM_CMD[@]}" agents export --format md --out "$EXPORT_FILE"
else
  "${ACFM_CMD[@]}" agents export --format md --out "$EXPORT_FILE" >/dev/null
fi
[[ -s "$EXPORT_FILE" ]] || fail "Export file is empty"
if ! node -e "const fs=require('fs');const t=fs.readFileSync(process.argv[1],'utf8');process.exit(t.includes('SynapseGrid Session')?0:1)" "$EXPORT_FILE"; then
  fail "Transcript export is missing expected header"
fi

log "Resuming session"
run_json "$TMP_DIR/resume.json" agents resume --no-attach --json
RESUME_SESSION_ID="$(extract_json_value "$TMP_DIR/resume.json" '.sessionId')"
[[ "$RESUME_SESSION_ID" == "$SESSION_ID" ]] || fail "Resume sessionId mismatch"

log "Re-checking logs for ENOENT"
run_json "$TMP_DIR/logs2.json" agents logs --role all --lines 120 --json
if node -e "const fs=require('fs');const t=fs.readFileSync(process.argv[1],'utf8');process.exit(t.includes('spawn opencode ENOENT')?0:1)" "$TMP_DIR/logs2.json"; then
  fail "Detected 'spawn opencode ENOENT' after resume"
fi

stop_session
SESSION_ID=""

log "PASS: SynapseGrid validation completed successfully"
