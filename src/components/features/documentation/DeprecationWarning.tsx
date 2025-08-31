'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DeprecationWarning as DeprecationWarningType } from '@/types/version-control';
import { AlertTriangle, AlertCircle, Clock, ExternalLink, X, ArrowRight, HelpCircle } from '@/lib/icon-mapping';
import { formatDistanceToNow, format } from 'date-fns';

interface DeprecationWarningProps {
  warning: DeprecationWarningType;
  onDismiss?: () => void;
  onRedirect?: () => void;
  showDismiss?: boolean;
  className?: string;
}

export function DeprecationWarning({
  warning,
  onDismiss,
  onRedirect,
  showDismiss = true,
  className = ''
}: DeprecationWarningProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (warning.autoRedirect && warning.redirectDelay && warning.replacement) {
      setCountdown(warning.redirectDelay);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            if (onRedirect) {
              onRedirect();
            } else if (warning.replacement) {
              window.location.href = warning.replacement.url;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [warning, onRedirect]);

  const getSeverityIcon = () => {
    switch (warning.severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <div className="icon-placeholder">Info</div>;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = () => {
    switch (warning.severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleRedirect = () => {
    if (onRedirect) {
      onRedirect();
    } else if (warning.replacement) {
      window.location.href = warning.replacement.url;
    }
  };

  if (dismissed) {
    return null;
  }

  return (
    <Alert className={`border-l-4 ${className}`} variant={getSeverityColor()}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getSeverityIcon()}
          <div className="flex-1 min-w-0">
            <AlertTitle className="flex items-center gap-2 mb-2">
              <span>Content Deprecated</span>
              <Badge variant={getSeverityColor()} className="text-xs">
                {warning.severity.toUpperCase()}
              </Badge>
            </AlertTitle>
            
            <AlertDescription className="space-y-3">
              <p className="text-sm">
                {warning.reason}
              </p>

              {warning.removalVersion && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3" />
                  <span>
                    Will be removed in version {warning.removalVersion.major}.{warning.removalVersion.minor}.{warning.removalVersion.patch}
                  </span>
                </div>
              )}

              {warning.replacement && (
                <Card className="bg-muted/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Recommended Alternative
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{warning.replacement.title}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRedirect}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Alternative
                        </Button>
                        {countdown !== null && (
                          <span className="text-xs text-muted-foreground">
                            Auto-redirecting in {countdown}s
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {warning.migrationInstructions && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Migration Instructions:</h4>
                  <div className="p-3 bg-muted rounded-md">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {warning.migrationInstructions}
                    </pre>
                  </div>
                </div>
              )}
            </AlertDescription>
          </div>
        </div>

        {showDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="p-1 h-auto"
            data-testid="dismiss-button"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </Alert>
  );
}

/**
 * Container component for managing multiple deprecation warnings
 */
interface DeprecationWarningsProps {
  warnings: DeprecationWarningType[];
  onWarningDismiss?: (warningId: string) => void;
  onWarningRedirect?: (warningId: string) => void;
  maxVisible?: number;
  className?: string;
}

export function DeprecationWarnings({
  warnings,
  onWarningDismiss,
  onWarningRedirect,
  maxVisible = 3,
  className = ''
}: DeprecationWarningsProps) {
  const [dismissedWarnings, setDismissedWarnings] = useState<Set<string>>(new Set());

  const visibleWarnings = warnings
    .filter(warning => !dismissedWarnings.has(warning.contentId))
    .sort((a, b) => {
      // Sort by severity (error > warning > info)
      const severityOrder = { error: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, maxVisible);

  const handleDismiss = (warningId: string) => {
    setDismissedWarnings(prev => new Set([...prev, warningId]));
    if (onWarningDismiss) {
      onWarningDismiss(warningId);
    }
  };

  const handleRedirect = (warningId: string) => {
    if (onWarningRedirect) {
      onWarningRedirect(warningId);
    }
  };

  if (visibleWarnings.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {visibleWarnings.map((warning) => (
        <DeprecationWarning
          key={warning.contentId}
          warning={warning}
          onDismiss={() => handleDismiss(warning.contentId)}
          onRedirect={() => handleRedirect(warning.contentId)}
        />
      ))}
      
      {warnings.length > maxVisible && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {warnings.length - maxVisible} more deprecation warnings available
          </p>
        </div>
      )}
    </div>
  );
}
