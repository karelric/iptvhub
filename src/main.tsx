import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			gcTime: 1000 * 60 * 60 * 24, // 24 hours
		},
	},
});

const persister = createSyncStoragePersister({
	storage: window.localStorage,
	key: "iptv-query-cache",
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
				<TooltipProvider>
					<App />
					<Toaster />
				</TooltipProvider>
			</PersistQueryClientProvider>
		</BrowserRouter>
	</StrictMode>,
);
