import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import ConfirmModal from "../components/ConfirmModal";

import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from "../services/documentService";

import { useTranslation } from "../context/useTranslation";

const initialForm = {
  ragioneSociale: "",
  email: "",
  attivo: true,
};

function ClientsPage() {
  const { t } = useTranslation();

  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(initialForm);

  const [editingClient, setEditingClient] = useState(null);
  const [clientToDelete, setClientToDelete] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async (searchValue = "") => {
    try {
      setLoading(true);

      const data = await getClients(
        searchValue ? { search: searchValue } : {}
      );

      setClients(data);
    } catch (error) {
      console.error(error);
      toast.error("Errore caricamento aziende");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingClient(null);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadClients(search.trim());
  };

  const handleResetSearch = async () => {
    setSearch("");
    await loadClients();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (client) => {
    setEditingClient(client);

    setForm({
      ragioneSociale: client.ragioneSociale || "",
      email: client.email || "",
      attivo: client.attivo,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.ragioneSociale.trim()) {
      toast.error("La ragione sociale è obbligatoria");
      return;
    }

    try {
      setSaving(true);

      if (editingClient) {
        await updateClient(editingClient.id, form);

        toast.success("Azienda aggiornata correttamente");
      } else {
        await createClient({
          ragioneSociale: form.ragioneSociale,
          email: form.email,
        });

        toast.success("Azienda creata correttamente");
      }

      resetForm();
      await loadClients(search.trim());
    } catch (error) {
      console.error(error);
      toast.error("Errore durante il salvataggio dell'azienda");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      setDeleting(true);

      await deleteClient(clientToDelete.id);

      toast.success("Operazione completata correttamente");

      setClientToDelete(null);

      await loadClients(search.trim());
    } catch (error) {
      console.error(error);
      toast.error("Errore durante l'eliminazione dell'azienda");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="app-page">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">
          {t.companiesTitle}
        </h1>

        <p className="text-muted mb-0">
          {t.companiesSubtitle}
        </p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                {editingClient
                  ? t.editCompany
                  : t.newCompany}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    {t.companyName} *
                  </label>

                  <input
                    type="text"
                    name="ragioneSociale"
                    className="form-control"
                    value={form.ragioneSociale}
                    onChange={handleChange}
                    placeholder={t.companyPlaceholder}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {t.email}
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    placeholder={t.emailPlaceholder}
                  />
                </div>

                {editingClient && (
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="attivo"
                      checked={form.attivo}
                      onChange={handleChange}
                      id="clientActiveSwitch"
                    />

                    <label
                      className="form-check-label"
                      htmlFor="clientActiveSwitch"
                    >
                      {t.companyActive}
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
                      ? "Saving..."
                      : editingClient
                      ? t.saveChanges
                      : t.createCompany}
                  </button>

                  {editingClient && (
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
              <form
                className="row g-2"
                onSubmit={handleSearch}
              >
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t.searchCompanyPlaceholder}
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </div>

                <div className="col-md-2 d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
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
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mb-0">
                    {t.noCompaniesFound}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t.companyName}</th>
                        <th>{t.email}</th>
                        <th>{t.status}</th>
                        <th className="text-end">
                          {t.actions}
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {clients.map((client) => (
                        <tr key={client.id}>
                          <td className="fw-semibold">
                            {client.ragioneSociale}
                          </td>

                          <td>{client.email}</td>

                          <td>
                            <span
                              className={`badge ${
                                client.attivo
                                  ? "bg-success"
                                  : "bg-secondary"
                              }`}
                            >
                              {client.attivo
                                ? t.active
                                : t.inactive}
                            </span>
                          </td>

                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-warning me-2"
                              onClick={() =>
                                handleEdit(client)
                              }
                            >
                              {t.edit}
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              data-bs-toggle="modal"
                              data-bs-target="#deleteClientModal"
                              onClick={() =>
                                setClientToDelete(client)
                              }
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
        modalId="deleteClientModal"
        title="Conferma eliminazione azienda"
        message={
          clientToDelete
            ? `Vuoi eliminare l'azienda "${clientToDelete.ragioneSociale}"?`
            : "Vuoi eliminare questa azienda?"
        }
        confirmText={t.delete}
        confirmButtonClass="btn-danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default ClientsPage;