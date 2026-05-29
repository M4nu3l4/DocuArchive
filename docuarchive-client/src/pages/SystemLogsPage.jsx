import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getAllDocumentLogs } from "../services/documentService";
import { useTranslation } from "../context/useTranslation";

function SystemLogsPage() {
  const { t } = useTranslation();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAllDocumentLogs();
      setLogs(data);
    } catch (error) {
      console.error(error);
      toast.error("Errore caricamento log di sistema");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateValue) => {
    if (!dateValue) return "-";

    return new Date(dateValue).toLocaleString(
      localStorage.getItem("docuarchive-language") === "en" ? "en-GB" : "it-IT",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="container app-page">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Audit di sistema</h1>
        <p className="text-muted mb-0">
          Log globale delle attività sui documenti, visibile solo al SuperAdmin.
        </p>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 mb-0">{t.loading}</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-shield-check fs-1 text-muted"></i>
              <p className="mt-3 mb-0">Nessun log registrato.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Data</th>
                    <th>Utente</th>
                    <th>Documento</th>
                    <th>Azione</th>
                    <th>Descrizione</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{formatDateTime(log.createdAt)}</td>
                      <td className="fw-semibold">{log.userFullName}</td>
                      <td>{log.documentTitle || "-"}</td>
                      <td>
                        <span className="badge bg-primary">{log.action}</span>
                      </td>
                      <td>{log.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemLogsPage;