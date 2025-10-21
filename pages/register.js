import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        await signIn("credentials", {
          redirect: true,
          email,
          password,
          callbackUrl: "/",
        });
        return;
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Registration failed");
      }
    } catch (_e) {
      setError("Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>
          Name (optional)
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ display: "block", width: "100%", marginTop: 4 }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 8 }}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: "block", width: "100%", marginTop: 4 }}
          />
        </label>
        <label style={{ display: "block", marginBottom: 8 }}>
          Password
          <input
            type="password"
            value={password}
            minLength={8}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ display: "block", width: "100%", marginTop: 4 }}
          />
        </label>
        {error ? <p style={{ color: "red" }}>{error}</p> : null}
        <button type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>
      <p style={{ marginTop: 12 }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </main>
  );
}
