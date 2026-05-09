// src/lib/usePanelState.tsx
/**
 * Panel State Manager
 * Provides global panel state management with ESC key support to close panels
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useKeyboardHandler, Depth } from './UIBase';

interface PanelState {
  /** Currently open panel id */
  openPanel: string | null;
  /** Panel stack for nested panels */
  panelStack: string[];
}

interface PanelContextValue {
  /** Currently open panel */
  openPanel: string | null;
  /** Open a panel */
  openPanelById: (id: string) => void;
  /** Close the current panel */
  closePanel: () => void;
  /** Close all panels */
  closeAllPanels: () => void;
  /** Check if a panel is open */
  isPanelOpen: (id: string) => boolean;
}

const PanelContext = createContext<PanelContextValue | null>(null);

interface PanelProviderProps {
  children: ReactNode;
}

/** Provider component for panel state management */
export function PanelProvider({ children }: PanelProviderProps) {
  const [panelState, setPanelState] = useState<PanelState>({
    openPanel: null,
    panelStack: [],
  });

  const openPanelById = useCallback((id: string) => {
    setPanelState((prev) => ({
      openPanel: id,
      panelStack: [...prev.panelStack, id],
    }));
  }, []);

  const closePanel = useCallback(() => {
    setPanelState((prev) => {
      const newStack = prev.panelStack.slice(0, -1);
      return {
        openPanel: newStack.length > 0 ? newStack[newStack.length - 1] : null,
        panelStack: newStack,
      };
    });
  }, []);

  const closeAllPanels = useCallback(() => {
    setPanelState({
      openPanel: null,
      panelStack: [],
    });
  }, []);

  const isPanelOpen = useCallback(
    (id: string) => panelState.openPanel === id,
    [panelState.openPanel]
  );

  // Global keyboard handler for ESC to close panels
  useKeyboardHandler(
    {
      onEscape: closePanel,
    },
    panelState.openPanel !== null
  );

  return (
    <PanelContext.Provider
      value={{
        openPanel: panelState.openPanel,
        openPanelById,
        closePanel,
        closeAllPanels,
        isPanelOpen,
      }}
    >
      {children}
    </PanelContext.Provider>
  );
}

/** Hook to access panel state */
export function usePanel() {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanel must be used within a PanelProvider');
  }
  return context;
}

// Export depth for external use
export { Depth };