import { DisclaimerText } from "@/components/DisclaimerBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useM3uUrls } from "@/hooks/useM3uUrls";
import { deleteLocalFile, getLocalDisplayName, isLocalEntry, saveLocalFile } from "@/lib/localM3u";
import { FileText, FolderOpen, Globe, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function SettingsPage() {
	const { urls, setUrls, disabledUrls, toggleDisabled } = useM3uUrls();
	const [draft, setDraft] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addUrl = () => {
		const trimmed = draft.trim();
		if (!trimmed) return;
		try {
			new URL(trimmed);
		} catch {
			toast.error("Invalid URL. Please enter a valid http(s) URL.");
			return;
		}
		if (urls.includes(trimmed)) {
			toast.error("This URL is already in the list.");
			return;
		}
		setUrls([...urls, trimmed]);
		setDraft("");
		toast.success("M3U URL added.");
	};

	const removeUrl = (url: string) => {
		if (isLocalEntry(url)) deleteLocalFile(url).catch(() => {});
		setUrls(urls.filter((u) => u !== url));
		toast.success("Playlist removed.");
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		// Reset input so the same file can be re-selected if needed
		e.target.value = "";
		if (!file) return;

		const reader = new FileReader();
		reader.onload = async (ev) => {
			const content = ev.target?.result;
			if (typeof content !== "string") return;
			try {
				const localUrl = await saveLocalFile(file.name, content);
				setUrls([...urls, localUrl]);
				toast.success(`"${file.name}" loaded.`);
			} catch {
				toast.error("Failed to save file. Storage may be unavailable.");
			}
		};
		reader.onerror = () => toast.error("Failed to read file.");
		reader.readAsText(file);
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-y-auto">
				<div className="max-w-2xl mx-auto p-4 md:p-6 flex flex-col gap-6">
					<div>
						<h1 className="text-2xl font-semibold">Settings</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Manage M3U playlists. All sources are merged when loading channels.
						</p>
					</div>

					<Separator />

					<section className="flex flex-col gap-4">
						<h2 className="text-base font-medium">Playlists</h2>

						{urls.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No playlists configured. Add a URL or load a local file below.
							</p>
						) : (
							<ul className="flex flex-col gap-2">
								{urls.map((url) => (
									<li
										key={url}
										className={`flex items-center gap-2 rounded-lg border px-3 py-2 bg-card transition-opacity ${disabledUrls.has(url) ? "opacity-50" : ""}`}
									>
										{isLocalEntry(url) ? (
											<FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
										) : (
											<Globe className="w-4 h-4 shrink-0 text-muted-foreground" />
										)}
										<span className="flex-1 text-sm truncate text-card-foreground">
											{isLocalEntry(url) ? getLocalDisplayName(url) : url}
										</span>
										<Switch
											checked={!disabledUrls.has(url)}
											onCheckedChange={() => toggleDisabled(url)}
											aria-label={
												disabledUrls.has(url)
													? "Enable source"
													: "Disable source"
											}
										/>
										<Button
											variant="ghost"
											size="icon"
											className="shrink-0 text-muted-foreground hover:text-destructive"
											onClick={() => removeUrl(url)}
											aria-label="Remove playlist"
										>
											<Trash2 className="w-4 h-4" />
										</Button>
									</li>
								))}
							</ul>
						)}

						{/* Add URL */}
						<div>
							<p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
								<Globe className="w-3.5 h-3.5" />
								Add remote URL
							</p>
							<div className="flex gap-2">
								<Input
									placeholder="https://example.com/playlist.m3u"
									value={draft}
									onChange={(e) => setDraft(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") addUrl();
									}}
								/>
								<Button onClick={addUrl} className="shrink-0">
									<Plus className="w-4 h-4 mr-1" />
									Add
								</Button>
							</div>
						</div>

						{/* Load from file */}
						<div>
							<p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
								<FileText className="w-3.5 h-3.5" />
								Load local file
							</p>
							<input
								ref={fileInputRef}
								type="file"
								accept=".m3u,.m3u8,audio/x-mpegurl,application/x-mpegurl"
								className="hidden"
								onChange={handleFileChange}
							/>
							<Button
								variant="secondary"
								onClick={() => fileInputRef.current?.click()}
							>
								<FolderOpen className="w-4 h-4 mr-1.5" />
								Choose .m3u file…
							</Button>
						</div>
					</section>
				</div>
			</div>

			{/* Disclaimer */}
			<div className="border-t px-4 py-3">
				<DisclaimerText className="text-xs text-muted-foreground/70 text-center max-w-2xl mx-auto leading-relaxed" />
			</div>
		</div>
	);
}
