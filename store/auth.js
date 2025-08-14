import { create } from "zustand";

export const useAuthStore = create((set, get) => ({
  token: null,
  user: null,
  setToken: (token) => {
    set({ token });
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("rq-token", token);
      else localStorage.removeItem("rq-token");
    }
  },
  setUser: (user) => set({ user }),
  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("rq-token");
    if (token) set({ token });
  },
  logout: () => {
    set({ token: null, user: null });
    if (typeof window !== "undefined") localStorage.removeItem("rq-token");
  },
}));


