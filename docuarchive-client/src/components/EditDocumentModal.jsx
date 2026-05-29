import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "../context/useTranslation";
import { updateDocumentWithFile } from "../services/documentService";

const initialForm = {
  titolo: "",
  descrizione: "",
  categoriaId: "",
  clienteId: "",
  workflowStatusId: "",
  stato: "0",
  file: null,
  removeFile: false,
};

function EditDocumentModal({
  documentToEdit,
  categories,
  clients,
  workflowStatuses = [],
  onDocumentUpdated,
}) {
  const { t } = useTranslation();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (documentToEdit) {
      setForm({
        titolo: documentToEdit.titolo || "",
        descrizione: documentToEdit.descrizione || "",
        categoriaId: documentToEdit.categoriaId?.toString() || "",
        clienteId: documentToEdit.clienteId?.toString() || "",
        workflowStatusId: documentToEdit.workflowStatusId?.toString() || "",
        stato: "0",
        file: null,
        removeFile: false,
      });
    }
  }, [documentToEdit]);

  const handleChange = (event) => {
    const { name, value, files, type, checked } = event.target;

    if (name === "file") {
      setForm((prev) => ({
        ...prev,
        file: files[0] || null,
        removeFile: false,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRemoveFile = () => {
    setForm((prev) => ({
      ...prev,
      file: null,
      removeFile: true,
    }));
  };

  const handleCancelRemoveFile = () => {
    setForm((prev) => ({
      ...prev,
      removeFile: false,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.titolo.trim()) {
      toast.error("Il titolo è obbligatorio");
      return;
    }

    if (!form.categoriaId) {
      toast.error("La categoria è obbligatoria");
      return;
    }

    if (!form.clienteId) {
      toast.error("Il cliente/azienda è obbligatorio");
      return;
    }

    if (!form.workflowStatusId) {
      toast.error("Lo stato pratica è obbligatorio");
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("Titolo", form.titolo);
      formData.append("Descrizione", form.descrizione || "");
      formData.append("CategoriaId", form.categoriaId);
      formData.append("ClienteId", form.clienteId);
      formData.append("WorkflowStatusId", form.workflowStatusId);
      formData.append("Stato", form.stato);
      formData.append("RemoveFile", form.removeFile);

      if (form.file) {
        formData.append("File", form.file);
      }

      await updateDocumentWithFile(documentToEdit.id, formData);

      toast.success("Documento aggiornato correttamente");

      if (onDocumentUpdated) {
        await onDocumentUpdated();
      }
    } catch (error) {
      console.error(error);
      toast.error("Errore durante l'aggiornamento del documento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal fade"
      id="editDocumentModal"
      tabIndex="-1"
      aria-labelledby="editDocumentModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title" id="editDocumentModalLabel">
                {t.edit} {t.documents?.toLowerCase() || "documento"}
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label={t.close}
                disabled={saving}
              ></button>
            </div>

            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label">{t.title} *</label>
                  <input
                    type="text"
                    name="titolo"
                    className="form-control"
                    value={form.titolo}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label">{t.description}</label>
                  <textarea
                    name="descrizione"
                    className="form-control"
                    rows="3"
                    value={form.descrizione}
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="col-md-4">
                  <label className="form-label">{t.category} *</label>
                  <select
                    name="categoriaId"
                    className="form-select"
                    value={form.categoriaId}
                    onChange={handleChange}
                  >
                    <option value="">{t.all}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">{t.clientCompany} *</label>
                  <select
                    name="clienteId"
                    className="form-select"
                    value={form.clienteId}
                    onChange={handleChange}
                  >
                    <option value="">{t.all}</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.ragioneSociale}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">
                    {t.workflowStatus || "Stato pratica"} *
                  </label>
                  <select
                    name="workflowStatusId"
                    className="form-select"
                    value={form.workflowStatusId}
                    onChange={handleChange}
                  >
                    <option value="">{t.all}</option>
                    {workflowStatuses
                      .filter((status) => status.attivo)
                      .map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.nome}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-md-12">
                  <label className="form-label">
                    {t.currentFile || "File attuale"}
                  </label>

                  {documentToEdit?.nomeFile && !form.removeFile ? (
                    <div className="alert alert-light border d-flex justify-content-between align-items-center">
                      <div>
                        <i className="bi bi-paperclip me-2"></i>
                        <strong>{documentToEdit.nomeFile}</strong>
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={handleRemoveFile}
                      >
                        {t.removeAttachment || "Rimuovi allegato"}
                      </button>
                    </div>
                  ) : form.removeFile ? (
                    <div className="alert alert-warning d-flex justify-content-between align-items-center">
                      <span>
                        {t.fileWillBeRemoved ||
                          "Il file attuale verrà rimosso al salvataggio."}
                      </span>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={handleCancelRemoveFile}
                      >
                        {t.cancelRemoveFile || "Annulla rimozione"}
                      </button>
                    </div>
                  ) : (
                    <div className="alert alert-secondary mb-0">
                      {t.noFile}
                    </div>
                  )}
                </div>

                <div className="col-md-12">
                  <label className="form-label">
                    {t.replaceFile || "Sostituisci file"}
                  </label>

                  <input
                    type="file"
                    name="file"
                    className="form-control"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleChange}
                  />

                  <small className="text-muted">{t.allowedFileTypes}</small>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                disabled={saving}
              >
                {t.cancel}
              </button>

              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? t.saving : t.saveChanges}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditDocumentModal;