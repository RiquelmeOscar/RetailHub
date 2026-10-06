import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  async function load() {
    setProducts(await api("/products"));
    setMovements(await api("/inventory/movements"));
  }
  useEffect(() => { load(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("/inventory/movements", { method: "POST", body: JSON.stringify({ productId, type, quantity }) });
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Inventario</h2>
      <table>
        <thead><tr><th>SKU</th><th>Nombre</th><th>Stock</th></tr></thead>
        <tbody>{products.map((p) => <tr key={p.id}><td>{p.sku}</td><td>{p.name}</td><td>{p.stock}</td></tr>)}</tbody>
      </table>
      <form onSubmit={submit} className="card">
        <h3>Movimiento</h3>
        <select value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Producto...</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as any)}>
          <option value="IN">Entrada</option>
          <option value="OUT">Salida</option>
        </select>
        <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        {error && <p className="error">{error}</p>}
        <button>Registrar</button>
      </form>
      <h3>Movimientos</h3>
      <table>
        <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Usuario</th></tr></thead>
        <tbody>{movements.map((m) => <tr key={m.id}><td>{new Date(m.createdAt).toLocaleString()}</td><td>{m.product.name}</td><td>{m.type}</td><td>{m.quantity}</td><td>{m.user.name}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
