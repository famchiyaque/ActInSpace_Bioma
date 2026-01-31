#!/usr/bin/env python3
"""
Run SQL migration to add satellite_images column to projects table
"""
import os
import sys

# Try using Supabase admin API
try:
    from app.db.session import supabase
    
    # Read the SQL file
    with open('4_add_satellite_images.sql', 'r') as f:
        sql_content = f.read()
    
    print("🔧 Running migration...")
    print(f"SQL:\n{sql_content}\n")
    
    # Split into individual statements
    statements = [s.strip() for s in sql_content.split(';') if s.strip() and not s.strip().startswith('--')]
    
    print(f"Found {len(statements)} SQL statements to execute")
    print("\n⚠️  Please run this SQL manually in your Supabase SQL Editor:")
    print("   https://supabase.com/dashboard/project/<your-project>/sql/new")
    print("\nOr run each statement individually:\n")
    
    for i, stmt in enumerate(statements, 1):
        # Clean up statement
        stmt = stmt.replace('\n', ' ').strip()
        if stmt:
            print(f"{i}. {stmt};")
    
    print("\n" + "="*70)
    print("After running the SQL, press Enter to test the population script...")
    input()
    
    # Test if column exists by trying to query it
    result = supabase.table('projects').select('id, satellite_images').limit(1).execute()
    print("✅ Column exists! Ready to populate satellite images.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
