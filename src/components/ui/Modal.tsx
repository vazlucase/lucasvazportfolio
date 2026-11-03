import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useBodyLock } from '../../hooks/useBodyLock';
import { Button } from './Button';
import { Icon } from './Icon';
import { Heading, Text } from './Typography';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  variant?: 'project' | 'menu';
}

export function Modal({
  isOpen,
  onClose,
  children,
  title = 'Detalhes do projeto',
  variant = 'project',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useBodyLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => dialogRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex="0"]',
      )].filter((element) => element.getClientRects().length > 0);
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`modal-overlay modal-overlay--${variant}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduced ? 0 : 0.25 }}
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            className={`modal-dialog modal-dialog--${variant}`}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            initial={{ y: reduced ? 0 : 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: reduced ? 0 : 20, opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="modal-header">
              <div>
                <Text className="mono modal-eyebrow">
                  {variant === 'menu' ? 'LUCAS VAZ® — PORTFÓLIO' : 'UM PROJETO DE LUCAS VAZ'}
                </Text>
                <Heading as="h2" className="modal-title">{title}</Heading>
              </div>
              <Button
                variant="unstyled"
                className="circle-button modal-close"
                onClick={onClose}
                aria-label={variant === 'menu' ? 'Fechar menu' : 'Fechar detalhes do projeto'}
              >
                <Icon name="close" />
              </Button>
            </div>
            <div className="modal-content">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
