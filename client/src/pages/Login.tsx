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
      <label htmlFor="login-email">Email</label>
      <input id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="username" />
      <label htmlFor="login-password">Password</label>
      <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="current-password" />
      {error && <p className="error" role="alert">{error}</p>}
      <button>Ingresar</button>
    </form>
  );
}
