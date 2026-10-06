import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const empty = { sku: "", name: "", category: "", price: 0, stock: 0 };

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setProducts(await api(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [search]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (editingId) await api(`/products/${editingId}`, { method: "PATCH", body: JSON.stringify(form) });
      else await api("/products", { method: "POST", body: JSON.stringify(form) });
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2>Productos</h2>
      <label htmlFor="product-search">Buscar</label>
      <input id="product-search" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <table>
        <thead><tr><th>SKU</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th>{user?.role === "admin" && <th></th>}</tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.sku}</td><td>{p.name}</td><td>{p.category}</td><td>${Number(p.price).toFixed(2)}</td><td>{p.stock}</td>
              {user?.role === "admin" && <td><button onClick={() => { setForm({ sku: p.sku, name: p.name, category: p.category, price: Number(p.price), stock: p.stock }); setEditingId(p.id); }}>Editar</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
      {loading && <p className="empty">Cargando…</p>}
      {!loading && products.length === 0 && <p className="empty">No hay productos todavía.</p>}
      {user?.role === "admin" && (
        <form onSubmit={save} className="card">
          <h3>{editingId ? "Editar" : "Nuevo"} producto</h3>
          <label htmlFor="product-sku">SKU</label>
          <input id="product-sku" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <label htmlFor="product-name">Nombre</label>
          <input id="product-name" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label htmlFor="product-category">Categoría</label>
          <input id="product-category" placeholder="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <label htmlFor="product-price">Precio</label>
          <input id="product-price" type="number" step="0.01" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <label htmlFor="product-stock">Stock</label>
          <input id="product-stock" type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          {error && <p className="error" role="alert">{error}</p>}
          <button disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
        </form>
      )}
    </div>
  );
}
