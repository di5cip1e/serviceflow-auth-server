// src/lib/UIBase.tsx
/**
 * UIBase - Base class for TRAP UI components
 * Provides responsive positioning, standardized buttons, depth constants, and keyboard handling
 */

import React, { useEffect, useCallback, CSSProperties, ReactNode } from 'react';

// ============================================================================
// DEPTH CONSTANTS
// ============================================================================

/** Depth constants for z-index management */
export const Depth = {
  // HUD elements (500-599)
  HUD: {
    MIN: 500,
    MAX: 599,
    BACKGROUND: 500,
    MIDDLE: 550,
    FOREGROUND: 599,
  },
  // Panels/Overlays (900-999)
  PANEL: {
    MIN: 900,
    MAX: 999,
    BACKGROUND: 900,
    CONTENT: 950,
    CONTROLS: 999,
  },
  // Modals/Dialogs (1000-1099)
  MODAL: {
    MIN: 1000,
    MAX: 1099,
    BACKDROP: 1000,
    DIALOG: 1050,
    CONTROLS: 1099,
  },
} as const;

// ============================================================================
// RESPONSIVE POSITIONING
// ============================================================================

/** Responsive position config */
export interface ResponsivePosition {
  /** Horizontal position (0-100 percentage of container) */
  x?: number;
  /** Vertical position (0-100 percentage of container) */
  y?: number;
  /** Fixed pixel offset from position */
  offsetX?: number;
  offsetY?: number;
}

/** Get responsive styles for positioning */
export function getResponsiveStyle(
  position: ResponsivePosition,
  containerStyle: CSSProperties = {}
): CSSProperties {
  const { x = 0, y = 0, offsetX = 0, offsetY = 0 } = position;
  
  return {
    position: 'absolute' as const,
    left: `calc(${x}% + ${offsetX}px)`,
    top: `calc(${y}% + ${offsetY}px)`,
    transform: 'translate(-50%, -50%)',
    ...containerStyle,
  };
}

// ============================================================================
// STANDARDIZED BUTTON
// ============================================================================

/** Button variant types */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
/** Button size types */
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button content */
  children: ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: ButtonVariant;
  /** Button size */
  size?: ButtonSize;
  /** Disabled state */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Button type */
  type?: 'button' | 'submit' | 'reset';
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

/** Get button variant colors */
function getButtonColors(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        bg: 'linear-gradient(180deg, #7fdbca 0%, #4ade80 100%)',
        bgHover: 'linear-gradient(180deg, #9fe7d8 0%, #6ee7a0 100%)',
        border: '#7fdbca',
        text: '#0a0a12',
      };
    case 'secondary':
      return {
        bg: 'linear-gradient(180deg, #3d3d5c 0%, #2d2d44 100%)',
        bgHover: 'linear-gradient(180deg, #4d4d6c 0%, #3d3d54 100%)',
        border: '#3d3d5c',
        text: '#ecf0f1',
      };
    case 'danger':
      return {
        bg: 'linear-gradient(180deg, #e74c3c 0%, #c0392b 100%)',
        bgHover: 'linear-gradient(180deg, #ec7063 0%, #d35400 100%)',
        border: '#e74c3c',
        text: '#ffffff',
      };
    case 'ghost':
      return {
        bg: 'transparent',
        bgHover: 'rgba(127, 219, 202, 0.1)',
        border: '#3d3d5c',
        text: '#7fdbca',
      };
  }
}

/** Get button size styles */
function getButtonSize(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return { padding: '0.375rem 0.75rem', fontSize: '0.75rem' };
    case 'md':
      return { padding: '0.625rem 1rem', fontSize: '0.875rem' };
    case 'lg':
      return { padding: '0.875rem 1.5rem', fontSize: '1rem' };
  }
}

