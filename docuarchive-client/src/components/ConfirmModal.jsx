function ConfirmModal({
  modalId,
  title,
  message,
  confirmText = "Conferma",
  cancelText = "Annulla",
  confirmButtonClass = "btn-danger",
  onConfirm,
  loading = false,
}) {
  return (
    <div
      className="modal fade"
      id={modalId}
      tabIndex="-1"
      aria-labelledby={`${modalId}Label`}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${modalId}Label`}>
              {title}
            </h5>

            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Chiudi"
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              disabled={loading}
            >
              {cancelText}
            </button>

            <button
              type="button"
              className={`btn ${confirmButtonClass}`}
              disabled={loading}
              onClick={async () => {
                await onConfirm();
              }}
              data-bs-dismiss="modal"
            >
              {loading ? "Operazione in corso..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;