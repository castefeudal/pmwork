"use client";
import type { ReactNode } from 'react';
import { useDialogFocus } from './use-dialog-focus';
export function WorkspaceMore({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useDialogFocus();
  return <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section ref={ref} className="panel workspace-more" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <h2>{title}</h2><button className="button" onClick={onClose} aria-label={title === 'Ещё' ? 'Закрыть' : 'Close'}>×</button>{children}
    </section>
  </div>;
}
