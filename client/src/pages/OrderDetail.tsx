import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => api(`/orders/${id}`).then(setOrder), [id]);
  useEffect(() => { load(); }, [load]);

  async function act(action: "confirm" | "cancel") {
    setError("");
    try {
      setOrder(await api(`/orders/${id}/${action}`, { method: "POST" }));
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!order) return null;
  return (
    <div>
      <h2>Orden {order.id.slice(0, 8)} — {order.status}</h2>
      <p>Total: ${Number(order.total).toFixed(2)} | Usuario: {order.user?.name}</p>
      <table>
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th></tr></thead>
        <tbody>{order.items.map((it: any) => <tr key={it.id}><td>{it.product.name}</td><td>{it.quantity}</td><td>${Number(it.unitPrice).toFixed(2)}</td></tr>)}</tbody>
      </table>
      {error && <p className="error" role="alert">{error}</p>}
      {order.status === "PENDING" && (
        <>
          <button onClick={() => act("confirm")}>Confirmar</button>
          <button onClick={() => act("cancel")}>Cancelar</button>
        </>
      )}
      {order.status === "CONFIRMED" && <button onClick={() => act("cancel")}>Cancelar (repone stock)</button>}
    </div>
  );
}
