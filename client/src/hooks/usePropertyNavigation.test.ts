import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getNavigationStateSync,
  isNavigationStateValid,
  calculateShouldRestore,
  type NavigationState,
} from './usePropertyNavigation';

describe('usePropertyNavigation - Navigation State Management', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  describe('getNavigationStateSync', () => {
    it('should return null when no state is stored', () => {
      const state = getNavigationStateSync();
      expect(state).toBeNull();
    });

    it('should return parsed state when valid JSON is stored', () => {
      const mockState: NavigationState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties?location=london',
      };

      sessionStorage.setItem('mm_navigation_state', JSON.stringify(mockState));
      const state = getNavigationStateSync();

      expect(state).toEqual(mockState);
    });

    it('should return null when invalid JSON is stored', () => {
      sessionStorage.setItem('mm_navigation_state', 'invalid json {]');
      const state = getNavigationStateSync();
      expect(state).toBeNull();
    });
  });

  describe('isNavigationStateValid', () => {
    it('should return false for null state', () => {
      const result = isNavigationStateValid(null);
      expect(result).toBe(false);
    });

    it('should return true for valid fresh state', () => {
      const now = Date.now();
      const mockState: NavigationState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: now,
        from: '/properties',
        url: '/properties?location=london',
      };

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(true);
    });

    it('should return false for state older than 30 minutes', () => {
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000 + 1000); // 30 minutes + 1 second
      const mockState: NavigationState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: thirtyMinutesAgo,
        from: '/properties',
        url: '/properties?location=london',
      };

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(false);
    });

    it('should return true for state exactly at 30 minute boundary', () => {
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000); // Exactly 30 minutes
      const mockState: NavigationState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: thirtyMinutesAgo,
        from: '/properties',
        url: '/properties?location=london',
      };

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(true);
    });

    it('should return true for state 29 minutes old', () => {
      const twentyNineMinutesAgo = Date.now() - (29 * 60 * 1000);
      const mockState: NavigationState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: twentyNineMinutesAgo,
        from: '/properties',
        url: '/properties?location=london',
      };

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(true);
    });

    it('should return false for state with missing filters', () => {
      const mockState = {
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties?location=london',
      } as any;

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(false);
    });

    it('should return false for state with missing currentPage', () => {
      const mockState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties?location=london',
      } as any;

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(false);
    });

    it('should return false for state with missing scrollPosition', () => {
      const mockState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        propertyId: 42,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties?location=london',
      } as any;

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(false);
    });

    it('should return false for state with missing propertyId', () => {
      const mockState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties?location=london',
      } as any;

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(false);
    });

    it('should clear sessionStorage when state is expired', () => {
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000 + 1000);
      const mockState: NavigationState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: thirtyMinutesAgo,
        from: '/properties',
        url: '/properties?location=london',
      };

      sessionStorage.setItem('mm_navigation_state', JSON.stringify(mockState));
      sessionStorage.setItem('isRestoringState', 'true');

      isNavigationStateValid(mockState);

      expect(sessionStorage.getItem('mm_navigation_state')).toBeNull();
      expect(sessionStorage.getItem('isRestoringState')).toBeNull();
    });
  });

  describe('calculateShouldRestore', () => {
    it('should return false when no state is stored', () => {
      const result = calculateShouldRestore();
      expect(result).toBe(false);
    });

    it('should return true for valid fresh state', () => {
      const mockState: NavigationState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties?location=london',
      };

      sessionStorage.setItem('mm_navigation_state', JSON.stringify(mockState));
      const result = calculateShouldRestore();
      expect(result).toBe(true);
    });

    it('should return false for expired state', () => {
      const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000 + 1000);
      const mockState: NavigationState = {
        filters: { location: 'London', type: 'villa', bedrooms: 3, priceRangeIndex: 2 },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: '',
        scrollPosition: 500,
        propertyId: 42,
        timestamp: thirtyMinutesAgo,
        from: '/properties',
        url: '/properties?location=london',
      };

      sessionStorage.setItem('mm_navigation_state', JSON.stringify(mockState));
      const result = calculateShouldRestore();
      expect(result).toBe(false);
    });

    it('should return false for invalid JSON', () => {
      sessionStorage.setItem('mm_navigation_state', 'invalid json {]');
      const result = calculateShouldRestore();
      expect(result).toBe(false);
    });
  });

  describe('Navigation State Structure', () => {
    it('should preserve all filter values correctly', () => {
      const mockState: NavigationState = {
        filters: {
          location: 'Marbella',
          type: 'penthouse',
          bedrooms: 4,
          priceRangeIndex: 5,
        },
        currentPage: 3,
        sortOrder: 'price_desc',
        searchText: 'luxury',
        scrollPosition: 1250,
        propertyId: 123,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties?location=marbella&type=penthouse',
      };

      sessionStorage.setItem('mm_navigation_state', JSON.stringify(mockState));
      const retrieved = getNavigationStateSync();

      expect(retrieved?.filters.location).toBe('Marbella');
      expect(retrieved?.filters.type).toBe('penthouse');
      expect(retrieved?.filters.bedrooms).toBe(4);
      expect(retrieved?.filters.priceRangeIndex).toBe(5);
    });

    it('should preserve pagination state correctly', () => {
      const mockState: NavigationState = {
        filters: { location: '', type: '', bedrooms: 0, priceRangeIndex: 0 },
        currentPage: 7,
        sortOrder: 'default',
        searchText: '',
        scrollPosition: 2000,
        propertyId: 456,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties',
      };

      sessionStorage.setItem('mm_navigation_state', JSON.stringify(mockState));
      const retrieved = getNavigationStateSync();

      expect(retrieved?.currentPage).toBe(7);
      expect(retrieved?.scrollPosition).toBe(2000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero scroll position', () => {
      const mockState: NavigationState = {
        filters: { location: '', type: '', bedrooms: 0, priceRangeIndex: 0 },
        currentPage: 1,
        sortOrder: 'default',
        searchText: '',
        scrollPosition: 0,
        propertyId: 1,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties',
      };

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(true);
    });

    it('should handle large scroll positions', () => {
      const mockState: NavigationState = {
        filters: { location: '', type: '', bedrooms: 0, priceRangeIndex: 0 },
        currentPage: 1,
        sortOrder: 'default',
        searchText: '',
        scrollPosition: 50000,
        propertyId: 1,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties',
      };

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(true);
    });

    it('should handle multiple filter combinations', () => {
      const mockState: NavigationState = {
        filters: {
          location: 'Dubai',
          type: 'villa',
          bedrooms: 5,
          priceRangeIndex: 4,
        },
        currentPage: 2,
        sortOrder: 'price_asc',
        searchText: 'waterfront',
        scrollPosition: 800,
        propertyId: 789,
        timestamp: Date.now(),
        from: '/properties',
        url: '/properties?location=dubai&type=villa&bedrooms=5',
      };

      const result = isNavigationStateValid(mockState);
      expect(result).toBe(true);
      expect(result).toBe(true);
    });
  });
});
