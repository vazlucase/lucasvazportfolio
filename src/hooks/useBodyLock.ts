import { useEffect } from 'react';

let lockCount = 0;
let previousOverflow = '';

// Intro, menu and project dialogs can hand the scroll lock to one another.
export function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;
    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = previousOverflow;
    };
  }, [locked]);
}
