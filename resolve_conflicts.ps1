# PowerShell script to resolve all merge conflicts by choosing 'ours' version
Get-ChildItem -Path "." -Recurse -Include "*.ts","*.tsx","*.js","*.jsx","*.json","*.md","*.css" -Exclude "*.d.ts" |
Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.next*" -and $_.FullName -notlike "*.git*" } |
ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match '^<<<<<<< HEAD') {
        Write-Host "Resolving conflicts in: $($_.FullName)"
        # Remove conflict markers and keep the version after =======
        $resolved = $content -replace '(?ms)^<<<<<<< HEAD.*?\n', '' -replace '(?ms)^=======\n', '' -replace '(?ms)^>>>>>>> clean-merge.*?\n', ''
        Set-Content $_.FullName $resolved -ErrorAction SilentlyContinue
    }
}
Write-Host "Conflict resolution completed!"
