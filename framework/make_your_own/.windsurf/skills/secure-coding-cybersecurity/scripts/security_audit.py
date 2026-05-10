import re
import os
import sys

# Common patterns for hardcoded secrets and vulnerable code
PATTERNS = {
    "Hardcoded Secret": r"(?i)(api_key|secret|password|token|access_key)\s*=\s*['\"][a-zA-Z0-9_\-]{10,}['\"]",
    "Potential SQL Injection (Python)": r"\.execute\(f?['\"].*\{.*\}",
    "Insecure Randomness": r"import random\s+.*random\.random\(",
    "Weak Hashing (MD5/SHA1)": r"(md5|sha1)\(",
    "Debug Mode Enabled": r"debug\s*=\s*True",
}

def scan_file(file_path):
    findings = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for i, line in enumerate(f, 1):
                for name, pattern in PATTERNS.items():
                    if re.search(pattern, line):
                        findings.append(f"[{name}] Found at line {i}: {line.strip()}")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return findings

def main(directory):
    all_findings = {}
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.py', '.js', '.java', '.go')):
                path = os.path.join(root, file)
                findings = scan_file(path)
                if findings:
                    all_findings[path] = findings
    
    if not all_findings:
        print("No obvious security issues found by this simple scanner.")
    else:
        for path, findings in all_findings.items():
            print(f"\n--- Findings in {path} ---")
            for f in findings:
                print(f)

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    main(target_dir)
