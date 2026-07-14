import { useState, useEffect, useCallback } from 'react';

/**
 * A robust React hook for local storage state synchronization.
 * It initializes with the provided initial value and loads the local storage item
 * ONLY after the component has mounted to prevent SSR/hydration mismatches.
 * It also encapsulates all JSON parsing and access in defensive try-catch wrappers.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Start with the default initialValue to guarantee consistent initial server/client markup
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from local storage after mounting
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(`useLocalStorage: Failed to read/parse key "${key}":`, error);
    }
  }, [key]);

  // Persistent writer function
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`useLocalStorage: Failed to write key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}
