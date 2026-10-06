import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@retailhub.dev");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form className="card" onSubmit={submit}>
      <h1>RetailHub</h1>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {error && <p className="error">{error}</p>}
      <button>Ingresar</button>
    </form>
  );
}
