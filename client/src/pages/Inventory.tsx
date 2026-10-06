import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setProducts(await api("/products"));
      setMovements(await api("/inventory/movements"));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/inventory/movements", { method: "POST", body: JSON.stringify({ productId, type, quantity }) });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2>Inventario</h2>
      <table>
        <thead><tr><th>SKU</th><th>Nombre</th><th>Stock</th></tr></thead>
        <tbody>{products.map((p) => <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.stock}</td></tr>)}</tbody>
      </table>
      {loading && <p className="empty">Cargando…</p>}
      {!loading && products.length === 0 && <p className="empty">No hay productos todavía.</p>}
      <form onSubmit={submit} className="card">
        <h3>Movimiento</h3>
        <label htmlFor="movement-product">Producto</label>
        <select id="movement-product" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Producto...</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <label htmlFor="movement-type">Tipo</label>
        <select id="movement-type" value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="IN">Entrada</option>
          <option value="OUT">Salida</option>
        </select>
        <label htmlFor="movement-quantity">Cantidad</label>
        <input id="movement-quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        {error && <p className="error" role="alert">{error}</p>}
        <button disabled={busy}>{busy ? "Registrando…" : "Registrar"}</button>
      </form>
      <h3>Movimientos</h3>
      {!loading && movements.length === 0 && <p className="empty">No hay movimientos todavía.</p>}
      <table>
        <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Usuario</th></tr></thead>
        <tbody>{movements.map((m) => <tr key={m.id}><td>{new Date(m.createdAt).toLocaleString()}</td><td>{m.product.name}</td><td>{m.type}</td><td>{m.quantity}</td><td>{m.user.name}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
