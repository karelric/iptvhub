import { APP_NAME } from "@/constants";
import { ArrowLeft, Settings, Tv2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function AppHeader() {
	const { pathname } = useLocation();

	return (
		<header className="flex items-center gap-3 px-4 h-14 border-b shrink-0">
			<Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
				<Tv2 className="w-6 h-6 text-primary" />
				<span className="font-semibold text-lg tracking-tight">{APP_NAME}</span>
			</Link>
			<div className="ml-auto">
				{pathname === "/settings" ? (
					<Link
						to="/"
						className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						Back
					</Link>
				) : (
					<Link
						to="/settings"
						className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						<Settings className="w-4 h-4" />
						Settings
					</Link>
				)}
			</div>
		</header>
	);
}
