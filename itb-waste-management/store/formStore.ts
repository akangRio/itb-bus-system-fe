import { create } from "zustand";

type ReportFormState = {
  weight: string;
  note: string;
  isTrashCorrect: boolean | null;
  setWeight: (value: string) => void;
  setNote: (value: string) => void;
  setIsTrashCorrect: (value: boolean | null) => void;
  resetForm: () => void;
};

export const useReportFormStore = create<ReportFormState>((set) => ({
  weight: "",
  note: "",
  isTrashCorrect: null,

  setWeight: (value) => set({ weight: value }),
  setNote: (value) => set({ note: value }),
  setIsTrashCorrect: (value) => set({ isTrashCorrect: value }),

  resetForm: () => set({ weight: "", note: "", isTrashCorrect: null }),
}));
