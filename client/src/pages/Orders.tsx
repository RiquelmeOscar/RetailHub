import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { api("/orders").then(setOrders); }, []);
  return (
    <div>
      <h2>Órdenes</h2>
      <Link to="/orders/new"><button>Nueva orden</button></Link>
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
