import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useDeliveryPolling(
  callback: () => Promise<void> | void,
  intervalMs: number,
  enabled = true,
) {
  const callbackRef = useRef(callback);
  const runningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return undefined;

    let active = true;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const clearScheduledRun = () => {
      if (!timeout) return;
      clearTimeout(timeout);
      timeout = undefined;
    };

    const scheduleNextRun = () => {
      clearScheduledRun();
      if (active && AppState.currentState !== 'background' && AppState.currentState !== 'inactive') {
        timeout = setTimeout(run, intervalMs);
      }
    };

    const run = () => {
      if (!active || runningRef.current) return;

      runningRef.current = true;
      void Promise.resolve(callbackRef.current()).finally(() => {
        runningRef.current = false;
        scheduleNextRun();
      });
    };

    if (AppState.currentState !== 'background' && AppState.currentState !== 'inactive') {
      run();
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
      else clearScheduledRun();
    });

    return () => {
      active = false;
      clearScheduledRun();
      subscription.remove();
    };
  }, [enabled, intervalMs]);
}
