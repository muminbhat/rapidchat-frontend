"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function SignupPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    useAuthStore.getState().loadFromStorage();
    const t = useAuthStore.getState().token;
    if (t) router.replace("/");
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { username, password, email: email || null });
      setToken(res?.accessToken || null);
      router.replace("/");
    } catch (e) {
      setError(e?.detail?.error?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm border rounded-lg p-6 space-y-4">
        <h1 className="text-lg font-semibold">Create account</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="space-y-2">
          <label className="text-sm">Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm">Email (optional)</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border px-3 py-2 text-sm" />
        </div>
        <button disabled={loading} className="w-full rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm">
          {loading ? "Creating…" : "Create account"}
        </button>
        <button type="button" onClick={() => router.push("/login")} className="w-full rounded-md border px-3 py-2 text-sm">
          Already have an account? Sign in
        </button>
      </form>
    </div>
  );
}


