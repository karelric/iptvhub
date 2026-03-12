import { type M3uChannel } from "@iptv/playlist";

interface ChannelTileProps {
	channel: M3uChannel;
	onClick: (channel: M3uChannel) => void;
}

export function ChannelTile({ channel, onClick }: ChannelTileProps) {
	return (
		<button
			type="button"
			className="flex items-center gap-4 bg-gray-200 p-2 rounded-lg hover:bg-gray-300 cursor-pointer"
			onClick={() => onClick(channel)}
		>
			<div className="w-16 h-16 max-w-16 rounded overflow-hidden bg-neutral-100">
				{channel.tvgLogo && (
					<img
						alt={channel.name}
						src={channel.tvgLogo}
						className="w-full h-full object-center object-contain"
					/>
				)}
			</div>

			<div className="flex-1 flex flex-col items-start truncate">
				<h3 className="font-medium">{channel.name}</h3>

				<p className="text-xs text-foreground/60 truncate">{channel.urls}</p>
			</div>
		</button>
	);
}
