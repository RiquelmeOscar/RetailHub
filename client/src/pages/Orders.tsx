import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api("/orders").then(setOrders).finally(() => setLoading(false)); }, []);
  return (
    <div>
      <h2>Órdenes</h2>
      <Link to="/orders/new"><button>Nueva orden</button></Link>
      {loading && <p className="empty">Cargando…</p>}
      {!loading && orders.length === 0 && <p className="empty">No hay órdenes todavía.</p>}
      <table>
        <thead><tr><th>ID</th><th>Estado</th><th>Total</th><th>Usuario</th><th>Fecha</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td><Link to={`/orders/${o.id}`}>{o.id.slice(0, 8)}</Link></td>
              <td>{o.status}</td><td>${Number(o.total).toFixed(2)}</td><td>{o.user?.name}</td><td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
