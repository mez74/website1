import { useCallback } from 'react';

/**
 * Navigation state structure for preserving browsing context
 * when navigating between property listings and details
 */
export interface NavigationState {
  filters: {
    location: string;
    type: string;
    bedrooms: number;
    priceRangeIndex: number;
  };
  currentPage: number;
  sortOrder: string;
  searchText: string;
  scrollPosition: number;
  propertyId: number;
  timestamp: number;
  from: string;
  url: string;
}

const STORAGE_KEY = 'mm_navigation_state';
const TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generic Navigation Context Service Hook
 * 
 * Manages saving and restoring navigation state when navigating between
 * property listings and detail pages. Provides a reusable service for:
 * - Back button navigation
 * - Related properties links
 * - Featured properties carousel
 * - Search results links
 * - Map view property clicks
 * 
 * All use the same restoration logic and state structure.
 */
export function usePropertyNavigation() {
  /**
   * Save navigation state to sessionStorage
   * Called when user navigates to a property detail page
   */
  const saveNavigationState = useCallback((state: NavigationState) => {
    try {
      // Add current timestamp for TTL validation
      const stateWithTimestamp: NavigationState = {
        ...state,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stateWithTimestamp));
      // DO NOT set isRestoringState here - we want scroll-to-top when navigating TO property detail
      // isRestoringState will be set when returning FROM property detail to properties page
    } catch (e) {
      console.error('Failed to save navigation state:', e);
    }
  }, []);

  /**
   * Get navigation state from sessionStorage
   * Called when returning to property listing page
   */
  const getNavigationState = useCallback((): NavigationState | null => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as NavigationState;
    } catch (e) {
      console.error('Failed to parse navigation state:', e);
      return null;
    }
  }, []);

  /**
   * Validate navigation state
   * Checks if state exists, is valid JSON, and hasn't exceeded TTL
   */
  const isStateValid = useCallback((state: NavigationState | null): state is NavigationState => {
    if (!state) return false;

    // Check TTL: state must be less than 30 minutes old
    const now = Date.now();
    const age = now - state.timestamp;
    if (age > TTL_MS) {
      clearNavigationState();
      return false;
    }

    // Validate required fields
    if (
      !state.filters ||
      typeof state.currentPage !== 'number' ||
      typeof state.scrollPosition !== 'number' ||
      typeof state.propertyId !== 'number'
    ) {
      return false;
    }

    return true;
  }, []);

  /**
   * Clear navigation state from sessionStorage
   * Called after successful restoration or when state expires
   */
  const clearNavigationState = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('isRestoringState');
    } catch (e) {
      console.error('Failed to clear navigation state:', e);
    }
  }, []);

  /**
   * Check if restoration is currently in progress
   * Used to guard state mutations during restoration
   */
  const isRestoringState = useCallback((): boolean => {
    try {
      return sessionStorage.getItem('isRestoringState') === 'true';
    } catch (e) {
      return false;
    }
  }, []);

  /**
   * Mark restoration as complete
   * Called after scroll restoration succeeds
   */
  const confirmRestoration = useCallback(() => {
    try {
      sessionStorage.removeItem('isRestoringState');
    } catch (e) {
      console.error('Failed to confirm restoration:', e);
    }
  }, []);

  /**
   * Set restoration flag to prevent scroll-to-top when returning to properties page
   * Called when navigating back from property detail to properties
   */
  const setRestorationFlag = useCallback(() => {
    try {
      sessionStorage.setItem('isRestoringState', 'true');
    } catch (e) {
      console.error('Failed to set restoration flag:', e);
    }
  }, []);

  /**
   * Get restoration decision as a plain boolean
   * Used during state initialization to determine if we should restore
   * 
   * This is called OUTSIDE of useState initialization to avoid
   * relying on other state variables in initializers
   */
  const shouldRestore = useCallback((): boolean => {
    const state = getNavigationState();
    return isStateValid(state);
  }, [getNavigationState, isStateValid]);

  return {
    saveNavigationState,
    getNavigationState,
    isStateValid,
    clearNavigationState,
    isRestoringState,
    confirmRestoration,
    shouldRestore,
    setRestorationFlag,
  };
}

/**
 * Helper function to get restoration state outside of React hooks
 * Used during component initialization
 */
export function getNavigationStateSync(): NavigationState | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as NavigationState;
  } catch (e) {
    console.error('Failed to parse navigation state:', e);
    return null;
  }
}

/**
 * Helper function to validate state outside of React hooks
 * Used during component initialization
 */
export function isNavigationStateValid(state: NavigationState | null): state is NavigationState {
  if (!state) return false;

  const now = Date.now();
  const age = now - state.timestamp;
  if (age > TTL_MS) {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('isRestoringState');
    } catch (e) {
      // Ignore
    }
    return false;
  }

  if (
    !state.filters ||
    typeof state.currentPage !== 'number' ||
    typeof state.scrollPosition !== 'number' ||
    typeof state.propertyId !== 'number'
  ) {
    return false;
  }

  return true;
}

/**
 * Helper function to calculate restoration decision outside of React hooks
 * Used during component initialization BEFORE useState
 */
export function calculateShouldRestore(): boolean {
  const state = getNavigationStateSync();
  return isNavigationStateValid(state);
}
