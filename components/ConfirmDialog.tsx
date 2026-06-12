"use client";

import { AlertCircle, CheckCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const iconColors = {
    danger: "bg-red-500/10 text-red-400",
    warning: "bg-amber-500/10 text-amber-400",
    info: "bg-blue-500/10 text-blue-400",
  };

  const buttonColors = {
    danger: "bg-red-500 hover:bg-red-600",
    warning: "bg-amber-500 hover:bg-amber-600",
    info: "bg-blue-500 hover:bg-blue-600",
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onCancel}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <div
        className="bg-theme-card rounded-2xl max-w-sm w-full shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full ${iconColors[variant]} flex items-center justify-center shrink-0`}>
            {variant === "danger" ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-theme-primary">{title}</h3>
            <p className="text-sm text-theme-secondary mt-1">{message}</p>
          </div>
          <button onClick={onCancel} className="text-theme-muted hover:text-theme-primary shrink-0">
            <X size={18} />
          </button>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-theme rounded-lg text-sm font-medium text-theme-secondary hover:bg-theme-hover transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50 ${buttonColors[variant]}`}
          >
            {loading ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
