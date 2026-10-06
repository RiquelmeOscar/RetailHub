import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function NewOrder() {
  const [products, setProducts] = useState<any[]>([]);
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { api("/products").then(setProducts); }, []);

  function add() {
    if (!productId || quantity < 1) return;
    setItems([...items, { productId, quantity }]);
    setProductId("");
    setQuantity(1);
  }

  async function submit() {
    setError("");
    setBusy(true);
    try {
      const order = await api("/orders", { method: "POST", body: JSON.stringify({ items }) });
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2>Nueva orden</h2>
      <div className="card">
        <label htmlFor="order-product">Producto</label>
        <select id="order-product" value={productId} onChange={(e) => setProductId(e.target.value)}>
          <option value="">Producto...</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} (stock {p.stock})</option>)}
        </select>
        <label htmlFor="order-quantity">Cantidad</label>
        <input id="order-quantity" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
        <button onClick={add}>Agregar</button>
      </div>
      {items.length === 0 && <p className="empty">Agregá productos para armar la orden.</p>}
      <table>
        <thead><tr><th>Producto</th><th>Cantidad</th></tr></thead>
        <tbody>{items.map((it, i) => <tr key={i}><td>{products.find((p) => p.id === it.productId)?.name}</td><td>{it.quantity}</td></tr>)}</tbody>
      </table>
      {error && <p className="error" role="alert">{error}</p>}
      <button disabled={items.length === 0 || busy} onClick={submit}>{busy ? "Creando…" : "Crear orden"}</button>
    </div>
  );
}
