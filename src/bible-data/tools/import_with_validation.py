#!/usr/bin/env python3
"""
Bible data import with validation

Runs converter.py, then validator.py, and stops import if validation fails.

Usage:
    python bible-data/tools/import_with_validation.py
"""

import subprocess
import sys

def run_step(name, command):
    """Run a command and handle errors."""
    print(f"\n{'='*60}")
    print(f"Running: {name}")
    print(f"{'='*60}")
    
    result = subprocess.run(command)
    
    if result.returncode != 0:
        print(f"\n❌ {name} failed with exit code {result.returncode}")
        return False
    
    print(f"\n✅ {name} succeeded")
    return True

def main():
    # Step 1: Convert Bible data
    if not run_step(
        "Converter",
        [sys.executable, "bible-data/tools/converter.py"]
    ):
        sys.exit(1)
    
    # Step 2: Validate converted data
    if not run_step(
        "Validator (strict mode)",
        [sys.executable, "bible-data/tools/validator.py", "bible-data/output/om", "--strict"]
    ):
        print("\n❌ Validation failed. Import stopped.")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("✅ All checks passed! Ready for database import.")
    print("="*60)
    sys.exit(0)

if __name__ == "__main__":
    main()