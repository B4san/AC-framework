import os
import json
import argparse

def scan_project(root_dir):
    project_structure = {
        "root": root_dir,
        "directories": {},
        "files": []
    }
    
    # Common directories to ignore
    ignore_dirs = {'.git', 'node_modules', '__pycache__', 'dist', 'build', '.next', '.expo'}
    
    for root, dirs, files in os.walk(root_dir):
        # Filter ignored directories
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        rel_path = os.path.relpath(root, root_dir)
        if rel_path == '.':
            rel_path = ''
            
        for d in dirs:
            dir_path = os.path.join(rel_path, d)
            project_structure["directories"][dir_path] = []
            
        for f in files:
            file_path = os.path.join(rel_path, f)
            project_structure["files"].append(file_path)
            if rel_path in project_structure["directories"]:
                project_structure["directories"][rel_path].append(f)
            elif rel_path == '':
                # Root files
                pass

    return project_structure

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scan codebase for project-index skill")
    parser.add_argument("path", help="Path to the codebase root")
    parser.add_argument("--output", help="Path to save the JSON result", default="codebase_index.json")
    args = parser.parse_args()
    
    structure = scan_project(args.path)
    with open(args.output, 'w') as f:
        json.dump(structure, f, indent=2)
    print(f"Codebase scanned. Index saved to {args.output}")
