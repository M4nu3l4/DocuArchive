import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ConfirmModal from "../components/ConfirmModal";
import { useTranslation } from "../context/useTranslation";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../services/documentService";

const initialForm = {
  nome: "",
  attiva: true,
};

function CategoriesPage() {
  const { t } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async (searchValue = "") => {
    try {
      setLoading(true);

      const data = await getCategories(
        searchValue ? { search: searchValue } : {}
      );

      setCategories(data);
    } catch (error) {
      console.error(error);
      toast.error("Errore caricamento categorie");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingCategory(null);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    await loadCategories(search.trim());
  };

  const handleResetSearch = async () => {
    setSearch("");
    await loadCategories();
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (category) => {
    setEditingCategory(category);

    setForm({
      nome: category.nome || "",
      attiva: category.attiva,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nome.trim()) {
      toast.error("Il nome categoria è obbligatorio");
      return;
    }

    try {
      setSaving(true);

      if (editingCategory) {
        await updateCategory(editingCategory.id, form);
        toast.success("Categoria aggiornata correttamente");
      } else {
        await createCategory({
          nome: form.nome,
        });
        toast.success("Categoria creata correttamente");
      }

      resetForm();
      await loadCategories(search.trim());
    } catch (error) {
      console.error(error);
      toast.error("Errore durante il salvataggio della categoria");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);

      await deleteCategory(categoryToDelete.id);

      toast.success("Operazione completata correttamente");
      setCategoryToDelete(null);

      await loadCategories(search.trim());
    } catch (error) {
      console.error(error);
      toast.error("Errore durante l'eliminazione della categoria");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="app-page">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">{t.categoriesTitle}</h1>
        <p className="text-muted mb-0">{t.categoriesSubtitle}</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                {editingCategory ? t.editCategory : t.newCategory}
              </h5>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">{t.categoryName} *</label>

                  <input
                    type="text"
                    name="nome"
                    className="form-control"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder={t.categoryPlaceholder}
                  />
                </div>

                {editingCategory && (
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="attiva"
                      checked={form.attiva}
                      onChange={handleChange}
                      id="categoryActiveSwitch"
                    />

                    <label
                      className="form-check-label"
                      htmlFor="categoryActiveSwitch"
                    >
                      {t.categoryActive}
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
                      ? t.saving
                      : editingCategory
                      ? t.saveChanges
                      : t.createCategory}
                  </button>

                  {editingCategory && (
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
              <form className="row g-2" onSubmit={handleSearch}>
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t.searchCategoryPlaceholder}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="col-md-2 d-grid">
                  <button type="submit" className="btn btn-primary">
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
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-5">
                  <p className="mb-0">{t.noCategoriesFound}</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>{t.categoryName}</th>
                        <th>{t.status}</th>
                        <th className="text-end">{t.actions}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="fw-semibold">{category.nome}</td>

                          <td>
                            <span
                              className={`badge ${
                                category.attiva ? "bg-success" : "bg-secondary"
                              }`}
                            >
                              {category.attiva ? t.active : t.inactive}
                            </span>
                          </td>

                          <td className="text-end">
                            <button
                              className="btn btn-sm btn-outline-warning me-2"
                              onClick={() => handleEdit(category)}
                            >
                              {t.edit}
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              data-bs-toggle="modal"
                              data-bs-target="#deleteCategoryModal"
                              onClick={() => setCategoryToDelete(category)}
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
        modalId="deleteCategoryModal"
        title={t.deleteCategoryConfirmTitle}
        message={
          categoryToDelete
            ? `${t.deleteCategoryConfirmMessage} "${categoryToDelete.nome}"?`
            : `${t.deleteCategoryConfirmMessage}?`
        }
        confirmText={t.delete}
        cancelText={t.cancel}
        confirmButtonClass="btn-danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default CategoriesPage;