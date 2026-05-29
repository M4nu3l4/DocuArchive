import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "../context/useTranslation";
import {
  createClient,
  getCategories,
  getClients,
  uploadDocument,
} from "../services/documentService";
import { getWorkflowStatuses } from "../services/workflowStatusService";

const initialForm = {
  titolo: "",
  descrizione: "",
  categoriaId: "",
  clienteId: "",
  workflowStatusId: "",
  stato: "0",
  file: null,
};

const initialClientForm = {
  ragioneSociale: "",
  email: "",
};

function UploadDocumentModal({
  categories: externalCategories = [],
  clients: externalClients = [],
  workflowStatuses: externalWorkflowStatuses = [],
  onDocumentCreated,
}) {
  const { t } = useTranslation();

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState(externalCategories);
  const [clients, setClients] = useState(externalClients);
  const [workflowStatuses, setWorkflowStatuses] = useState(
    externalWorkflowStatuses
  );

  const [saving, setSaving] = useState(false);
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [clientForm, setClientForm] = useState(initialClientForm);
  const [savingClient, setSavingClient] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCategories(externalCategories);
    setClients(externalClients);
    setWorkflowStatuses(externalWorkflowStatuses);
  }, [externalCategories, externalClients, externalWorkflowStatuses]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      categoriaId: prev.categoriaId || categories[0]?.id?.toString() || "",
      clienteId: prev.clienteId || clients[0]?.id?.toString() || "",
      workflowStatusId:
        prev.workflowStatusId || workflowStatuses[0]?.id?.toString() || "",
    }));
  }, [categories, clients, workflowStatuses]);

  const loadData = async () => {
    try {
      const [categoriesData, clientsData, statusesData] = await Promise.all([
        getCategories(),
        getClients(),
        getWorkflowStatuses(),
      ]);

      setCategories(categoriesData);
      setClients(clientsData);
      setWorkflowStatuses(statusesData);
    } catch (error) {
      console.error(error);
      toast.error("Errore caricamento dati");
    }
  };

  const handleChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "file") {
      setForm((prev) => ({
        ...prev,
        file: files[0] || null,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClientChange = (event) => {
    const { name, value } = event.target;

    setClientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateClient = async () => {
    if (!clientForm.ragioneSociale.trim()) {
      toast.error("La ragione sociale è obbligatoria");
      return;
    }

    try {
      setSavingClient(true);

      const createdClient = await createClient({
        ragioneSociale: clientForm.ragioneSociale,
        email: clientForm.email,
      });

      toast.success("Azienda creata correttamente");

      const updatedClients = await getClients();
      setClients(updatedClients);

      setForm((prev) => ({
        ...prev,
        clienteId: createdClient.id.toString(),
      }));

      setClientForm(initialClientForm);
      setShowNewClientForm(false);
    } catch (error) {
      console.error(error);
      toast.error("Errore creazione azienda");
    } finally {
      setSavingClient(false);
    }
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

      if (form.file) {
        formData.append("File", form.file);
      }

      await uploadDocument(formData);

      toast.success("Documento creato correttamente");

      setForm({
        ...initialForm,
        categoriaId: categories[0]?.id?.toString() || "",
        clienteId: clients[0]?.id?.toString() || "",
        workflowStatusId: workflowStatuses[0]?.id?.toString() || "",
      });

      if (onDocumentCreated) {
        await onDocumentCreated();
      }
    } catch (error) {
      console.error(error);
      toast.error("Errore durante la creazione del documento");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal fade"
      id="uploadDocumentModal"
      tabIndex="-1"
      aria-labelledby="uploadDocumentModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title" id="uploadDocumentModalLabel">
                {t.newDocumentModalTitle}
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
                    placeholder={t.documentTitlePlaceholder}
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
                    placeholder={t.documentDescriptionPlaceholder}
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
                    className="form-select mb-2"
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

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setShowNewClientForm(!showNewClientForm)}
                  >
                    {showNewClientForm ? t.closeForm : t.addCompany}
                  </button>
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

                {showNewClientForm && (
                  <div className="col-md-12">
                    <div className="border rounded p-3 bg-light">
                      <h6 className="fw-bold mb-3">{t.newCompanyBoxTitle}</h6>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label">{t.companyName} *</label>
                          <input
                            type="text"
                            name="ragioneSociale"
                            className="form-control"
                            value={clientForm.ragioneSociale}
                            onChange={handleClientChange}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">{t.email}</label>
                          <input
                            type="email"
                            name="email"
                            className="form-control"
                            value={clientForm.email}
                            onChange={handleClientChange}
                          />
                        </div>

                        <div className="col-md-12">
                          <button
                            type="button"
                            className="btn btn-success"
                            disabled={savingClient}
                            onClick={handleCreateClient}
                          >
                            {savingClient ? t.saving : t.saveCompany}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-md-12">
                  <label className="form-label">{t.attachedFile}</label>

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
                {saving ? t.saving : t.saveDocument}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UploadDocumentModal;