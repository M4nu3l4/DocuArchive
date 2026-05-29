import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      toast.error("Email e password sono obbligatorie");
      return;
    }

    try {
      setLoading(true);

      await loginUser(form);

      toast.success("Login effettuato correttamente");
      navigate("/documents");
    } catch (error) {
      console.error(error);
      toast.error("Email o password non validi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card card shadow-lg border-0">
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <div className="login-logo mb-3">
              <i className="bi bi-folder2-open"></i>
            </div>

            <h1 className="fw-bold mb-1">DocuArchive</h1>

            <p className="text-muted mb-0">
              Accedi con le credenziali fornite dall’amministratore.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email</label>

              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
                placeholder="Inserisci la tua email"
                autoComplete="email"
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>

              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="Inserisci la tua password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;