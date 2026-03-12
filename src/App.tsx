import { AppHeader } from "@/components/AppHeader";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { HomePage } from "@/pages/HomePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { Route, Routes } from "react-router-dom";

export default function App() {
	return (
		<div className="flex flex-col h-screen bg-background">
			<AppHeader />
			<div className="flex-1 min-h-0">
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/settings" element={<SettingsPage />} />
				</Routes>
			</div>
			<DisclaimerBanner />
		</div>
	);
}
