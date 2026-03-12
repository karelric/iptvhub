import { isLocalEntry, readLocalFile } from "@/lib/localM3u";
import { parseM3U, type M3uChannel } from "@iptv/playlist";
import { useIsRestoring, useQueries, useQueryClient } from "@tanstack/react-query";

export interface Channel extends M3uChannel {
	/** Globally unique key across multiple M3U sources: "{sourceIndex}-{channelIndex}" */
	_key: string;
}

async function fetchChannels(url: string): Promise<M3uChannel[]> {
	if (isLocalEntry(url)) {
		const content = await readLocalFile(url);
		if (!content) throw new Error(`Local file not found: ${url}`);
		return parseM3U(content).channels;
	}
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
	const text = await res.text();
	return parseM3U(text).channels;
}

export function useChannels(urls: string[]) {
	const queryClient = useQueryClient();
	const isRestoring = useIsRestoring();
	const results = useQueries({
		queries: urls.map((url) => ({
			queryKey: ["channels", url],
			queryFn: () => fetchChannels(url),
			staleTime: Infinity, // never refetch automatically
		})),
	});

	const isLoading = isRestoring || results.some((r) => r.isLoading);
	const isFetching = !isRestoring && results.some((r) => r.isFetching);
	const isError = results.every((r) => r.isError);

	const channels: Channel[] = results.flatMap((result, sourceIndex) =>
		(result.data ?? []).map((ch, channelIndex) => ({
			...ch,
			_key: `${sourceIndex}-${channelIndex}`,
		})),
	);

	const refetchAll = () =>
		queryClient.invalidateQueries({ queryKey: ["channels"], refetchType: "all" });

	return { channels, isLoading, isFetching, isError, refetchAll };
}
