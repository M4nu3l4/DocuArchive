import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "../context/useTranslation";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";

function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logoutUser } = useAuth();

  const currentUser = {
    name: user?.nome || "Utente",
    surname: user?.cognome || "",
    email: user?.email || "",
    role: user?.roles?.[0] || "Operatore",
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <i className="bi bi-folder2-open"></i>
          <span>DocuArchive</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink className="sidebar-link" to="/dashboard">
            <i className="bi bi-speedometer2"></i>
            <span>{t.dashboardTitle || "Dashboard"}</span>
          </NavLink>

          <NavLink className="sidebar-link" to="/documents">
            <i className="bi bi-files"></i>
            <span>{t.documents}</span>
          </NavLink>

          <NavLink className="sidebar-link" to="/assigned-documents">
            <i className="bi bi-person-check"></i>
            <span>{t.assignedDocuments || "Le mie pratiche"}</span>
          </NavLink>

          <NavLink className="sidebar-link" to="/clients">
            <i className="bi bi-building"></i>
            <span>{t.companies}</span>
          </NavLink>

          <NavLink className="sidebar-link" to="/categories">
            <i className="bi bi-tags"></i>
            <span>{t.categories}</span>
          </NavLink>

          <NavLink className="sidebar-link" to="/workflow-statuses">
            <i className="bi bi-kanban"></i>
            <span>{t.workflowStatuses}</span>
          </NavLink>

          <NavLink className="sidebar-link" to="/my-logs">
            <i className="bi bi-clock-history"></i>
            <span>{t.myActivities || "Le mie attività"}</span>
          </NavLink>

          {user?.roles?.includes("SuperAdmin") && (
            <>
              <NavLink className="sidebar-link" to="/users">
                <i className="bi bi-people"></i>
                <span>{t.users}</span>
              </NavLink>

              <NavLink className="sidebar-link" to="/system-logs">
                <i className="bi bi-shield-check"></i>
                <span>{t.systemLogs || "Audit di sistema"}</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <div>
            <h5 className="mb-0 fw-bold">{t.documentArchive}</h5>
            <small className="text-muted">{t.documentArchiveSubtitle}</small>
          </div>

          <div className="d-flex align-items-center gap-2">
            <NotificationBell />

            <div className="dropdown">
              <button
                className="btn btn-light dropdown-toggle d-flex align-items-center gap-2"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle text-primary"></i>

                <div className="d-flex flex-column align-items-start lh-sm">
                  <small className="text-muted">Ciao {currentUser.name}</small>
                  <span className="fw-semibold">{currentUser.role}</span>
                </div>
              </button>

              <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                <li className="px-3 py-2 border-bottom">
                  <div className="fw-semibold">
                    {currentUser.name} {currentUser.surname}
                  </div>

                  <small className="text-muted">{currentUser.email}</small>
                </li>

                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => navigate("/profile")}
                  >
                    <i className="bi bi-person me-2"></i>
                    {t.profile}
                  </button>
                </li>

                <li>
                  <button
                    className="dropdown-item"
                    type="button"
                    onClick={() => navigate("/settings")}
                  >
                    <i className="bi bi-gear me-2"></i>
                    {t.settings}
                  </button>
                </li>

                <li>
                  <hr className="dropdown-divider" />
                </li>

                <li>
                  <button
                    className="dropdown-item text-danger"
                    type="button"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    {t.logout || "Logout"}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <section className="app-content">{children}</section>
      </main>
    </div>
  );
}

export default DashboardLayout;