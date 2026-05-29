import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getDocuments, getMyDocumentLogs } from "../services/documentService";
import { useTranslation } from "../context/useTranslation";

function DashboardPage() {
  const { t } = useTranslation();

  const [documents, setDocuments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [documentsData, logsData] = await Promise.all([
        getDocuments(),
        getMyDocumentLogs(),
      ]);

      setDocuments(documentsData);
      setLogs(logsData);
    } catch (error) {
      console.error(error);
      toast.error(t.dashboardLoadError || "Errore caricamento dashboard");
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

  const totalDocuments = documents.length;

  const assignedToMe = documents.filter((doc) => doc.assignedToUserId).length;

  const lockedDocuments = documents.filter((doc) => doc.lockedByUserId).length;

  const unassignedDocuments = documents.filter(
    (doc) => !doc.assignedToUserId
  ).length;

  const recentLogs = logs.slice(0, 5);

  return (
    <div className="container app-page">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">{t.dashboardTitle || "Dashboard"}</h1>

        <p className="text-muted mb-0">
          {t.dashboardSubtitle ||
            "Panoramica operativa delle pratiche e delle attività recenti."}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 mb-0">{t.loading}</p>
        </div>
      ) : (
        <>
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      {t.totalDocuments || "Documenti totali"}
                    </p>
                    <h3 className="fw-bold mb-0">{totalDocuments}</h3>
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
                      {t.assignedCases || "Pratiche assegnate"}
                    </p>
                    <h3 className="fw-bold mb-0">{assignedToMe}</h3>
                  </div>

                  <div className="kpi-icon bg-success-subtle text-success">
                    <i className="bi bi-person-check"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      {t.lockedCases || "In lavorazione"}
                    </p>
                    <h3 className="fw-bold mb-0">{lockedDocuments}</h3>
                  </div>

                  <div className="kpi-icon bg-warning-subtle text-warning">
                    <i className="bi bi-lock"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <p className="text-muted mb-1">
                      {t.unassignedCases || "Non assegnate"}
                    </p>
                    <h3 className="fw-bold mb-0">{unassignedDocuments}</h3>
                  </div>

                  <div className="kpi-icon bg-secondary-subtle text-secondary">
                    <i className="bi bi-inbox"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                {t.recentActivities || "Attività recenti"}
              </h5>

              {recentLogs.length === 0 ? (
                <p className="text-muted mb-0">
                  {t.noRecentActivities || "Nessuna attività recente."}
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t.date || "Data"}</th>
                        <th>{t.document || "Documento"}</th>
                        <th>{t.action || "Azione"}</th>
                        <th>{t.description || "Descrizione"}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{formatDateTime(log.createdAt)}</td>
                          <td className="fw-semibold">
                            {log.documentTitle || "-"}
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              {log.action}
                            </span>
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
        </>
      )}
    </div>
  );
}

export default DashboardPage;