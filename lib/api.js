const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request(path, init = {}) {
  let headers = { "Content-Type": "application/json", ...(init.headers || {}) };
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("rq-token");
      if (token) headers = { ...headers, Authorization: `Bearer ${token}` };
    }
  } catch {}
  const res = await fetch(`${BASE_URL}${path}`, { headers, ...init });
  if (!res.ok) {
    let detail = null;
    try { detail = await res.json(); } catch {}
    const err = new Error(`Request failed: ${res.status}`);
    err.detail = detail;
    throw err;
  }
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return text; }
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
};
