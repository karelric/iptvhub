import { useState } from "react";

const STORAGE_KEY = "iptv-favorites";

function readFavorites(): Set<string> {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
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

export function useFavorites() {
	const [favorites, setFavoritesState] = useState<Set<string>>(readFavorites);

	const toggle = (url: string) => {
		setFavoritesState((prev) => {
			const next = new Set(prev);
			if (next.has(url)) {
				next.delete(url);
			} else {
				next.add(url);
			}
			localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
			return next;
		});
	};

	return { favorites, toggle };
}
