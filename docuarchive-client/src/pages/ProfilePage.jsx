import { useTranslation } from "../context/useTranslation";

function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div className="app-page">
      <h1 className="fw-bold mb-1">{t.profileTitle}</h1>

      <p className="text-muted mb-4">{t.profileSubtitle}</p>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="profile-avatar">
              <i className="bi bi-person"></i>
            </div>

            <div>
              <h4 className="fw-bold mb-1">Admin DocuArchive</h4>
              <p className="text-muted mb-0">admin@docuarchive.local</p>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nome</label>
              <input className="form-control" value="Admin" readOnly />
            </div>

            <div className="col-md-6">
              <label className="form-label">{t.role}</label>
              <input
                className="form-control"
                value={t.administrator}
                readOnly
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">{t.email}</label>
              <input
                className="form-control"
                value="admin@docuarchive.local"
                readOnly
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">{t.accountStatus}</label>
              <input className="form-control" value={t.active} readOnly />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;