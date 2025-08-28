'use client'

import React, { useState } from 'react'
import { Copy, Check, Play, Download, ExternalLink, FileText, Terminal } from '@/lib/icon-mapping'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { CodeSnippet } from '@/types/documentation'

interface CodeSnippetRendererProps {
  snippet: CodeSnippet
  showHeader?: boolean
  showActions?: boolean
  className?: string
}

export function CodeSnippetRenderer({
  snippet,
  showHeader = true,
  showActions = true,
  className = ''
}: CodeSnippetRendererProps) {
  const [copied, setCopied] = useState(false)

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Copied to clipboard",
        description: "Code snippet has been copied to your clipboard"
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      })
    }
  }

  // Handle download as file
  const handleDownload = () => {
    const extension = getFileExtension(snippet.language)
    const filename = snippet.filename || `snippet.${extension}`
    const blob = new Blob([snippet.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Downloaded",
      description: `Code snippet saved as ${filename}`
    })
  }

  // Handle run code (placeholder for future implementation)
  const handleRun = () => {
    toast({
      title: "Run Code",
      description: "Code execution feature coming soon",
      variant: "default"
    })
  }

  // Get file extension based on language
  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      cpp: 'cpp',
      c: 'c',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      swift: 'swift',
      kotlin: 'kt',
      scala: 'scala',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sass: 'sass',
      less: 'less',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      yml: 'yml',
      toml: 'toml',
      ini: 'ini',
      bash: 'sh',
      shell: 'sh',
      powershell: 'ps1',
      sql: 'sql',
      dockerfile: 'dockerfile',
      makefile: 'makefile',
      markdown: 'md',
      tex: 'tex'
    }
    return extensions[language.toLowerCase()] || 'txt'
  }

  // Get language display name and color
  const getLanguageInfo = (language: string) => {
    const languageMap: Record<string, { name: string; color: string; bgColor: string }> = {
      javascript: { name: 'JavaScript', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
      typescript: { name: 'TypeScript', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
      python: { name: 'Python', color: 'text-green-400', bgColor: 'bg-green-500/20' },
      java: { name: 'Java', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
      csharp: { name: 'C#', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
      cpp: { name: 'C++', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
      c: { name: 'C', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
      php: { name: 'PHP', color: 'text-indigo-400', bgColor: 'bg-indigo-500/20' },
      ruby: { name: 'Ruby', color: 'text-red-400', bgColor: 'bg-red-500/20' },
      go: { name: 'Go', color: 'text-cyan-400', bgColor: 'bg-cyan-500/20' },
      rust: { name: 'Rust', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
      swift: { name: 'Swift', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
      kotlin: { name: 'Kotlin', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
      scala: { name: 'Scala', color: 'text-red-400', bgColor: 'bg-red-500/20' },
      html: { name: 'HTML', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
      css: { name: 'CSS', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
      scss: { name: 'SCSS', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
      sass: { name: 'Sass', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
      less: { name: 'Less', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
      json: { name: 'JSON', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
      xml: { name: 'XML', color: 'text-green-400', bgColor: 'bg-green-500/20' },
      yaml: { name: 'YAML', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
      yml: { name: 'YAML', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
      toml: { name: 'TOML', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
      ini: { name: 'INI', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
      bash: { name: 'Bash', color: 'text-green-400', bgColor: 'bg-green-500/20' },
      shell: { name: 'Shell', color: 'text-green-400', bgColor: 'bg-green-500/20' },
      powershell: { name: 'PowerShell', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
      sql: { name: 'SQL', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
      dockerfile: { name: 'Dockerfile', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
      makefile: { name: 'Makefile', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
      markdown: { name: 'Markdown', color: 'text-gray-400', bgColor: 'bg-gray-500/20' },
      tex: { name: 'LaTeX', color: 'text-green-400', bgColor: 'bg-green-500/20' }
    }

    return languageMap[language.toLowerCase()] || { 
      name: language.charAt(0).toUpperCase() + language.slice(1), 
      color: 'text-slate-400', 
      bgColor: 'bg-slate-500/20' 
    }
  }

  const languageInfo = getLanguageInfo(snippet.language)

  // Format code with basic syntax highlighting classes
  const formatCode = (code: string, language: string) => {
    // This is a basic implementation. In a real app, you'd use a proper syntax highlighter like Prism.js or highlight.js
    return code
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-slate-400" />
              <div>
                {snippet.filename && (
                  <h4 className="font-medium text-slate-200">{snippet.filename}</h4>
                )}
                {snippet.description && (
                  <p className="text-sm text-slate-400">{snippet.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={`text-xs ${languageInfo.color} ${languageInfo.bgColor} border-current/30`}
              >
                {languageInfo.name}
              </Badge>
              {snippet.runnable && (
                <Badge variant="outline" className="text-xs text-green-400 bg-green-500/20 border-green-500/30">
                  Runnable
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Code Block */}
        <div className="relative">
          <pre className="bg-slate-900/50 p-4 overflow-x-auto text-sm">
            <code className={`language-${snippet.language} text-slate-200`}>
              {formatCode(snippet.code, snippet.language)}
            </code>
          </pre>

          {/* Action Buttons */}
          {showActions && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 w-8 p-0 bg-slate-800/80 hover:bg-slate-700/80"
                title="Copy code"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-400" />
                ) : (
                  <Copy className="h-3 w-3 text-slate-400" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0 bg-slate-800/80 hover:bg-slate-700/80"
                title="Download as file"
              >
                <Download className="h-3 w-3 text-slate-400" />
              </Button>

              {snippet.runnable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRun}
                  className="h-8 w-8 p-0 bg-slate-800/80 hover:bg-slate-700/80"
                  title="Run code"
                >
                  <Play className="h-3 w-3 text-slate-400" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Dependencies */}
        {snippet.dependencies && snippet.dependencies.length > 0 && (
          <div className="px-4 pb-4">
            <div className="border-t border-slate-700 pt-3">
              <h5 className="text-xs font-medium text-slate-300 mb-2">Dependencies:</h5>
              <div className="flex flex-wrap gap-1">
                {snippet.dependencies.map((dep, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Multi-snippet renderer for displaying multiple related code snippets
interface MultiCodeSnippetRendererProps {
  snippets: CodeSnippet[]
  title?: string
  className?: string
}

export function MultiCodeSnippetRenderer({
  snippets,
  title,
  className = ''
}: MultiCodeSnippetRendererProps) {
  const [activeSnippet, setActiveSnippet] = useState(0)

  if (snippets.length === 0) return null

  if (snippets.length === 1) {
    return <CodeSnippetRenderer snippet={snippets[0]} className={className} />
  }

  return (
    <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
      {title && (
        <CardHeader>
          <h3 className="font-medium text-slate-200">{title}</h3>
        </CardHeader>
      )}
      
      <CardContent className="p-0">
        {/* Tab Headers */}
        <div className="border-b border-slate-700">
          <div className="flex overflow-x-auto">
            {snippets.map((snippet, index) => (
              <button
                key={snippet.id}
                onClick={() => setActiveSnippet(index)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeSnippet === index
                    ? 'border-cyan-500 text-cyan-400 bg-slate-800/50'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                {snippet.filename || snippet.description || `Snippet ${index + 1}`}
              </button>
            ))}
          </div>
        </div>

        {/* Active Snippet */}
        <CodeSnippetRenderer 
          snippet={snippets[activeSnippet]} 
          showHeader={false}
          className="border-0"
        />
      </CardContent>
    </Card>
  )
}