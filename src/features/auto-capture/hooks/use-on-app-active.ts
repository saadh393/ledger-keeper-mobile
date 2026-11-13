import * as React from 'react';
import { AppState } from 'react-native';

export function useOnAppActive(callback: () => void) {
  const latest = React.useRef(callback);
  latest.current = callback;

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active')
        latest.current();
    });
    return () => subscription.remove();
  }, []);
}
