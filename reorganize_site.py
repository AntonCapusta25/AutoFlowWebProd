#!/usr/bin/env python3
"""
Website Reorganization Script - Final Version
Moves blog posts and projects into subfolders with clean names.
Updates links in blog.html and portfolio.html connector pages.
Main pages (index, blog, portfolio, contact) stay in root.
"""

import os
import shutil
import re
from pathlib import Path

# File mapping: old_filename -> (folder, new_clean_filename)
FILE_MAPPING = {
    # Blog posts
    "10 repetitive tasks.html": ("blog", "10-repetitive-tasks.html"),
    "5 Ways to Customer.html": ("blog", "5-ways-to-customer.html"),
    "5 signs.html": ("blog", "5-signs.html"),
    "Automation Intro.html": ("blog", "automation-intro.html"),
    "Automation intro.html": ("blog", "automation-intro.html"),
    "BPA Guide.html": ("blog", "bpa-guide.html"),
    "BPA vs Workflow.html": ("blog", "bpa-vs-workflow.html"),
    "E-commerce SMEs.html": ("blog", "e-commerce-smes.html"),
    "Guide for SME.html": ("blog", "guide-for-sme.html"),
    "Hidden cost.html": ("blog", "hidden-cost.html"),
    "Invoicing guide.html": ("blog", "invoicing-guide.html"),
    "Outgrown Zapier.html": ("blog", "outgrown-zapier.html"),
    "bottlenecks guide.html": ("blog", "bottlenecks-guide.html"),
    "documents drowning.html": ("blog", "documents-drowning.html"),
    "how to choose.html": ("blog", "how-to-choose.html"),
    "no-code outgrown.html": ("blog", "no-code-outgrown.html"),
    "working for you.html": ("blog", "working-for-you.html"),
    "zapier expert.html": ("blog", "zapier-expert.html"),
    "zapier vs custom.html": ("blog", "zapier-vs-custom.html"),
    
    # Projects
    "project1.html": ("projects", "project-1.html"),
    "project1": ("projects", "project-1.html"),
    "project2.html": ("projects", "project-2.html"),
    "Project3.html": ("projects", "project-3.html"),
    "Project4.html": ("projects", "project-4.html"),
    "zapier vs custom": ("blog", "zapier-vs-custom.html"),
}

ROOT_DIR = Path.cwd()
NL_DIR = ROOT_DIR / "nl"

# Files that need link updates (connector pages)
CONNECTOR_PAGES = ["blog.html", "portfolio.html"]

def ensure_directories():
    """Create necessary subdirectories."""
    directories = [
        ROOT_DIR / "blog",
        ROOT_DIR / "projects",
        NL_DIR / "blog",
        NL_DIR / "projects",
    ]
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
    print("✓ Created necessary directories")

def update_connector_page(file_path, is_dutch=False):
    """Update links in blog.html or portfolio.html connector pages."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        prefix = "/nl" if is_dutch else ""
        
        # Update each old filename to new path
        for old_name, (folder, new_name) in FILE_MAPPING.items():
            # Create variations of the old filename
            variations = [
                old_name,
                old_name.replace(" ", "%20"),
            ]
            
            new_path = f"{prefix}/{folder}/{new_name}"
            
            for variant in variations:
                # Replace in href attributes
                content = content.replace(f'href="{variant}"', f'href="{new_path}"')
                content = content.replace(f"href='{variant}'", f"href='{new_path}'")
        
        # Write back if changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    
    except Exception as e:
        print(f"  ⚠ Error updating {file_path}: {e}")
        return False

def move_file(old_path, new_path):
    """Move a file from old_path to new_path."""
    try:
        if old_path.exists():
            new_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(old_path), str(new_path))
            return True
        return False
    except Exception as e:
        print(f"  ⚠ Error moving {old_path} to {new_path}: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("  WEBSITE REORGANIZATION SCRIPT")
    print("="*60 + "\n")
    
    # Step 1: Create directories
    print("Step 1: Creating directory structure...")
    ensure_directories()
    
    # Step 2: Update connector pages BEFORE moving files
    print("\nStep 2: Updating links in connector pages...")
    updated_count = 0
    
    for page in CONNECTOR_PAGES:
        # English version
        en_path = ROOT_DIR / page
        if en_path.exists() and update_connector_page(en_path, is_dutch=False):
            print(f"  ✓ Updated links in: {page}")
            updated_count += 1
        
        # Dutch version
        nl_path = NL_DIR / page
        if nl_path.exists() and update_connector_page(nl_path, is_dutch=True):
            print(f"  ✓ Updated links in: nl/{page}")
            updated_count += 1
    
    print(f"\n✓ Updated {updated_count} connector pages")
    
    # Step 3: Move and rename files
    print("\nStep 3: Moving and renaming files...")
    moved_count = 0
    
    for old_name, (folder, new_name) in FILE_MAPPING.items():
        # English version
        src_en = ROOT_DIR / old_name
        dst_en = ROOT_DIR / folder / new_name
        
        if move_file(src_en, dst_en):
            print(f"  ✓ Moved (EN): {old_name} → {folder}/{new_name}")
            moved_count += 1
        
        # Dutch version
        src_nl = NL_DIR / old_name
        dst_nl = NL_DIR / folder / new_name
        
        if move_file(src_nl, dst_nl):
            print(f"  ✓ Moved (NL): {old_name} → nl/{folder}/{new_name}")
            moved_count += 1
    
    print(f"\n✓ Moved {moved_count} files")
    
    # Summary
    print("\n" + "="*60)
    print("  REORGANIZATION COMPLETE!")
    print("="*60)
    print("\n✅ Next steps:")
    print("  1. Test blog.html and portfolio.html locally")
    print("  2. Verify all links work correctly")
    print("  3. Replace sitemap.xml and robots.txt:")
    print("     mv sitemap_new.xml sitemap.xml")
    print("     mv robots_new.txt robots.txt")
    print("  4. Update vercel.json with redirects")
    print("  5. Deploy to production")
    print("\n")

if __name__ == "__main__":
    if not (ROOT_DIR / "index.html").exists():
        print("ERROR: This script must be run from the website root directory!")
        print(f"Current directory: {ROOT_DIR}")
        exit(1)
    
    response = input("⚠️  This will reorganize your website. Continue? (yes/no): ")
    if response.lower() in ['yes', 'y']:
        main()
    else:
        print("Cancelled.")
