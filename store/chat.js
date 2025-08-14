import { create } from "zustand";

export const useChatStore = create((set) => ({
  activeWaId: null,
  setActiveWaId: (waId) => set({ activeWaId: waId }),
  search: "",
  setSearch: (q) => set({ search: q }),
}));
