import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <div className="layout">
      <nav className="nav">
        <strong>RetailHub</strong>
        <Link to="/products">Productos</Link>
        <Link to="/inventory">Inventario</Link>
        <Link to="/orders">Órdenes</Link>
        <span className="spacer" />
        <span>{user?.name} ({user?.role})</span>
        <button onClick={logout}>Salir</button>
      </nav>
      <main>{children}</main>
    </div>
  );
}