/** Standardized button component with consistent styling and hover states */
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  autoFocus = false,
}: ButtonProps) {
  const colors = getButtonColors(variant);
  const sizeStyles = getButtonSize(size);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      autoFocus={autoFocus}
      className={`ui-button ${className}`}
      style={{
        background: disabled ? '#2d2d44' : colors.bg,
        border: `2px solid ${disabled ? '#2d2d44' : colors.border}`,
        color: disabled ? '#636e72' : colors.text,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: "'Courier New', monospace",
        fontWeight: 'bold',
        letterSpacing: '0.05em',
        borderRadius: '2px',
        transition: 'all 0.2s ease',
        width: fullWidth ? '100%' : 'auto',
        ...sizeStyles,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = colors.bgHover;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = colors.bg;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {children}
    </button>
  );
}

// ============================================================================
// KEYBOARD HANDLER
// ============================================================================

/** Keyboard navigation callback */
export interface KeyboardCallbacks {
  /** ESC key pressed - close current panel/modal */
  onEscape?: () => void;
  /** Arrow up pressed */
  onArrowUp?: () => void;
  /** Arrow down pressed */
  onArrowDown?: () => void;
  /** Arrow left pressed */
  onArrowLeft?: () => void;
  /** Arrow right pressed */
  onArrowRight?: () => void;
  /** Enter pressed */
  onEnter?: () => void;
  /** Tab pressed */
  onTab?: (shiftKey: boolean) => void;
}

/** Global keyboard event handler hook */
export function useKeyboardHandler(
  callbacks: KeyboardCallbacks,
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Prevent default for handled keys
      const handledKeys = ['Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Tab'];
      if (handledKeys.includes(event.key)) {
        // Don't prevent default for Tab (accessibility)
        if (event.key !== 'Tab') {
          event.preventDefault();
        }
      }

      switch (event.key) {
        case 'Escape':
          callbacks.onEscape?.();
          break;
        case 'ArrowUp':
          callbacks.onArrowUp?.();
          break;
        case 'ArrowDown':
          callbacks.onArrowDown?.();
          break;
        case 'ArrowLeft':
          callbacks.onArrowLeft?.();
          break;
        case 'ArrowRight':
          callbacks.onArrowRight?.();
          break;
        case 'Enter':
          callbacks.onEnter?.();
          break;
        case 'Tab':
          callbacks.onTab?.(event.shiftKey);
          break;
      }
    },
    [callbacks, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

// ============================================================================
// PANEL BASE COMPONENT
// ============================================================================

export interface PanelProps {
  /** Panel title */
  title?: string;
  /** Panel content */
  children: ReactNode;
  /** Close handler (connects to ESC key) */
  onClose?: () => void;
  /** Panel position */
  position?: ResponsivePosition;
  /** Custom z-index */
  depth?: number;
  /** Whether panel is visible */
  visible?: boolean;
  /** Additional class name */
  className?: string;
}

/** Base panel component with standardized styling and keyboard support */
export function Panel({
  title,
  children,
  onClose,
  position = { x: 50, y: 50 },
  depth = Depth.PANEL.CONTENT,
  visible = true,
  className = '',
}: PanelProps) {
  useKeyboardHandler(
    {
      onEscape: onClose,
    },
    visible && !!onClose
  );

  if (!visible) return null;

  const positionStyle = getResponsiveStyle(position);

  return (
    <div
      className={`ui-panel ${className}`}
      style={{
        ...positionStyle,
        zIndex: depth,
        background: 'linear-gradient(135deg, rgba(13, 13, 26, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
        border: '2px solid #3d3d5c',
        padding: '1rem',
        minWidth: '200px',
        pointerEvents: 'auto',
      }}
    >
      {title && (
        <div className="panel-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #2d2d44',
        }}>
          <h3 style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '0.875rem',
            color: '#7fdbca',
            letterSpacing: '0.1em',
            margin: 0,
          }}>
            ◆ {title.toUpperCase()}
          </h3>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #3d3d5c',
                color: '#636e72',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#e74c3c';
                e.currentTarget.style.color = '#e74c3c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#3d3d5c';
                e.currentTarget.style.color = '#636e72';
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}
      <div className="panel-content">{children}</div>
    </div>
  );
}

