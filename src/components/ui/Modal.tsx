import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      /* Focus trap — mantém o foco dentro do modal */
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      setTimeout(() => modalRef.current?.focus(), 50);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return createPortal(
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998,
              background: 'var(--card-bg)',
              backdropFilter: 'blur(24px)',
            }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="modal-container"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
              pointerEvents: 'none',
            }}
          >
            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={title || 'Detalhes do projeto'}
              tabIndex={-1}
              style={{
                width: '100%',
                maxWidth: 'min(70vw, 600px)',
                maxHeight: '85vh',
                pointerEvents: 'auto',
                position: 'relative',
                outline: 'none',
              }}
            >
              <div
                style={{
                  background: 'var(--card-bg)',
                  backdropFilter: 'blur(12px)',
                  borderRadius: '24px',
                  border: '1px solid rgba(var(--fg-rgb), 0.15)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(var(--fg-rgb), 0.05)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Linha decorativa no topo */}
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--fg-muted), transparent)',
                    opacity: 0.3,
                  }}
                />

                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px 12px 24px',
                    borderBottom: '1px solid rgba(var(--fg-rgb), 0.08)',
                  }}
                >
                  {title && (
                    <h2
                      style={{
                        fontSize: 'clamp(18px, 4vw, 22px)',
                        fontWeight: 600,
                        letterSpacing: '-0.02em',
                        background: 'linear-gradient(135deg, var(--fg) 0%, var(--fg-muted) 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {title}
                    </h2>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    aria-label="Fechar modal"
                    type="button"
                    style={{
                      background: 'rgba(var(--fg-rgb), 0.08)',
                      border: '1px solid rgba(var(--fg-rgb), 0.1)',
                      borderRadius: '12px',
                      width: '36px',
                      height: '36px',
                      minWidth: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--fg-muted)',
                      fontSize: '18px',
                      transition: 'all 0.2s ease',
                      marginLeft: title ? '12px' : 'auto',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(var(--fg-rgb), 0.15)';
                      e.currentTarget.style.color = 'var(--fg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(var(--fg-rgb), 0.08)';
                      e.currentTarget.style.color = 'var(--fg-muted)';
                    }}
                  >
                    ✕
                  </motion.button>
                </div>

                {/* Content */}
                <div
                  className="modal-content-scroll"
                  style={{
                    padding: '20px 24px 24px 24px',
                    maxHeight: 'calc(85vh - 80px)',
                    overflowY: 'auto',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--fg-muted) var(--card-bg)',
                  }}
                >
                  {children}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
