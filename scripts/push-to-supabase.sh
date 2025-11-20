#!/bin/bash

# Check if project reference is provided
if [ -z "$1" ]; then
  echo "Error: Please provide your Supabase project reference"
  echo "Usage: ./push-to-supabase.sh your-project-ref"
  exit 1
fi

PROJECT_REF=$1

# Create migrations directory if it doesn't exist
mkdir -p supabase/migrations

# Update config.toml with the new project reference
echo "project_id = \"$PROJECT_REF\"" > supabase/config.toml

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo "Supabase CLI not found. Please install it manually using one of these methods:"
  echo "- macOS: brew install supabase/tap/supabase"
  echo "- Linux: curl -fsSL https://get.supabase.com/install.sh | sh"
  echo "- Windows (PowerShell): winget install Supabase.CLI"
  echo "- Or visit: https://github.com/supabase/cli#install-the-cli"
  echo ""
  echo "After installing, run this script again."
  exit 1
fi

# Link to the Supabase project
echo "Linking to Supabase project: $PROJECT_REF..."
if ! supabase link --project-ref "$PROJECT_REF"; then
  echo "Error linking to Supabase project. Make sure you're logged in with 'supabase login'"
  exit 1
fi

# Push migrations to the database
echo "Pushing database schema and migrations..."
if ! supabase db push; then
  echo "Error pushing migrations to Supabase"
  exit 1
fi

# Generate TypeScript types
echo "Generating TypeScript types..."
if ! supabase gen types typescript --linked > src/integrations/supabase/types.ts; then
  echo "Error generating TypeScript types"
  exit 1
fi

echo "Migration complete!"
echo "Don't forget to update your environment variables in .env with the new Supabase URL and key." 