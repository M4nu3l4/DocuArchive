import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "../context/useTranslation";
import { register } from "../services/authService";
import {
  getUsers,
  updateUserActive,
  updateUserRole,
} from "../services/userService";

const roles = ["SuperAdmin", "Admin", "Operatore"];

const initialForm = {
  nome: "",
  cognome: "",
  email: "",
  password: "",
  role: "Operatore",
};

function UsersPage() {
  const { t } = useTranslation();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Errore caricamento utenti");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();

    if (
      !form.nome.trim() ||
      !form.cognome.trim() ||
      !form.email.trim() ||
      !form.password.trim()
    ) {
      toast.error("Compila tutti i campi obbligatori");
      return;
    }

    try {
      setCreating(true);
      await register(form);

      toast.success("Utente creato correttamente");

      setForm(initialForm);
      setShowCreateForm(false);

      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Errore durante la creazione dell’utente");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      setSavingId(userId);
      await updateUserRole(userId, role);

      toast.success("Ruolo aggiornato");
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Errore aggiornamento ruolo");
    } finally {
      setSavingId(null);
    }
  };

  const handleActiveChange = async (userId, attivo) => {
    try {
      setSavingId(userId);
      await updateUserActive(userId, attivo);

      toast.success(attivo ? "Utente riattivato" : "Utente disattivato");
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error("Errore aggiornamento stato utente");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="app-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">{t.usersTitle}</h1>
          <p className="text-muted mb-0">{t.usersSubtitle}</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateForm((prev) => !prev)}
        >
          {showCreateForm ? t.close : t.newUser}
        </button>
      </div>

      {showCreateForm && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <h5 className="fw-bold mb-3">{t.createNewUser}</h5>

            <form className="row g-3" onSubmit={handleCreateUser}>
              <div className="col-md-3">
                <label className="form-label">{t.firstName} *</label>
                <input
                  type="text"
                  name="nome"
                  className="form-control"
                  value={form.nome}
                  onChange={handleFormChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">{t.lastName} *</label>
                <input
                  type="text"
                  name="cognome"
                  className="form-control"
                  value={form.cognome}
                  onChange={handleFormChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">{t.email} *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={form.email}
                  onChange={handleFormChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">{t.password} *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={form.password}
                  onChange={handleFormChange}
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">{t.role} *</label>
                <select
                  name="role"
                  className="form-select"
                  value={form.role}
                  onChange={handleFormChange}
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={creating}
                >
                  {creating ? t.creating : t.createUser}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 mb-0">{t.loadingUsers}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-0">{t.noUsersFound}</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>{t.firstName}</th>
                    <th>{t.email}</th>
                    <th>{t.role}</th>
                    <th>{t.language}</th>
                    <th>{t.theme}</th>
                    <th>{t.status}</th>
                    <th className="text-end">{t.actions}</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => {
                    const currentRole = user.roles?.[0] || "Operatore";

                    return (
                      <tr key={user.id}>
                        <td className="fw-semibold">
                          {user.nome} {user.cognome}
                        </td>

                        <td>{user.email}</td>

                        <td style={{ minWidth: "170px" }}>
                          <select
                            className="form-select form-select-sm"
                            value={currentRole}
                            disabled={savingId === user.id}
                            onChange={(event) =>
                              handleRoleChange(user.id, event.target.value)
                            }
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <span className="badge bg-secondary">
                            {user.preferredLanguage?.toUpperCase()}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              user.preferredTheme === "dark"
                                ? "bg-dark"
                                : "bg-light text-dark border"
                            }`}
                          >
                            {user.preferredTheme}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`badge ${
                              user.attivo ? "bg-success" : "bg-danger"
                            }`}
                          >
                            {user.attivo ? t.active : t.disabledUser}
                          </span>
                        </td>

                        <td className="text-end">
                          <button
                            className={`btn btn-sm ${
                              user.attivo
                                ? "btn-outline-danger"
                                : "btn-outline-success"
                            }`}
                            disabled={savingId === user.id}
                            onClick={() =>
                              handleActiveChange(user.id, !user.attivo)
                            }
                          >
                            {savingId === user.id
                              ? t.saving
                              : user.attivo
                              ? t.disable
                              : t.reactivate}
                          </button>
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

export default UsersPage;