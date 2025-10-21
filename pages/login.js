import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.ok) {
      router.push("/");
    } else {
      setError(res?.error || "Invalid credentials");
    }
  }

  return (
    <main className="page-wrap">
      <div className="page-container">
        <div className="lux-card">
          <h1 className="section-title mb-4">Login</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-3">
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button type="submit" className="btn btn-gold w-full mt-4">
              Sign In
            </button>
          </form>
          <div className="hairline mt-4 mb-3"></div>
          <a href="/register" className="btn btn-ghost w-full">
            Don't have an account? Register
          </a>
        </div>
      </div>
    </main>
  );
}
