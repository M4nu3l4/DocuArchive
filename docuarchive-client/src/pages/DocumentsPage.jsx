import { useEffect, useState } from "react";
import UploadDocumentModal from "../components/UploadDocumentModal";
import EditDocumentModal from "../components/EditDocumentModal";
import { toast } from "react-toastify";
import { useTranslation } from "../context/useTranslation";
import { useAuth } from "../context/AuthContext";

import {
  assignDocument,
  deleteDocument,
  downloadDocument,
  getCategories,
  getClients,
  getDocumentById,
  getDocuments,
} from "../services/documentService";

import { getWorkflowStatuses } from "../services/workflowStatusService";
import { getUsers } from "../services/userService";

function DocumentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const canAssign =
    user?.roles?.includes("SuperAdmin") || user?.roles?.includes("Admin");

  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [clients, setClients] = useState([]);
  const [workflowStatuses, setWorkflowStatuses] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  const [documentToAssign, setDocumentToAssign] = useState(null);
  const [assignedToUserId, setAssignedToUserId] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    clientId: "",
    workflowStatusId: "",
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const requests = [
        getDocuments(),
        getCategories(),
        getClients(),
        getWorkflowStatuses(),
      ];

      if (canAssign) {
        requests.push(getUsers());
      }

      const [documentsData, categoriesData, clientsData, workflowStatusesData, usersData] =
        await Promise.all(requests);

      setDocuments(documentsData);
      setCategories(categoriesData);
      setClients(clientsData);
      setWorkflowStatuses(workflowStatusesData);
      setUsers(usersData || []);
    } catch (error) {
      console.error(error);
      toast.error(t.genericError || "Errore caricamento dati");
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async (customFilters = filters) => {
    try {
      setLoading(true);

      const cleanFilters = Object.fromEntries(
        Object.entries(customFilters).filter(([, value]) => value !== "")
      );

      const data = await getDocuments(cleanFilters);
      setDocuments(data);
    } catch (error) {
      console.error(error);
      toast.error(t.documentLoadError || "Errore caricamento documenti");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadDocuments(filters);
  };

  const handleResetFilters = async () => {
    const resetFilters = {
      search: "",
      categoryId: "",
      clientId: "",
      workflowStatusId: "",
    };

    setFilters(resetFilters);
    await loadDocuments(resetFilters);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleDateString(
      localStorage.getItem("docuarchive-language") === "en" ? "en-GB" : "it-IT",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const getWorkflowBadgeClass = (color) => {
    switch (color) {
      case "primary":
        return "bg-primary";
      case "secondary":
        return "bg-secondary";
      case "success":
        return "bg-success";
      case "danger":
        return "bg-danger";
      case "warning":
        return "bg-warning text-dark";
      case "info":
        return "bg-info text-dark";
      case "dark":
        return "bg-dark";
      default:
        return "bg-secondary";
    }
  };

  const openAssignModal = (document) => {
    setDocumentToAssign(document);
    setAssignedToUserId(document.assignedToUserId || "");
  };

  const handleAssignDocument = async (event) => {
    event.preventDefault();

    if (!documentToAssign) return;

    if (!assignedToUserId) {
      toast.error("Seleziona un utente a cui assegnare la pratica");
      return;
    }

    try {
      setAssigning(true);

      await assignDocument(documentToAssign.id, assignedToUserId);

      toast.success("Pratica assegnata correttamente");

      setDocumentToAssign(null);
      setAssignedToUserId("");

      await loadDocuments(filters);
    } catch (error) {
      console.error(error);
      toast.error("Errore durante l'assegnazione della pratica");
    } finally {
      setAssigning(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      setDownloadingId(document.id);

      const response = await downloadDocument(document.id);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement("a");

      link.href = blobUrl;
      link.download = document.nomeFile || "documento";
      link.click();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      toast.error(t.downloadError || "Errore durante il download del file");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (document) => {
    const confirmDelete = window.confirm(`${t.delete} "${document.titolo}" ?`);

    if (!confirmDelete) return;

    try {
      setDeletingId(document.id);

      await deleteDocument(document.id);

      toast.success(t.documentDeleted || "Documento eliminato correttamente");

      await loadDocuments(filters);
    } catch (error) {
      console.error(error);
      toast.error(t.documentDeleteError || "Errore durante eliminazione documento");
    } finally {
      setDeletingId(null);
    }
  };

  const handleShowDetail = async (id) => {
    try {
      setDetailLoading(true);
      setSelectedDocument(null);

      const data = await getDocumentById(id);
      setSelectedDocument(data);
    } catch (error) {
      console.error(error);
      toast.error(t.documentDetailError || "Errore caricamento dettaglio documento");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedDocument(null);
  };

  const activeClientsCount = clients.filter((c) => c.attivo).length;

  const workflowActiveCount = documents.filter(
    (d) => d.workflowStatusNome === "Attiva" || d.workflowStatusNome === "Active"
  ).length;

  const workflowWorkingCount = documents.filter(
    (d) =>
      d.workflowStatusNome === "In lavorazione" ||
      d.workflowStatusNome === "Working"
  ).length;

  return (
    <div className="container app-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">{t.documentArchive}</h1>
          <p className="text-muted mb-0">{t.documentArchiveSubtitle}</p>
        </div>

        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#uploadDocumentModal"
        >
          {t.newDocument}
        </button>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">{t.totalDocuments}</p>
                <h3 className="fw-bold mb-0">{documents.length}</h3>
              </div>

              <div className="kpi-icon bg-primary-subtle text-primary">
                <i className="bi bi-files"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">
                  {t.activePractices || "Pratiche attive"}
                </p>
                <h3 className="fw-bold mb-0">{workflowActiveCount}</h3>
              </div>

              <div className="kpi-icon bg-success-subtle text-success">
                <i className="bi bi-check-circle"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">
                  {t.inProgress || "In lavorazione"}
                </p>
                <h3 className="fw-bold mb-0">{workflowWorkingCount}</h3>
              </div>

              <div className="kpi-icon bg-warning-subtle text-warning">
                <i className="bi bi-hourglass-split"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted mb-1">{t.activeCompanies}</p>
                <h3 className="fw-bold mb-0">{activeClientsCount}</h3>
              </div>

              <div className="kpi-icon bg-info-subtle text-info">
                <i className="bi bi-building"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body">
          <form className="row g-3 align-items-end" onSubmit={handleSearch}>
            <div className="col-md-4">
              <label className="form-label">{t.search}</label>

              <input
                type="text"
                name="search"
                className="form-control"
                placeholder={`${t.title} / ${t.description}...`}
                value={filters.search}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">{t.category}</label>

              <select
                name="categoryId"
                className="form-select"
                value={filters.categoryId}
                onChange={handleFilterChange}
              >
                <option value="">{t.all || "All"}</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">{t.company}</label>

              <select
                name="clientId"
                className="form-select"
                value={filters.clientId}
                onChange={handleFilterChange}
              >
                <option value="">{t.all || "All"}</option>

                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.ragioneSociale}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">
                {t.workflowStatus || "Stato pratica"}
              </label>

              <select
                name="workflowStatusId"
                className="form-select"
                value={filters.workflowStatusId}
                onChange={handleFilterChange}
              >
                <option value="">{t.all || "All"}</option>

                {workflowStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-1 d-grid gap-2">
              <button type="submit" className="btn btn-primary">
                {t.search}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleResetFilters}
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
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">{t.loading}</span>
              </div>

              <p className="mt-3 mb-0">{t.loading}</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-0">
                {t.noDocumentsFound || "Nessun documento trovato"}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>{t.title}</th>
                    <th>{t.category}</th>
                    <th>{t.company}</th>
                    <th>{t.workflowStatus || "Stato pratica"}</th>
                    <th>Assegnato a</th>
                    <th>{t.creationDate}</th>
                    <th>{t.file}</th>
                    <th className="text-end">{t.actions}</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="fw-semibold">{doc.titolo}</td>

                      <td>{doc.categoriaNome}</td>

                      <td>{doc.clienteRagioneSociale}</td>

                      <td>
                        {doc.workflowStatusNome ? (
                          <span
                            className={`badge ${getWorkflowBadgeClass(
                              doc.workflowStatusColore
                            )}`}
                          >
                            {doc.workflowStatusNome}
                          </span>
                        ) : (
                          <span className="badge bg-secondary">-</span>
                        )}
                      </td>

                      <td>
                        {doc.assignedToUserFullName ? (
                          <div>
                            <span className="badge bg-primary">
                              {doc.assignedToUserFullName}
                            </span>

                            {doc.assignedAt && (
                              <div className="text-muted small mt-1">
                                {formatDate(doc.assignedAt)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="badge bg-secondary">Non assegnata</span>
                        )}
                      </td>

                      <td>{formatDate(doc.dataCreazione)}</td>

                      <td>
                        {doc.nomeFile ? (
                          <span className="text-muted small">{doc.nomeFile}</span>
                        ) : (
                          <span className="text-muted small">{t.noFile}</span>
                        )}
                      </td>

                      <td className="text-end">
                        <div className="d-flex flex-column gap-2 align-items-end">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            style={{ width: "120px" }}
                            data-bs-toggle="modal"
                            data-bs-target="#documentDetailModal"
                            onClick={() => handleShowDetail(doc.id)}
                          >
                            {t.detail}
                          </button>

                          <button
                            className="btn btn-sm btn-outline-warning"
                            style={{ width: "120px" }}
                            data-bs-toggle="modal"
                            data-bs-target="#editDocumentModal"
                            onClick={() => setDocumentToEdit(doc)}
                          >
                            {t.edit}
                          </button>

                          {canAssign && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              style={{ width: "120px" }}
                              data-bs-toggle="modal"
                              data-bs-target="#assignDocumentModal"
                              onClick={() => openAssignModal(doc)}
                            >
                              Assegna
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-outline-primary"
                            style={{ width: "120px" }}
                            disabled={!doc.percorsoFile || downloadingId === doc.id}
                            onClick={() => handleDownload(doc)}
                          >
                            {downloadingId === doc.id ? t.loading : t.download}
                          </button>

                          <button
                            className="btn btn-sm btn-outline-danger"
                            style={{ width: "120px" }}
                            disabled={deletingId === doc.id}
                            onClick={() => handleDelete(doc)}
                          >
                            {deletingId === doc.id ? t.loading : t.delete}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <UploadDocumentModal
        categories={categories}
        clients={clients}
        workflowStatuses={workflowStatuses}
        onDocumentCreated={loadInitialData}
      />

      <EditDocumentModal
        documentToEdit={documentToEdit}
        categories={categories}
        clients={clients}
        workflowStatuses={workflowStatuses}
        onDocumentUpdated={loadInitialData}
      />

      <div
        className="modal fade"
        id="assignDocumentModal"
        tabIndex="-1"
        aria-labelledby="assignDocumentModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-md modal-dialog-centered">
          <div className="modal-content">
            <form onSubmit={handleAssignDocument}>
              <div className="modal-header">
                <h5 className="modal-title" id="assignDocumentModalLabel">
                  Assegna pratica
                </h5>

                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label={t.close}
                  disabled={assigning}
                ></button>
              </div>

              <div className="modal-body">
                <p className="text-muted">
                  Documento:{" "}
                  <strong>{documentToAssign?.titolo || "-"}</strong>
                </p>

                <label className="form-label">Operatore / Utente</label>

                <select
                  className="form-select"
                  value={assignedToUserId}
                  onChange={(event) => setAssignedToUserId(event.target.value)}
                >
                  <option value="">Seleziona utente</option>

                  {users
                    .filter((u) => u.attivo)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} {u.cognome} - {u.roles?.[0] || "Operatore"}
                      </option>
                    ))}
                </select>

                {documentToAssign?.assignedToUserFullName && (
                  <div className="alert alert-light border mt-3 mb-0">
                    Attualmente assegnata a:{" "}
                    <strong>{documentToAssign.assignedToUserFullName}</strong>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  disabled={assigning}
                >
                  {t.cancel}
                </button>

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={assigning}
                  data-bs-dismiss={!assigning && assignedToUserId ? "modal" : undefined}
                >
                  {assigning ? t.saving || "Salvataggio..." : "Assegna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="documentDetailModal"
        tabIndex="-1"
        aria-labelledby="documentDetailModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="documentDetailModalLabel">
                {t.detail}
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label={t.close}
                onClick={handleCloseDetail}
              ></button>
            </div>

            <div className="modal-body">
              {detailLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">{t.loading}</span>
                  </div>
                </div>
              ) : selectedDocument ? (
                <div>
                  <h4 className="fw-bold">{selectedDocument.titolo}</h4>

                  <p className="text-muted">
                    {selectedDocument.descrizione || t.noDescription}
                  </p>

                  <hr />

                  <div className="row g-3">
                    <div className="col-md-6">
                      <strong>{t.category}:</strong>
                      <p>{selectedDocument.categoriaNome}</p>
                    </div>

                    <div className="col-md-6">
                      <strong>{t.company}:</strong>
                      <p>{selectedDocument.clienteRagioneSociale}</p>
                    </div>

                    <div className="col-md-6">
                      <strong>{t.workflowStatus || "Stato pratica"}:</strong>
                      <p>
                        {selectedDocument.workflowStatusNome ? (
                          <span
                            className={`badge ${getWorkflowBadgeClass(
                              selectedDocument.workflowStatusColore
                            )}`}
                          >
                            {selectedDocument.workflowStatusNome}
                          </span>
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>

                    <div className="col-md-6">
                      <strong>Assegnato a:</strong>
                      <p>{selectedDocument.assignedToUserFullName || "Non assegnata"}</p>
                    </div>

                    <div className="col-md-6">
                      <strong>Assegnata da:</strong>
                      <p>{selectedDocument.assignedByUserFullName || "-"}</p>
                    </div>

                    <div className="col-md-6">
                      <strong>Data assegnazione:</strong>
                      <p>{formatDate(selectedDocument.assignedAt)}</p>
                    </div>

                    <div className="col-md-6">
                      <strong>{t.creationDate}:</strong>
                      <p>{formatDate(selectedDocument.dataCreazione)}</p>
                    </div>

                    <div className="col-md-6">
                      <strong>{t.lastUpdate}:</strong>
                      <p>{formatDate(selectedDocument.dataUltimaModifica)}</p>
                    </div>

                    <div className="col-md-6">
                      <strong>{t.file}:</strong>
                      <p>{selectedDocument.nomeFile || t.noFile}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p>{t.noDescription}</p>
              )}
            </div>

            <div className="modal-footer">
              {selectedDocument?.percorsoFile && (
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => handleDownload(selectedDocument)}
                >
                  {t.download}
                </button>
              )}

              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={handleCloseDetail}
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;