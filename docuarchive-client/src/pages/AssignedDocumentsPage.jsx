import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  downloadDocument,
  getDocuments,
  releaseDocument,
  takeDocument,
} from "../services/documentService";
import { useTranslation } from "../context/useTranslation";
import { useAuth } from "../context/AuthContext";

function AssignedDocumentsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [workingId, setWorkingId] = useState(null);

  useEffect(() => {
    loadAssignedDocuments();
  }, []);

  const loadAssignedDocuments = async () => {
    try {
      setLoading(true);

      const data = await getDocuments({
        onlyMine: true,
      });

      setDocuments(data);
    } catch (error) {
      console.error(error);
      toast.error("Errore caricamento pratiche assegnate");
    } finally {
      setLoading(false);
    }
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

  const isLockedByCurrentUser = (doc) => {
    return doc.lockedByUserId && doc.lockedByUserId === user?.token?.sub;
  };

  const handleTakeDocument = async (doc) => {
    try {
      setWorkingId(doc.id);

      await takeDocument(doc.id);

      toast.success("Pratica presa in carico");

      await loadAssignedDocuments();
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data || "Errore durante la presa in carico";

      toast.error(message);
    } finally {
      setWorkingId(null);
    }
  };

  const handleReleaseDocument = async (doc) => {
    try {
      setWorkingId(doc.id);

      await releaseDocument(doc.id);

      toast.success("Pratica rilasciata");

      await loadAssignedDocuments();
    } catch (error) {
      console.error(error);

      toast.error("Errore durante il rilascio della pratica");
    } finally {
      setWorkingId(null);
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
      toast.error("Errore durante il download del file");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="container app-page">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Le mie pratiche</h1>
        <p className="text-muted mb-0">
          Elenco delle pratiche assegnate al tuo account.
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 mb-0">{t.loading}</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox fs-1 text-muted"></i>
              <p className="mt-3 mb-0">
                Non hai ancora pratiche assegnate.
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
                    <th>Presa in carico</th>
                    <th>Assegnata il</th>
                    <th>{t.file}</th>
                    <th className="text-end">{t.actions}</th>
                  </tr>
                </thead>

                <tbody>
                  {documents.map((doc) => {
                    const lockedByMe =
                      doc.lockedByUserFullName &&
                      doc.lockedByUserFullName ===
                        `${user?.nome} ${user?.cognome}`.trim();

                    return (
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
                          {doc.lockedByUserFullName ? (
                            <div>
                              <span
                                className={`badge ${
                                  lockedByMe ? "bg-success" : "bg-warning text-dark"
                                }`}
                              >
                                {lockedByMe
                                  ? "In lavorazione da te"
                                  : `In lavorazione da ${doc.lockedByUserFullName}`}
                              </span>

                              {doc.lockedAt && (
                                <div className="text-muted small mt-1">
                                  {formatDate(doc.lockedAt)}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="badge bg-secondary">
                              Non presa in carico
                            </span>
                          )}
                        </td>

                        <td>{formatDate(doc.assignedAt)}</td>

                        <td>
                          {doc.nomeFile ? (
                            <span className="text-muted small">
                              {doc.nomeFile}
                            </span>
                          ) : (
                            <span className="text-muted small">{t.noFile}</span>
                          )}
                        </td>

                        <td className="text-end">
                          <div className="d-flex flex-column gap-2 align-items-end">
                            {!doc.lockedByUserFullName && (
                              <button
                                className="btn btn-sm btn-outline-success"
                                style={{ width: "140px" }}
                                disabled={workingId === doc.id}
                                onClick={() => handleTakeDocument(doc)}
                              >
                                {workingId === doc.id
                                  ? t.loading
                                  : "Prendi in carico"}
                              </button>
                            )}

                            {lockedByMe && (
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                style={{ width: "140px" }}
                                disabled={workingId === doc.id}
                                onClick={() => handleReleaseDocument(doc)}
                              >
                                {workingId === doc.id ? t.loading : "Rilascia"}
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-outline-primary"
                              style={{ width: "140px" }}
                              disabled={
                                !doc.percorsoFile || downloadingId === doc.id
                              }
                              onClick={() => handleDownload(doc)}
                            >
                              {downloadingId === doc.id
                                ? t.loading
                                : t.download}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignedDocumentsPage;