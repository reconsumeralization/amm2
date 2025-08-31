# Simple Conflict Resolver - Handles common patterns automatically
# Focuses on the most frequent conflict types we've encountered

param(
    [switch]$DryRun,
    [switch]$Backup,
    [int]$MaxFiles = 50  # Limit to prevent overwhelming output
)

Write-Host "=== Simple Conflict Resolver ===" -ForegroundColor Cyan
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN' } else { 'LIVE' })" -ForegroundColor Yellow
Write-Host "Backup: $(if ($Backup) { 'ENABLED' } else { 'DISABLED' })" -ForegroundColor Yellow
Write-Host ""

# Statistics
$stats = @{
    Processed = 0
    Resolved = 0
    Skipped = 0
    Errors = 0
}

# Find files with conflicts
$conflictFiles = Get-ChildItem -Path "." -Recurse -Include "*.ts","*.tsx","*.js","*.jsx","*.json","*.md","*.css" |
    Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" -and $_.FullName -notlike "*.git*" } |
    ForEach-Object {
        $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and $content -match "^<<<<<<< HEAD") {
            $_
        }
    } | Select-Object -First $MaxFiles

Write-Host "Found $($conflictFiles.Count) files with conflicts" -ForegroundColor Green

foreach ($file in $conflictFiles) {
    $stats.Processed++
    $filePath = $file.FullName
    $fileName = [System.IO.Path]::GetFileName($filePath)

    Write-Host "[$($stats.Processed)] Processing: $fileName" -ForegroundColor White
    Write-Host "    Path: $filePath" -ForegroundColor Gray

    try {
        $content = Get-Content $filePath -Raw
        $originalContent = $content

        # Pattern 1: Simple text replacement (barber shop -> Hair BarberShop)
        $textReplacements = @(
            @{ Pattern = 'barber shop'; Replacement = 'Hair BarberShop' }
            @{ Pattern = 'barber-shop'; Replacement = 'hair-barber-shop' }
            @{ Pattern = 'BarberShop'; Replacement = 'Hair BarberShop' }
        )

        foreach ($replacement in $textReplacements) {
            if ($content -match [regex]::Escape($replacement.Pattern)) {
                # Replace within conflict markers
                $pattern = "(?ms)(<<<<<<< HEAD.*?)($([regex]::Escape($replacement.Pattern)))(.*?=======.*?)(.*?)($([regex]::Escape($replacement.Pattern)))(.*>>>>>>> clean-merge)"
                $content = $content -replace $pattern, "`${1}$($replacement.Replacement)`${3}$($replacement.Replacement)`${6}"
                Write-Host "    ✓ Applied text replacement: '$($replacement.Pattern)' -> '$($replacement.Replacement)'" -ForegroundColor Green
            }
        }

        # Pattern 2: Remove duplicate content blocks
        $duplicatePattern = "(?ms)^<<<<<<< HEAD.*?\n(.*?)\n=======\n\1\n>>>>>>> clean-merge.*?\n"
        if ($content -match $duplicatePattern) {
            $content = $content -replace $duplicatePattern, "`${1}"
            Write-Host "    ✓ Removed duplicate content block" -ForegroundColor Green
        }

        # Pattern 3: Import consolidation (yoloMonitoring -> monitoring)
        $importReplacements = @(
            @{ Old = "import \{ yoloMonitoring \} from '@/lib/monitoring'"; New = "import { monitoring } from '@/lib/monitoring'" }
            @{ Old = "yoloMonitoring\."; New = "monitoring." }
        )

        foreach ($replacement in $importReplacements) {
            if ($content -match [regex]::Escape($replacement.Old)) {
                $content = $content -replace [regex]::Escape($replacement.Old), $replacement.New
                Write-Host "    ✓ Updated import: $($replacement.Old) -> $($replacement.New)" -ForegroundColor Green
            }
        }

        # Pattern 4: Remove remaining conflict markers (keep clean-merge)
        if ($content -match "^<<<<<<< HEAD") {
            $content = $content -replace "(?ms)<<<<<<< HEAD.*?\n", ""
            $content = $content -replace "(?ms)=======\n.*?\n>>>>>>> clean-merge.*?\n", ""
            Write-Host "    ✓ Removed conflict markers (kept clean-merge version)" -ForegroundColor Yellow
        }

        # Check if file was modified
        if ($content -ne $originalContent) {
            if (-not $DryRun) {
                # Backup if requested
                if ($Backup) {
                    $backupPath = "$filePath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
                    Copy-Item -Path $filePath -Destination $backupPath -Force
                    Write-Host "    → Backup created: $([System.IO.Path]::GetFileName($backupPath))" -ForegroundColor Gray
                }

                # Write changes
                Set-Content $filePath $content
                Write-Host "    ✅ File updated successfully" -ForegroundColor Green
            } else {
                Write-Host "    📝 DRY RUN: Would update file" -ForegroundColor Cyan
            }

            $stats.Resolved++
        } else {
            Write-Host "    ⚠️  No changes made to file" -ForegroundColor Yellow
            $stats.Skipped++
        }

    } catch {
        Write-Host "    ❌ Error processing file: $($_.Exception.Message)" -ForegroundColor Red
        $stats.Errors++
    }

    Write-Host ""
}

# Summary
Write-Host "=== Resolution Summary ===" -ForegroundColor Cyan
Write-Host "Processed: $($stats.Processed) files" -ForegroundColor White
Write-Host "Resolved: $($stats.Resolved) files" -ForegroundColor Green
Write-Host "Skipped: $($stats.Skipped) files" -ForegroundColor Yellow
Write-Host "Errors: $($stats.Errors) files" -ForegroundColor Red

if ($DryRun) {
    Write-Host ""
    Write-Host "DRY RUN COMPLETE - No files were actually modified" -ForegroundColor Cyan
    Write-Host "Run without -DryRun to apply changes" -ForegroundColor White
}

if ($stats.Resolved -gt 0) {
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review the changes in your IDE" -ForegroundColor White
    Write-Host "2. Test your application to ensure it still works" -ForegroundColor White
    Write-Host "3. Run 'git add .' to stage resolved conflicts" -ForegroundColor White
    Write-Host "4. Run 'git commit' to complete the merge" -ForegroundColor White
}
