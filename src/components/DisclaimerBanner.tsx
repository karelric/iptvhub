import { Button } from "@/components/ui/button";
import { useState } from "react";

const STORAGE_KEY = "iptv-disclaimer-accepted";

const TEXT =
	"This app is a neutral tool for playing M3U streams. It does not host, distribute, or endorse " +
	"any content. Each user is solely responsible for ensuring they have the right to access the " +
	"streams they configure. The developers accept no liability for unauthorized use, copyright " +
	"infringement, or access to restricted content.";

interface DisclaimerTextProps {
	className?: string;
}

export function DisclaimerText({ className }: DisclaimerTextProps) {
	return (
		<p className={className}>
			<strong className="font-medium">Disclaimer:</strong> {TEXT}
		</p>
	);
}

export function DisclaimerBanner() {
	const [accepted, setAccepted] = useState(() => localStorage.getItem(STORAGE_KEY) === "true");

	if (accepted) return null;

	const accept = () => {
		localStorage.setItem(STORAGE_KEY, "true");
		setAccepted(true);
	};

	return (
		<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center p-4">
			<div className="w-full max-w-2xl rounded-xl border bg-card shadow-lg px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
				<DisclaimerText className="flex-1 text-xs text-muted-foreground leading-relaxed" />
				<Button size="sm" className="shrink-0" onClick={accept}>
					I Accept
				</Button>
			</div>
		</div>
	);
}
