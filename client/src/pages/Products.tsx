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

  async function load() {
    setProducts(await api(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`));
  }
  useEffect(() => { load(); }, [search]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await api(`/products/${editingId}`, { method: "PATCH", body: JSON.stringify(form) });
      else await api("/products", { method: "POST", body: JSON.stringify(form) });
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Productos</h2>
      <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
      {user?.role === "admin" && (
        <form onSubmit={save} className="card">
          <h3>{editingId ? "Editar" : "Nuevo"} producto</h3>
          <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          <input placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input type="number" step="0.01" placeholder="Precio" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          {error && <p className="error">{error}</p>}
          <button>Guardar</button>
        </form>
      )}
    </div>
  );
}
