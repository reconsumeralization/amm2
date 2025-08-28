import * as React from 'react'

declare global {
  namespace React {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      className?: string
    }
    interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
      type?: 'button' | 'submit' | 'reset'
    }
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
      type?: string
    }
  }
}

export = React
export as namespace React 