# Advanced Conflict Resolution Automation Script
# Comprehensive solution for resolving merge conflicts intelligently

param(
    [string]$Mode = "auto",  # auto, manual, dry-run
    [string]$Pattern = "all", # all, simple, complex, ui, api
    [switch]$BackupFiles,
    [switch]$Verbose
)

# Configuration
$CONFIG = @{
    # Simple text replacements
    TextReplacements = @(
        @{
            Pattern = 'barber shop'
            Replacement = 'Hair BarberShop'
            CaseSensitive = $false
        },
        @{
            Pattern = 'barber-shop'
            Replacement = 'hair-barber-shop'
            CaseSensitive = $false
        },
        @{
            Pattern = 'BarberShop'
            Replacement = 'Hair BarberShop'
            CaseSensitive = $true
        }
    )

    # File type specific patterns
    FileTypePatterns = @{
        "*.ts" = @{
            ImportPatterns = @(
                @{
                    OldPattern = "import \{ yoloMonitoring \} from '@/lib/monitoring'"
                    NewPattern = "import { monitoring } from '@/lib/monitoring'"
                }
            )
            FunctionPatterns = @(
                @{
                    OldPattern = "yoloMonitoring\."
                    NewPattern = "monitoring."
                }
            )
        }
        "*.tsx" = @{
            ComponentPatterns = @(
                @{
                    OldPattern = "className=\{`.*barber.*`\}"
                    NewPattern = "className={`hair-barbershop`}"
                }
            )
        }
    }

    # Conflict resolution strategies
    Strategies = @{
        "SimpleText" = @{
            Description = "Simple text replacements"
            Priority = 1
        }
        "DuplicateContent" = @{
            Description = "Remove duplicate content blocks"
            Priority = 2
        }
        "ImportConsolidation" = @{
            Description = "Consolidate conflicting imports"
            Priority = 3
        }
        "StructuralMerge" = @{
            Description = "Merge structural differences"
            Priority = 4
        }
        "ManualReview" = @{
            Description = "Requires manual review"
            Priority = 5
        }
    }
}

# Logging function
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$File = ""
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"

    if ($File) {
        $logMessage += " (File: $File)"
    }

    Write-Host $logMessage

    if ($Verbose) {
        Add-Content -Path "conflict_resolution.log" -Value $logMessage
    }
}

# Backup function
function Backup-File {
    param([string]$FilePath)

    if ($BackupFiles) {
        $backupPath = "$FilePath.backup.$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        Copy-Item -Path $FilePath -Destination $backupPath -Force
        Write-Log "Backup created: $backupPath" "INFO" $FilePath
    }
}

# Analyze conflict type
function Analyze-Conflict {
    param([string]$FilePath)

    $content = Get-Content $FilePath -Raw

    # Check for simple text conflicts
    foreach ($replacement in $CONFIG.TextReplacements) {
        if ($content -match [regex]::Escape($replacement.Pattern)) {
            return @{
                Type = "SimpleText"
                Pattern = $replacement.Pattern
                Replacement = $replacement.Replacement
                Confidence = 0.9
            }
        }
    }

    # Check for duplicate content
    if ($content -match "(?ms)^<<<<<<< HEAD.*?\n(.*?)\n=======\n\1\n>>>>>>>") {
        return @{
            Type = "DuplicateContent"
            Confidence = 0.8
        }
    }

    # Check for import conflicts
    if ($content -match "import.*<<<<<<< HEAD") {
        return @{
            Type = "ImportConsolidation"
            Confidence = 0.7
        }
    }

    # Check for structural conflicts
    if (($content -match "^<<<<<<< HEAD").Count -gt 3) {
        return @{
            Type = "StructuralMerge"
            Confidence = 0.5
        }
    }

    return @{
        Type = "ManualReview"
        Confidence = 0.1
    }
}

# Resolve simple text conflicts
function Resolve-SimpleText {
    param([string]$FilePath, [object]$Analysis)

    Write-Log "Resolving simple text conflict in $FilePath" "INFO" $FilePath

    $content = Get-Content $FilePath -Raw

    # Apply text replacements within conflict markers
    $pattern = "(?ms)(<<<<<<< HEAD.*?)($([regex]::Escape($Analysis.Pattern)))(.*?=======.*?)(.*?)($([regex]::Escape($Analysis.Pattern)))(.*>>>>>>> clean-merge)"
    $replacement = "`${1}$($Analysis.Replacement)`${3}$($Analysis.Replacement)`${6}"

    $newContent = $content -replace $pattern, $replacement

    if ($newContent -ne $content) {
        Backup-File $FilePath
        Set-Content $FilePath $newContent
        Write-Log "Applied simple text replacement" "SUCCESS" $FilePath
        return $true
    }

    Write-Log "No simple text replacements applied" "WARNING" $FilePath
    return $false
}

# Resolve duplicate content conflicts
function Resolve-DuplicateContent {
    param([string]$FilePath)

    Write-Log "Resolving duplicate content in $FilePath" "INFO" $FilePath

    $content = Get-Content $FilePath -Raw

    # Pattern to match duplicate content blocks
    $pattern = "(?ms)^<<<<<<< HEAD.*?\n(.*?)\n=======\n\1\n>>>>>>> clean-merge.*?\n"
    $replacement = "`${1}"

    $newContent = $content -replace $pattern, $replacement

    if ($newContent -ne $content) {
        Backup-File $FilePath
        Set-Content $FilePath $newContent
        Write-Log "Removed duplicate content" "SUCCESS" $FilePath
        return $true
    }

    Write-Log "No duplicate content found" "WARNING" $FilePath
    return $false
}

