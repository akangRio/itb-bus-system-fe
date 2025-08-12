import { create } from "zustand";

type PhotoStore = {
  uris: string[];
  addUri: (uri: string) => void;
  removeUri: (uri: string) => void;
  clearUris: () => void;
};

export const usePhotoStore = create<PhotoStore>((set) => ({
  uris: [],
  addUri: (uri) =>
    set((state) => ({
      uris: [...state.uris, uri],
    })),
  removeUri: (uri) =>
    set((state) => ({
      uris: state.uris.filter((u) => u !== uri),
    })),
  clearUris: () => set({ uris: [] }),
}));
