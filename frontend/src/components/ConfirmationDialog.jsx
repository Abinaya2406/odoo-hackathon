import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info } from 'lucide-react';

export const ConfirmationDialog = React.memo(({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // danger | primary
  loading = false
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-4 p-2">
        <div className={`p-3 rounded-full shrink-0 ${variant === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
          {variant === 'danger' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="text-base font-bold text-slate-900 mb-1">{title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
});

ConfirmationDialog.displayName = 'ConfirmationDialog';