# Resolve import conflicts
function Resolve-ImportConflicts {
    param([string]$FilePath)

    Write-Log "Resolving import conflicts in $FilePath" "INFO" $FilePath

    $content = Get-Content $FilePath -Raw
    $originalContent = $content

    # Apply import pattern replacements
    $fileExtension = [System.IO.Path]::GetExtension($FilePath)
    if ($CONFIG.FileTypePatterns.ContainsKey($fileExtension)) {
        $patterns = $CONFIG.FileTypePatterns[$fileExtension]

        foreach ($importPattern in $patterns.ImportPatterns) {
            $content = $content -replace [regex]::Escape($importPattern.OldPattern), $importPattern.NewPattern
        }

        foreach ($functionPattern in $patterns.FunctionPatterns) {
            $content = $content -replace $functionPattern.OldPattern, $functionPattern.NewPattern
        }
    }

    if ($content -ne $originalContent) {
        Backup-File $FilePath
        Set-Content $FilePath $content
        Write-Log "Resolved import conflicts" "SUCCESS" $FilePath
        return $true
    }

    Write-Log "No import conflicts resolved" "WARNING" $FilePath
    return $false
}

# Remove conflict markers (fallback)
function Remove-ConflictMarkers {
    param([string]$FilePath)

    Write-Log "Removing conflict markers from $FilePath" "INFO" $FilePath

    $content = Get-Content $FilePath -Raw
    $originalContent = $content

    # Remove all conflict markers and keep clean-merge version
    $content = $content -replace "(?ms)<<<<<<< HEAD.*?\n", ""
    $content = $content -replace "(?ms)=======\n.*?\n>>>>>>> clean-merge.*?\n", ""

    if ($content -ne $originalContent) {
        Backup-File $FilePath
        Set-Content $FilePath $content
        Write-Log "Removed conflict markers (kept clean-merge version)" "SUCCESS" $FilePath
        return $true
    }

    return $false
}

# Main processing function
function Process-File {
    param([string]$FilePath)

    if ($Mode -eq "dry-run") {
        Write-Log "DRY RUN: Would process $FilePath" "INFO" $FilePath
        return
    }

    $analysis = Analyze-Conflict $FilePath

    Write-Log "Analyzed $FilePath - Type: $($analysis.Type), Confidence: $($analysis.Confidence)" "INFO" $FilePath

    $resolved = $false

    switch ($analysis.Type) {
        "SimpleText" {
            if ($Pattern -in @("all", "simple")) {
                $resolved = Resolve-SimpleText $FilePath $analysis
            }
        }
        "DuplicateContent" {
            if ($Pattern -in @("all", "simple")) {
                $resolved = Resolve-DuplicateContent $FilePath
            }
        }
        "ImportConsolidation" {
            if ($Pattern -in @("all", "simple", "complex")) {
                $resolved = Resolve-ImportConflicts $FilePath
            }
        }
        "StructuralMerge" {
            if ($Pattern -in @("all", "complex") -and $analysis.Confidence -gt 0.7) {
                $resolved = Remove-ConflictMarkers $FilePath
            }
        }
        "ManualReview" {
            Write-Log "Manual review required for $FilePath" "WARNING" $FilePath
            if ($Mode -eq "auto" -and $analysis.Confidence -lt 0.3) {
                $resolved = Remove-ConflictMarkers $FilePath
                Write-Log "Auto-resolved with low confidence" "WARNING" $FilePath
            }
        }
    }

    if ($resolved) {
        # Remove any remaining conflict markers
        Remove-ConflictMarkers $FilePath | Out-Null
    }

    return $resolved
}

# Find all files with conflicts
function Find-ConflictFiles {
    $conflictFiles = @()

    # Get all TypeScript/JavaScript files
    $files = Get-ChildItem -Path "." -Recurse -Include "*.ts","*.tsx","*.js","*.jsx","*.json","*.md","*.css" |
             Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" -and $_.FullName -notlike "*.git*" }

    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($content -and $content -match "^<<<<<<< HEAD") {
            $conflictFiles += $file.FullName
        }
    }

    return $conflictFiles
}

# Main execution
function Main {
    Write-Log "=== Advanced Conflict Resolution Started ===" "INFO"
    Write-Log "Mode: $Mode, Pattern: $Pattern, Backup: $BackupFiles, Verbose: $Verbose" "INFO"

    $conflictFiles = Find-ConflictFiles

    Write-Log "Found $($conflictFiles.Count) files with conflicts" "INFO"

    $resolvedCount = 0
    $manualReviewCount = 0

    foreach ($file in $conflictFiles) {
        $resolved = Process-File $file

        if ($resolved) {
            $resolvedCount++
        } else {
            $manualReviewCount++
        }
    }

    Write-Log "=== Resolution Complete ===" "INFO"
    Write-Log "Resolved: $resolvedCount files" "SUCCESS"
    Write-Log "Manual review needed: $manualReviewCount files" "WARNING"

    # Summary report
    if ($Verbose) {
        Write-Log "Summary Report:" "INFO"
        Write-Log "- Simple text replacements applied to $resolvedCount files" "INFO"
        Write-Log "- $manualReviewCount files may need manual review" "INFO"
        Write-Log "- Check conflict_resolution.log for detailed logs" "INFO"
    }
}

# Execute main function
Main
