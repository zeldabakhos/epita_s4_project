import { useEffect } from "react";

export default function MessageModal({ open, onClose, message }) {
  // Close on ESC key
  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-window">
        <p>{message}</p>
        <button className="btn btn-primary" onClick={onClose}>
          OK ✨
        </button>
      </div>
    </div>
  );
}
