import { useEffect, useRef } from 'react';

export function filterObjectByValue (object, predicate) {
  if (typeof object !== 'object') {
    return {};
  }

  return Object.keys(object).reduce((filtered, key) => {
    if (predicate(object[key])) {
      filtered[key] = object[key];
    }
    return filtered;
  }, {});
};

export const isUUID = (string = '') => {
  return string.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i) !== null;
};

export const isObject = function (o) {
  return o === Object(o) && !Array.isArray(o) && typeof o !== 'function';
};

export const toCamel = (s) => {
  if (isUUID(s)) {
    return s;
  }

  return s.replace(/([-_][A-Za-z])/g, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

export const toSnake = (s) => {
  return s.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};

export const keysToCamel = (o) => {
  if (isObject(o)) {
    const n = {};

    Object.keys(o)
      .forEach((k) => {
        n[toCamel(k)] = keysToCamel(o[k]);
      });

    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => {
      return keysToCamel(i);
    });
  }

  return o;
};

export const keysToSnake = (o) => {
  if (isObject(o)) {
    const n = {};

    Object.keys(o)
      .forEach((k) => {
        n[toSnake(k)] = keysToSnake(o[k]);
      });

    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => {
      return keysToSnake(i);
    });
  }

  return o;
};

export function useEventListener (eventName, handler, element = window) {
  // Create a ref that stores handler
  const savedHandler = useRef();

  // Update ref.current value if handler changes.
  // This allows our effect below to always get latest handler ...
  // ... without us needing to pass it in effect deps array ...
  // ... and potentially cause effect to re-run every render.
  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(
    () => {
      // Make sure element supports addEventListener
      // On
      const isSupported = element && element.addEventListener;
      if (!isSupported) return;

      // Create event listener that calls handler function stored in ref
      const eventListener = event => savedHandler.current(event);

      // Add event listener
      element.addEventListener(eventName, eventListener);

      // Remove event listener on cleanup
      return () => {
        element.removeEventListener(eventName, eventListener);
      };
    },
    [eventName, element] // Re-run if eventName or element changes
  );
};

export const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useCompare = (value) => {
  const prevValue = usePrevious(value);
  return prevValue !== value;
};
