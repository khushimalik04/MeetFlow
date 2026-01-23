import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("MeetFlow-theme") || "night",
  setTheme: (theme) => {
    localStorage.setItem("MeetFlow-theme", theme);
    set({ theme });
  },
}));