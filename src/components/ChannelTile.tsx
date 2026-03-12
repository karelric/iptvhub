import { Skeleton } from "@/components/ui/skeleton";
import { type Channel } from "@/hooks/useChannels";
import { cn } from "@/lib/utils";
import { Heart, Tv } from "lucide-react";

interface ChannelTileProps {
	channel: Channel;
	isSelected: boolean;
	isFavorite: boolean;
	onSelect: (channel: Channel) => void;
	onToggleFavorite: (url: string) => void;
}

export function ChannelTile({
	channel,
	isSelected,
	isFavorite,
	onSelect,
	onToggleFavorite,
}: ChannelTileProps) {
	return (
		<div
			className={cn(
				"group flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition-colors",
				isSelected
					? "bg-primary text-primary-foreground"
					: "hover:bg-accent hover:text-accent-foreground",
			)}
			onClick={() => onSelect(channel)}
		>
			{/* Logo */}
			<div className="shrink-0 w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
				{channel.tvgLogo ? (
					<img
						alt={channel.name ?? ""}
						src={channel.tvgLogo}
						className="w-full h-full object-contain"
						onError={(e) => {
							(e.currentTarget as HTMLImageElement).style.display = "none";
						}}
					/>
				) : (
					<Tv className="w-5 h-5 text-muted-foreground" />
				)}
			</div>

			{/* Name + URL */}
			<div className="flex-1 min-w-0">
				<p className="text-sm font-medium truncate">{channel.name ?? "Unnamed"}</p>
				<p
					className={cn(
						"text-xs truncate",
						isSelected ? "text-primary-foreground/70" : "text-muted-foreground",
						{ italic: !channel.groupTitle || channel.groupTitle === "Undefined" },
					)}
				>
					{channel.groupTitle || "Undefined"}
				</p>
			</div>

			{/* Heart */}
			<button
				type="button"
				aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
				className={cn(
					"shrink-0 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100",
					isFavorite && "opacity-100",
					isSelected ? "hover:bg-primary-foreground/20" : "hover:bg-muted-foreground/20",
				)}
				onClick={(e) => {
					e.stopPropagation();
					if (channel.url) onToggleFavorite(channel.url);
				}}
			>
				<Heart
					className={cn(
						"w-4 h-4 transition-colors",
						isFavorite
							? isSelected
								? "fill-primary-foreground text-primary-foreground"
								: "fill-red-500 text-red-500"
							: isSelected
								? "text-primary-foreground/70"
								: "text-muted-foreground",
					)}
				/>
			</button>
		</div>
	);
}

export function ChannelTileSkeleton() {
	return (
		<div className="flex items-center gap-3 rounded-lg px-3 py-2">
			<Skeleton className="shrink-0 w-10 h-10 rounded-md" />
			<div className="flex-1 min-w-0 flex flex-col gap-1.5">
				<Skeleton className="h-3.5 w-3/4 rounded" />
				<Skeleton className="h-3 w-1/2 rounded" />
			</div>
			<Skeleton className="shrink-0 w-6 h-6 rounded" />
		</div>
	);
}
