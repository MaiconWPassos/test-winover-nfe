import { create } from 'zustand';

/** Estado de UI global (sem persistência — sessão do browser). */
type UiState = {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
	toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
	sidebarOpen: true,
	setSidebarOpen: (open) => set({ sidebarOpen: open }),
	toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
