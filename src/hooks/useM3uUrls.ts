import { useState } from "react";

const STORAGE_KEY = "iptv-m3u-urls";
const DISABLED_KEY = "iptv-disabled-urls";

function readUrls(): string[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown;
		if (Array.isArray(parsed) && parsed.every((u) => typeof u === "string")) {
			return parsed;
		}
	} catch {
		// ignore
	}
	return [];
}

function readDisabled(): Set<string> {
	try {
		const raw = localStorage.getItem(DISABLED_KEY);
		if (!raw) return new Set();
		const parsed = JSON.parse(raw) as unknown;
		if (Array.isArray(parsed) && parsed.every((u) => typeof u === "string")) {
			return new Set(parsed);
		}
	} catch {
		// ignore
	}
	return new Set();
}

export function useM3uUrls() {
	const [urls, setUrlsState] = useState<string[]>(readUrls);
	const [disabledUrls, setDisabledState] = useState<Set<string>>(readDisabled);

	const setUrls = (next: string[]) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
		setUrlsState(next);
	};

	const toggleDisabled = (url: string) => {
		const next = new Set(disabledUrls);
		if (next.has(url)) {
			next.delete(url);
		} else {
			next.add(url);
		}
		localStorage.setItem(DISABLED_KEY, JSON.stringify([...next]));
		setDisabledState(next);
	};

	// Also clean up disabled entries when a URL is removed
	const setUrlsAndCleanDisabled = (next: string[]) => {
		const removed = urls.filter((u) => !next.includes(u));
		if (removed.length > 0) {
			const nextDisabled = new Set(disabledUrls);
			removed.forEach((u) => nextDisabled.delete(u));
			localStorage.setItem(DISABLED_KEY, JSON.stringify([...nextDisabled]));
			setDisabledState(nextDisabled);
		}
		setUrls(next);
	};

	const activeUrls = urls.filter((u) => !disabledUrls.has(u));

	return { urls, setUrls: setUrlsAndCleanDisabled, activeUrls, disabledUrls, toggleDisabled };
}