// ============================================================================
// MODAL BASE COMPONENT
// ============================================================================

export interface ModalProps {
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Close handler (connects to ESC key) */
  onClose?: () => void;
  /** Whether modal is visible */
  visible?: boolean;
  /** Show backdrop */
  showBackdrop?: boolean;
  /** Additional class name */
  className?: string;
}

/** Base modal component with backdrop and standardized keyboard support */
export function Modal({
  title,
  children,
  onClose,
  visible = true,
  showBackdrop = true,
  className = '',
}: ModalProps) {
  useKeyboardHandler(
    {
      onEscape: onClose,
    },
    visible && !!onClose
  );

  if (!visible) return null;

  return (
    <>
      {showBackdrop && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            zIndex: Depth.MODAL.BACKDROP,
            pointerEvents: 'auto',
          }}
          onClick={onClose}
        />
      )}
      <div
        className={`ui-modal ${className}`}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: Depth.MODAL.DIALOG,
          background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
          border: '2px solid #7fdbca',
          padding: '1.5rem',
          minWidth: '300px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          pointerEvents: 'auto',
        }}
      >
        {title && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #2d2d44',
          }}>
            <h2 style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '1rem',
              color: '#7fdbca',
              letterSpacing: '0.1em',
              margin: 0,
            }}>
              ◆ {title.toUpperCase()}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: '1px solid #3d3d5c',
                  color: '#636e72',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#e74c3c';
                  e.currentTarget.style.color = '#e74c3c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#3d3d5c';
                  e.currentTarget.style.color = '#636e72';
                }}
              >
                ✕
              </button>
            )}
          </div>
        )}
        <div style={{ color: '#ecf0f1' }}>{children}</div>
      </div>
    </>
  );
}

// ============================================================================
// BAR COMPONENTS
// ============================================================================

export interface ProgressBarProps {
  /** Current value */
  value: number;
  /** Maximum value */
  max: number;
  /** Bar color - uses gradient */
  color?: 'xp' | 'health' | 'danger' | 'info';
  /** Show label */
  showLabel?: boolean;
  /** Label text (defaults to "XP" or "HP") */
  label?: string;
  /** Custom height */
  height?: number;
}

function getBarColors(type: ProgressBarProps['color']) {
  switch (type) {
    case 'xp':
      return 'linear-gradient(90deg, #3498db 0%, #9b59b6 100%)';
    case 'health':
      return 'linear-gradient(90deg, #27ae60 0%, #2ecc71 100%)';
    case 'danger':
      return 'linear-gradient(90deg, #e74c3c 0%, #c0392b 100%)';
    case 'info':
      return 'linear-gradient(90deg, #7fdbca 0%, #4ade80 100%)';
    default:
      return 'linear-gradient(90deg, #3498db 0%, #9b59b6 100%)';
  }
}

/** Standardized progress bar component */
export function ProgressBar({
  value,
  max,
  color = 'xp',
  showLabel = true,
  label,
  height = 8,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const defaultLabel = color === 'xp' ? 'XP' : color === 'health' ? 'HP' : '';

  return (
    <div style={{ marginBottom: '0.5rem' }}>
      {showLabel && (
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '0.625rem',
          color: '#636e72',
          letterSpacing: '0.1em',
          marginBottom: '0.25rem',
        }}>
          {label || defaultLabel}
        </div>
      )}
      <div
        style={{
          height: `${height}px`,
          background: '#0f0f1a',
          border: '1px solid #2d2d44',
          position: 'relative',
        }}
      >
        <div
          style={{
            height: '100%',
            background: getBarColors(color),
            width: `${percent}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      {showLabel && (
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '0.625rem',
          color: '#7f8c8d',
          textAlign: 'right',
          marginTop: '0.25rem',
        }}>
          {value} / {max}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Depth,
  getResponsiveStyle,
  Button,
  useKeyboardHandler,
  Panel,
  Modal,
  ProgressBar,
};
