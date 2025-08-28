/**
 * Client-side error recovery utilities for Next.js 15.5.2
 * Handles clientReferenceManifest and other known issues
 */

// Global error handler for clientReferenceManifest issues
export function setupClientErrorRecovery() {
  if (typeof window === 'undefined') return;

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    if (error?.message?.includes('clientReferenceManifest')) {
      console.warn('Client reference manifest error detected, attempting recovery...');
      event.preventDefault();
      
      // Attempt to recover by reloading the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });

  // Handle runtime errors
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    if (error?.message?.includes('clientReferenceManifest')) {
      console.warn('Client reference manifest error detected, attempting recovery...');
      event.preventDefault();
      
      // Attempt to recover by reloading the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });

  // Handle Next.js specific errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args.join(' ');
    
    if (errorMessage.includes('clientReferenceManifest')) {
      console.warn('Client reference manifest error detected in console, attempting recovery...');
      
      // Attempt to recover by reloading the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args);
  };
}

// Check if we're in a problematic state
export function isClientReferenceManifestError(error: any): boolean {
  return error?.message?.includes('clientReferenceManifest') || 
         error?.message?.includes('Expected clientReferenceManifest to be defined');
}

// Recovery function for client reference manifest errors
export function recoverFromClientReferenceManifestError() {
  if (typeof window === 'undefined') return;
  
  console.warn('Attempting to recover from client reference manifest error...');
  
  // Clear any cached data that might be causing issues
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
      });
    });
  }
  
  // Clear localStorage and sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (e) {
    console.warn('Could not clear storage:', e);
  }
  
  // Reload the page
  setTimeout(() => {
    window.location.reload();
  }, 500);
}

// Initialize error recovery on client side
if (typeof window !== 'undefined') {
  setupClientErrorRecovery();
}
