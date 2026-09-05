"use client";
import {useId, type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import { useDialogFocus } from './use-dialog-focus';
export function WorkspaceMore({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useDialogFocus(), titleId=useId();
  return createPortal(<div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section ref={ref} className="panel workspace-more" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <header className="modal-heading"><h2 id={titleId}>{title}</h2><button className="button" onClick={onClose} aria-label={/[А-Яа-яЁё]/.test(title) ? 'Закрыть' : 'Close'}>×</button></header><div className="modal-content">{children}</div>
    </section>
  </div>, document.body);
}
