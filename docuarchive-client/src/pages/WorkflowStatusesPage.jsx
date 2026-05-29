import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import { useTranslation } from "../context/useTranslation";
import {
  createWorkflowStatus,
  deleteWorkflowStatus,
  getWorkflowStatuses,
  updateWorkflowStatus,
} from "../services/workflowStatusService";

const initialForm = {
  nome: "",
  colore: "secondary",
  ordine: 0,
  attivo: true,
};

const colorOptions = [
  "secondary",
  "primary",
  "success",
  "warning",
  "danger",
  "info",
  "dark",
];

function WorkflowStatusesPage() {
  const { t } = useTranslation();

  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingStatus, setEditingStatus] = useState(null);
  const [statusToDelete, setStatusToDelete] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async (searchValue = "") => {
    try {
      setLoading(true);
      const data = await getWorkflowStatuses(searchValue);
      setStatuses(data);
    } catch (error) {
      console.error(error);
      toast.error("Errore caricamento stati pratica");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingStatus(null);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadStatuses(search.trim());
  };

  const handleResetSearch = async () => {
    setSearch("");
    await loadStatuses();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (status) => {
    setEditingStatus(status);

    setForm({
      nome: status.nome || "",
      colore: status.colore || "secondary",
      ordine: status.ordine ?? 0,
      attivo: status.attivo,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nome.trim()) {
      toast.error("Il nome dello stato è obbligatorio");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nome: form.nome,
        colore: form.colore,
        ordine: Number(form.ordine),
        attivo: form.attivo,
      };

      if (editingStatus) {
        await updateWorkflowStatus(editingStatus.id, payload);
        toast.success("Stato pratica aggiornato correttamente");
      } else {
        await createWorkflowStatus({
          nome: form.nome,
          colore: form.colore,
          ordine: Number(form.ordine),
        });
        toast.success("Stato pratica creato correttamente");
      }

      resetForm();
      await loadStatuses(search.trim());
    } catch (error) {
      console.error(error);
      toast.error("Errore durante il salvataggio dello stato pratica");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!statusToDelete) return;

    try {
      setDeleting(true);
      await deleteWorkflowStatus(statusToDelete.id);

      toast.success("Operazione completata correttamente");
      setStatusToDelete(null);

      await loadStatuses(search.trim());
    } catch (error) {
      console.error(error);
      toast.error("Errore durante l'eliminazione dello stato pratica");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="app-page">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">{t.workflowStatusesTitle}</h1>
        <p className="text-muted mb-0">{t.workflowStatusesSubtitle}</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                {editingStatus ? t.editWorkflowStatus : t.newWorkflowStatus}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">{t.workflowStatusName} *</label>
                  <input
                    type="text"
                    name="nome"
                    className="form-control"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder={t.workflowStatusPlaceholder}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.badgeColor}</label>
                  <select
                    name="colore"
                    className="form-select"
                    value={form.colore}
                    onChange={handleChange}
                  >
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2">
                    <span className={`badge bg-${form.colore}`}>
                      {t.preview}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">{t.order}</label>
                  <input
                    type="number"
                    name="ordine"
                    className="form-control"
                    value={form.ordine}
                    onChange={handleChange}
                  />
                </div>

                {editingStatus && (
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="attivo"
                      checked={form.attivo}
                      onChange={handleChange}
                      id="workflowStatusActiveSwitch"
                    />

                    <label
                      className="form-check-label"
                      htmlFor="workflowStatusActiveSwitch"
                    >
                      {t.workflowStatusActive}
                    </label>
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving
                      ? t.saving
                      : editingStatus
                      ? t.saveChanges
                      : t.createWorkflowStatus}
                  </button>

                  {editingStatus && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      {t.cancelEdit}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-body">
              <form className="row g-2" onSubmit={handleSearch}>
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t.searchWorkflowStatusPlaceholder}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="col-md-2 d-grid">
                  <button type="submit" className="btn btn-primary">
                    {t.search}
                  </button>
                </div>

                <div className="col-md-2 d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleResetSearch}
                  >
                    {t.reset}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : statuses.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mb-0">{t.noWorkflowStatusesFound}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t.order}</th>
                        <th>{t.workflowStatusName}</th>
                        <th>Badge</th>
                        <th>{t.status}</th>
                        <th className="text-end">{t.actions}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {statuses.map((status) => (
                        <tr key={status.id}>
                          <td>{status.ordine}</td>

                          <td className="fw-semibold">{status.nome}</td>

                          <td>
                            <span className={`badge bg-${status.colore}`}>
                              {status.nome}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                status.attivo ? "bg-success" : "bg-secondary"
                              }`}
                            >
                              {status.attivo ? t.enabled : t.disabled}
                            </span>
                          </td>

                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-warning me-2"
                              onClick={() => handleEdit(status)}
                            >
                              {t.edit}
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              data-bs-toggle="modal"
                              data-bs-target="#deleteWorkflowStatusModal"
                              onClick={() => setStatusToDelete(status)}
                            >
                              {t.delete}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        modalId="deleteWorkflowStatusModal"
        title={t.deleteWorkflowStatusConfirmTitle}
        message={
          statusToDelete
            ? `${t.deleteWorkflowStatusConfirmMessage} "${statusToDelete.nome}"?`
            : `${t.deleteWorkflowStatusConfirmMessage}?`
        }
        confirmText={t.delete}
        cancelText={t.cancel}
        confirmButtonClass="btn-danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default WorkflowStatusesPage;