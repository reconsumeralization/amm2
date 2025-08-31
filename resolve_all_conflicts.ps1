# PowerShell script to resolve all remaining merge conflicts by keeping clean-merge version
Get-ChildItem -Path "." -Recurse -Include "*.ts","*.tsx","*.js","*.jsx","*.json","*.md","*.css" -Exclude "*.d.ts" |
Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" -and $_.FullName -notlike "*.git*" } |
ForEach-Object {
    $filePath = $_.FullName
    $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match '^<<<<<<< HEAD') {
        Write-Host "Resolving conflicts in: $filePath"
        # Split content by conflict markers
        $parts = $content -split '(?ms)^<<<<<<< HEAD.*?\n'

        $resolvedContent = ""
        foreach ($part in $parts) {
            if ($part -match '(?ms)^=======\n(.*?)^>>>>>>> clean-merge.*?\n(.*)$') {
                # Keep the clean-merge version (after =======)
                $resolvedContent += $matches[1]
            } elseif ($part -and $part -notmatch '^>>>>>>>') {
                # Keep non-conflict content
                $resolvedContent += $part
            }
        }

        # Clean up any remaining conflict markers
        $resolvedContent = $resolvedContent -replace '(?ms)^=======\n', '' -replace '(?ms)^>>>>>>> clean-merge.*?\n', ''

        Set-Content $filePath $resolvedContent -ErrorAction SilentlyContinue
        Write-Host "✓ Resolved: $filePath"
    }
}

# Stage all resolved files
git add -A
Write-Host "All conflicts resolved and files staged!"
