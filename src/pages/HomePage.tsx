import { ChannelTile, ChannelTileSkeleton } from "@/components/ChannelTile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useChannels, type Channel } from "@/hooks/useChannels";
import { useFavorites } from "@/hooks/useFavorites";
import { useM3uUrls } from "@/hooks/useM3uUrls";
import { useVirtualizer } from "@tanstack/react-virtual";
import { PictureInPicture2, RefreshCw, Settings, Tv2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Filter = "all" | "favorites";

export function HomePage() {
	const navigate = useNavigate();
	const { urls, activeUrls } = useM3uUrls();
	const { channels, isLoading, isFetching, isError, refetchAll } = useChannels(activeUrls);
	const { favorites, toggle } = useFavorites();

	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<Filter>("all");
	const [selected, setSelected] = useState<Channel | null>(null);

	const scrollRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const [pipSupported, setPipSupported] = useState(false);

	type WebkitVideo = HTMLVideoElement & {
		webkitSupportsPresentationMode?: (mode: string) => boolean;
		webkitSetPresentationMode?: (mode: string) => void;
	};

	// Detect PiP support (standard + webkit prefix for iOS 17+)
	useEffect(() => {
		const video = videoRef.current as WebkitVideo | null;
		if (!video) return;
		const standard = !!document.pictureInPictureEnabled;
		const webkit =
			typeof video.webkitSupportsPresentationMode === "function" &&
			video.webkitSupportsPresentationMode("picture-in-picture");
		setPipSupported(standard || webkit);
	}, [selected]);

	const enterPiP = async () => {
		const video = videoRef.current as WebkitVideo | null;
		if (!video) return;
		try {
			if (document.pictureInPictureEnabled) {
				await (video as HTMLVideoElement).requestPictureInPicture();
			} else {
				video.webkitSetPresentationMode?.("picture-in-picture");
			}
		} catch {
			// ignore — user or browser denied
		}
	};

	// iOS Safari exits fullscreen and pauses the video — resume automatically
	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		const resume = () => video.play().catch(() => {});
		video.addEventListener("webkitendfullscreen", resume);
		return () => video.removeEventListener("webkitendfullscreen", resume);
	}, [selected]);

	const filtered = useMemo(() => {
		let list = channels;
		if (filter === "favorites") {
			list = list.filter((ch) => ch.url && favorites.has(ch.url));
		}
		if (search.trim()) {
			const q = search.toLowerCase();
			list = list.filter((ch) => ch.name?.toLowerCase().includes(q));
		}
		return [...list].sort((a, b) => {
			const aName = a.name?.trim() ?? "";
			const bName = b.name?.trim() ?? "";
			if (!aName && !bName) return 0;
			if (!aName) return 1;
			if (!bName) return -1;
			return aName.localeCompare(bName, undefined, { sensitivity: "base" });
		});
	}, [channels, filter, search, favorites]);

	const virtualizer = useVirtualizer({
		count: filtered.length,
		getScrollElement: () => scrollRef.current,
		estimateSize: () => 58, // tile py-2 (8+8) + h-10 (40) + gap-0.5 (2)
		overscan: 5,
		paddingStart: 8,
		paddingEnd: 8,
	});

	return (
		<div className="flex flex-col h-full">
			<div className="flex flex-col md:flex-row flex-1 min-h-0">
				{/* Sidebar */}
				<aside className="order-2 md:order-1 flex flex-col flex-1 min-h-0 border-t md:border-t-0 md:border-r md:flex-none md:w-80">
					<div className="flex flex-col gap-2 p-3 border-b">
						<div className="flex gap-2">
							<div className="relative flex-1">
								<Input
									placeholder="Search channels…"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className={search ? "pr-8" : ""}
								/>
								{search && (
									<button
										type="button"
										onClick={() => setSearch("")}
										className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
										aria-label="Clear search"
									>
										<X className="w-3.5 h-3.5" />
									</button>
								)}
							</div>
							<Tooltip>
								<TooltipTrigger
									render={
										<Button
											variant="ghost"
											size="icon"
											className="shrink-0"
											onClick={() => refetchAll()}
											disabled={isFetching}
											aria-label="Refresh channels"
										/>
									}
								>
									<RefreshCw
										className={`w-4 h-4 transition-transform ${isFetching ? "animate-spin" : ""}`}
									/>
								</TooltipTrigger>
								<TooltipContent side="bottom">Refresh channels</TooltipContent>
							</Tooltip>
						</div>
						<Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
							<TabsList className="w-full">
								<TabsTrigger value="all" className="flex-1">
									All
								</TabsTrigger>
								<TabsTrigger value="favorites" className="flex-1">
									Favorites
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>

					{/* Channel count status */}
					{!isLoading && (
						<div className="px-3 py-1.5 border-b shrink-0">
							<p className="text-xs text-muted-foreground">
								{filtered.length === channels.length
									? `${channels.length} channels`
									: `${filtered.length} of ${channels.length} channels`}
							</p>
						</div>
					)}

					<div
						ref={scrollRef}
						className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20"
					>
						{urls.length === 0 && (
							<div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
								<p className="text-sm font-medium">No M3U playlists configured</p>
								<p className="text-xs text-muted-foreground">
									Add at least one M3U URL in Settings to start watching channels.
								</p>
								<Button
									size="sm"
									variant="secondary"
									className="mt-1"
									onClick={() => navigate("/settings")}
								>
									<Settings className="w-3.5 h-3.5 mr-1" />
									Go to Settings
								</Button>
							</div>
						)}
						{isLoading && (
							<div className="p-2 flex flex-col gap-0.5">
								{Array.from({ length: 12 }).map((_, i) => (
									<ChannelTileSkeleton key={i} />
								))}
							</div>
						)}
						{isError && urls.length > 0 && (
							<p className="text-sm text-destructive px-2 py-4 text-center">
								Failed to load channels.
							</p>
						)}
						{!isLoading && !isError && filtered.length === 0 && urls.length > 0 && (
							<p className="text-sm text-muted-foreground px-2 py-4 text-center">
								No channels found.
							</p>
						)}
						{!isLoading && !isError && filtered.length > 0 && (
							<div
								style={{
									height: virtualizer.getTotalSize(),
									width: "100%",
									position: "relative",
								}}
							>
								{virtualizer.getVirtualItems().map((vItem) => {
									const ch = filtered[vItem.index];
									return (
										<div
											key={ch._key}
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: `${vItem.size}px`,
												transform: `translateY(${vItem.start}px)`,
												paddingLeft: 8,
												paddingRight: 8,
												paddingBottom: 2,
											}}
										>
											<ChannelTile
												channel={ch}
												isSelected={selected?._key === ch._key}
												isFavorite={!!ch.url && favorites.has(ch.url)}
												onSelect={setSelected}
												onToggleFavorite={toggle}
											/>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</aside>

				{/* Player */}
				<main className="order-1 md:order-2 relative flex flex-col items-center justify-center bg-zinc-950 w-full aspect-video md:aspect-auto md:flex-1 md:min-w-0">
					{selected?.url ? (
						<>
							<video
								ref={videoRef}
								key={selected.url}
								src={selected.url}
								controls
								autoPlay
								playsInline
								className="w-full h-full object-contain"
							/>
							{pipSupported && (
								<Tooltip>
									<TooltipTrigger
										render={
											<Button
												variant="ghost"
												size="icon"
												className="absolute top-2 right-2 text-white/60 hover:text-white hover:bg-white/10"
												onClick={enterPiP}
												aria-label="Picture in Picture"
											/>
										}
									>
										<PictureInPicture2 className="w-4 h-4" />
									</TooltipTrigger>
									<TooltipContent side="bottom">
										Picture in Picture
									</TooltipContent>
								</Tooltip>
							)}
						</>
					) : (
						<div className="flex flex-col items-center gap-3 text-white/30">
							<Tv2 className="w-16 h-16" />
							<p className="text-sm">Select a channel to start watching</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
