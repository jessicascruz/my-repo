import { Modal } from "./Modal";
import * as ui from "../lib/ui";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar exclusão",
  message,
  confirmText = "Excluir",
  cancelText = "Cancelar",
}: ConfirmationModalProps) {
  return (
    <Modal aberto={isOpen} onFechar={onClose} titulo={title} largura="sm:max-w-md">
      <p className={ui.corpo}>{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className={ui.btnFantasma}>
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={ui.btnPerigo}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
