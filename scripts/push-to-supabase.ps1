#!/usr/bin/env pwsh

# Check if project reference is provided
if (-not $args[0]) {
    Write-Error "Error: Please provide your Supabase project reference"
    Write-Host "Usage: ./push-to-supabase.ps1 your-project-ref"
    exit 1
}

$PROJECT_REF = $args[0]

# Create migrations directory if it doesn't exist
if (-not (Test-Path -Path "supabase/migrations")) {
    New-Item -ItemType Directory -Path "supabase/migrations" -Force
}

# Update config.toml with the new project reference
"project_id = `"$PROJECT_REF`"" | Out-File -FilePath "supabase/config.toml" -Encoding utf8 -Force

# Check if Supabase CLI is installed
$supabaseInstalled = $null
try {
    $supabaseInstalled = Get-Command "supabase" -ErrorAction SilentlyContinue
} catch {
    # Command not found
}

if (-not $supabaseInstalled) {
    Write-Host "Supabase CLI not found. Please install it manually using one of these methods:"
    Write-Host "- Windows (PowerShell): winget install Supabase.CLI"
    Write-Host "- Or visit: https://github.com/supabase/cli#install-the-cli"
    Write-Host ""
    Write-Host "After installing, run this script again."
    exit 1
}

# Link to the Supabase project
Write-Host "Linking to Supabase project: $PROJECT_REF..."
try {
    supabase link --project-ref $PROJECT_REF
} catch {
    Write-Error "Error linking to Supabase project. Make sure you're logged in with 'supabase login'"
    exit 1
}

# Push migrations to the database
Write-Host "Pushing database schema and migrations..."
try {
    supabase db push
} catch {
    Write-Error "Error pushing migrations to Supabase"
    exit 1
}

# Generate TypeScript types
Write-Host "Generating TypeScript types..."
try {
    $typesContent = $(supabase gen types typescript --linked)
    $typesContent | Out-File -FilePath "src/integrations/supabase/types.ts" -Encoding utf8 -Force
} catch {
    Write-Error "Error generating TypeScript types"
    exit 1
}

Write-Host "Migration complete!"
Write-Host "Don't forget to update your environment variables in .env with the new Supabase URL and key." 