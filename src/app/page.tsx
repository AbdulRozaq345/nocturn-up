"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Music2,
  Search,
  Home as HomeIcon,
  Library,
  Clock,
  Heart,
  Volume2,
  VolumeX,
  Trash2,
  RefreshCw,
  Download,
  SkipBack,
  SkipForward,
  Sparkles,
  ListMusic,
  Activity,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Disc3,
  ImagePlus,
  X,
  Link,
  Upload,
} from "lucide-react";

type Track = {
  id: number | string;
  trackTitle?: string;
  title?: string;
  artistName?: string;
  artist?: string;
  fileName?: string;
  file_name?: string;
  durationSeconds?: number;
  duration?: number;
  playlistCover?: string | null;
};

type TracksApiResponse = {
  status?: string;
  data?: unknown;
  tracks?: unknown;
};

type DownloadProgress = {
  current: number;
  total: number;
  title?: string;
  phase: string;
};

type DoneEventPayload = {
  status?: string;
  total?: number;
  downloaded?: number;
  skipped?: number;
  failed?: number;
  data?: unknown[];
  error?: string;
};

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // <-- Tambahin state ini
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isFetchingTracks, setIsFetchingTracks] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [playlistInfo, setPlaylistInfo] = useState({
    
    image: null as string | null,
  });
  // Fitur Tambahan (Search, Download, dll)
  const [searchQuery, setSearchQuery] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadElapsed, setDownloadElapsed] = useState(0);
  const [downloadProgress, setDownloadProgress] =
    useState<DownloadProgress | null>(null);
  const [downloadLog, setDownloadLog] = useState<
    Array<{ id: number; event: string; phase?: string; title?: string; ts: number }>
  >([]);
  const [logCollapsed, setLogCollapsed] = useState(false);
  const [coverModal, setCoverModal] = useState<{ open: boolean; track: Track | null }>({ open: false, track: null });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverFilePreview, setCoverFilePreview] = useState<string | null>(null);
  const [coverUrlInput, setCoverUrlInput] = useState("");
  const [isUpdatingCover, setIsUpdatingCover] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const downloadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const PHASE_LABELS: Record<string, string> = {
    fetching_playlist: "Ambil daftar",
    starting: "Mulai",
    downloading: "Download",
    metadata: "Metadata",
    completed: "Selesai",
    skipped: "Skipped",
    failed: "Gagal",
  };

  const PHASE_COLORS: Record<string, string> = {
    fetching_playlist: "text-blue-400",
    starting: "text-blue-400",
    downloading: "text-[#1DB954]",
    metadata: "text-yellow-400",
    completed: "text-[#1DB954]",
    skipped: "text-gray-400",
    failed: "text-red-400",
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const fullWidth = rect.width;
    const percentage = x / fullWidth;
    const targetTime = percentage * audioRef.current.duration;
    audioRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
    setProgress(percentage * 100);
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/backend";

  const normalizeTracks = (payload: unknown): Track[] => {
    if (Array.isArray(payload)) return payload as Track[];
    if (!payload || typeof payload !== "object") return [];

    const response = payload as TracksApiResponse;
    if (Array.isArray(response.data)) return response.data as Track[];
    if (Array.isArray(response.tracks)) return response.tracks as Track[];

    return [];
  };

  const isTrack = (payload: unknown): payload is Track => {
    if (!payload || typeof payload !== "object") return false;
    const candidate = payload as Partial<Track>;
    return typeof candidate.id === "number" || typeof candidate.id === "string";
  };

  const getTrackFileName = (track: Track | null) => {
    const rawName = track?.fileName || track?.file_name || "";
    return rawName ? encodeURIComponent(rawName) : "";
  };

  const getCoverUrl = (cover: string | null | undefined): string | null => {
    if (!cover) return null;
    if (cover.startsWith("http://") || cover.startsWith("https://")) return cover;
    return `${API_BASE}/covers/${cover}`;
  };

  const isPlaylistUrl = (url: string): boolean => {
    try {
      const u = new URL(url);
      return (
        u.searchParams.has("list") || u.pathname.includes("/playlist")
      );
    } catch {
      return false;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      audioRef.current.muted = newMutedState;
      if (!newMutedState && volume === 0) {
        setVolume(0.1);
        audioRef.current.volume = 0.1;
      }
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration || 0;
      setCurrentTime(current);
      setDuration(total);
      setProgress(total > 0 ? (current / total) * 100 : 0);
    }
  };

  const calculateTotalPlaylistTime = () => {
    if (tracks.length === 0) return "0 mnt";
    const totalSeconds = tracks.reduce(
      (acc, track) => acc + (track?.durationSeconds || track?.duration || 0),
      0,
    );
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    return hours > 0 ? `${hours} jam ${minutes} mnt` : `${minutes} mnt`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlaylistInfo({ ...playlistInfo, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const playNext = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    setCurrentTrack(tracks[nextIndex]);
  };

  const playPrevious = () => {
    if (!currentTrack || tracks.length === 0) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrack(tracks[prevIndex]);
  };

  const handleDownloadYoutube = async (youtubeUrl: string) => {
    if (!youtubeUrl) return alert("Patenkan URL YouTube-nya bosquu!");
    setIsLoading(true);
    setIsDownloading(true);
    setDownloadElapsed(0);
    setDownloadLog([]);
    setDownloadProgress({
      current: 0,
      total: 0,
      title: "Menghubungkan ke server...",
      phase: "starting",
    });

    const pushLog = (
      event: string,
      payload?: { phase?: string; title?: string },
    ) => {
      setDownloadLog((prev) => {
        const next = [
          ...prev,
          {
            id: prev.length + 1,
            event,
            phase: payload?.phase,
            title: payload?.title,
            ts: Date.now(),
          },
        ];
        return next.length > 50 ? next.slice(-50) : next;
      });
    };
    const startedAt = Date.now();
    downloadTimerRef.current = setInterval(() => {
      setDownloadElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);

    let doneEvent: DoneEventPayload | null = null;
    let streamError: string | null = null;

    try {
      // Pakai route handler Next.js (/api/yt-download) yang stream langsung
      // dari upstream tanpa buffering — bukan rewrite /backend/* yang
      // diserap Next dan kemungkinan ngumpul di buffer.
      const res = await fetch(`/api/yt-download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: youtubeUrl }),
      });
      pushLog("response", {
        title: `HTTP ${res.status} · ${res.headers.get("content-type") || "?"}`,
      });

      if (!res.body) throw new Error("Response body kosong (no stream).");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() ?? "";

        for (const block of blocks) {
          if (!block.trim()) continue;

          let eventType = "";
          let dataStr = "";
          for (const line of block.split("\n")) {
            if (line.startsWith("event:")) {
              eventType = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataStr = line.slice(5).trim();
            }
          }
          if (!eventType || !dataStr) continue;

          let payload: any;
          try {
            payload = JSON.parse(dataStr);
          } catch {
            console.warn("Gagal parse event data:", dataStr);
            continue;
          }

          pushLog(eventType, {
            phase: payload?.phase,
            title:
              payload?.title ??
              payload?.message ??
              payload?.error ??
              (eventType === "ping" ? "alive" : undefined),
          });
          if (eventType === "progress") {
            setDownloadProgress(payload as DownloadProgress);
          } else if (eventType === "done") {
            doneEvent = payload as DoneEventPayload;
          } else if (eventType === "error") {
            streamError = payload?.message || payload?.error || "Stream error";
          }
          // event "ping" tetap masuk log tapi tidak update progress
        }
      }

      if (streamError) {
        alert("Error dari backend: " + streamError);
      } else if (doneEvent && doneEvent.status === "success") {
        const items = Array.isArray(doneEvent.data) ? doneEvent.data : [];
        const newTracks = items.filter(isTrack);
        if (newTracks.length > 0) {
          setTracks((prev) => [...newTracks, ...prev]);
        } else {
          await fetchTracks();
        }
        setYoutubeUrl("");
        const downloaded = doneEvent.downloaded ?? newTracks.length;
        const skipped = doneEvent.skipped ?? 0;
        const failed = doneEvent.failed ?? 0;
        const extra =
          skipped || failed
            ? ` (skip ${skipped}, gagal ${failed})`
            : "";
        alert(`Sukses! ${downloaded} lagu masuk${extra} 🔥`);
      } else {
        alert(
          "Gagal: " + (doneEvent?.error || doneEvent?.status || "Tidak ada event done"),
        );
      }
    } catch (err: any) {
      console.error("Gagal Request:", err);
      if (err.name === "TypeError") {
        alert(
          "Gagal menghubungi server (CORS / koneksi putus / timeout). Cek log backend.",
        );
      } else {
        alert("Terjadi kesalahan di jaringan/sistem: " + String(err.message));
      }
    } finally {
      if (downloadTimerRef.current) {
        clearInterval(downloadTimerRef.current);
        downloadTimerRef.current = null;
      }
      setIsDownloading(false);
      setDownloadElapsed(0);
      setDownloadProgress(null);
      setIsLoading(false);
    }
  };

  // Fitur Scan Folder
  const handleScanFolder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/scanFolder`);
      const json = await res.json();
      alert(json.message || "Folder berhasil discan!");
      await fetchTracks(); // Refresh data
    } catch (err) {
      alert("Gagal scan folder");
    } finally {
      setIsLoading(false);
    }
  };

  // Fitur Hapus
  const handleDeleteTrack = async (
    e: React.MouseEvent,
    id: number | string,
  ) => {
    e.stopPropagation(); // Biar gak auto play lagunya pas klik delete
    const confirmDelete = window.confirm(
      "Yakin mau hapus lagu ini ke tempat sampah, bosquu? 🗿",
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE}/api/tracks/${id}`, {
        method: "DELETE",
      });

      let json = { status: "", message: "" };
      const text = await res.text();
      try {
        json = JSON.parse(text);
      } catch (parseErr) {
        console.warn("Bukan strict JSON, isi balasan:", text);
      }

      if (res.ok || json.status === "Gacor!") {
        setTracks((prev) => prev.filter((t) => t.id !== id));
        if (currentTrack?.id === id) {
          setCurrentTrack(null);
          audioRef.current?.pause();
          setIsPlaying(false);
        }
        alert(json.message || "Lagu berhasil dihapus.");
      } else {
        alert(json.message || "Gagal hapus!");
      }
    } catch (err) {
      console.error(err);
      alert("Error: gagal menghubungi server");
    }
  };

  const openCoverModal = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    setCoverModal({ open: true, track });
    setCoverFile(null);
    setCoverFilePreview(null);
    setCoverUrlInput("");
  };

  const closeCoverModal = () => {
    setCoverModal({ open: false, track: null });
    setCoverFile(null);
    setCoverFilePreview(null);
    setCoverUrlInput("");
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverUrlInput("");
    const reader = new FileReader();
    reader.onloadend = () => setCoverFilePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpdateCover = async () => {
    if (!coverModal.track) return;
    if (!coverFile && !coverUrlInput.trim()) return;

    const id = coverModal.track.id;
    setIsUpdatingCover(true);

    try {
      let res: Response;

      if (coverFile) {
        const formData = new FormData();
        formData.append("cover", coverFile);
        res = await fetch(`${API_BASE}/api/tracks/${id}/cover`, {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(`${API_BASE}/api/tracks/${id}/cover`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cover_url: coverUrlInput.trim() }),
        });
      }

      const json = await res.json();
      if (res.ok && json.status === "success") {
        const newCover = json.cover as string;
        setTracks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, playlistCover: newCover } : t)),
        );
        if (currentTrack?.id === id) {
          setCurrentTrack((prev) =>
            prev ? { ...prev, playlistCover: newCover } : prev,
          );
        }
        closeCoverModal();
      } else {
        alert(json.message || "Gagal update cover");
      }
    } catch {
      alert("Error: gagal menghubungi server");
    } finally {
      setIsUpdatingCover(false);
    }
  };

  // Extract fungsi fetch biasa agar bisa dipakai ulang (oleh scan/search empty)
  const fetchTracks = async () => {
    setIsFetchingTracks(true);
    setFetchError("");

    try {
      const res = await fetch(`${API_BASE}/api/tracks`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      const list = normalizeTracks(json);
      setTracks(list);

      if (currentTrack && !list.some((track) => track.id === currentTrack.id)) {
        setCurrentTrack(null);
        setIsPlaying(false);
      }
    } catch (err) {
      console.error("Failed to fetch tracks:", err);
      setTracks([]);
      setFetchError("Gagal ambil daftar musik. Coba refresh atau cek API.");
    } finally {
      setIsFetchingTracks(false);
    }
  };

  // Fitur Search
  const handleSearch = async (kw: string) => {
    setSearchQuery(kw);

    if (!kw.trim()) {
      fetchTracks();
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/api/tracks/search?q=${encodeURIComponent(kw)}`,
      );
      const json = await res.json();
      setTracks(normalizeTracks(json));
      setFetchError("");
    } catch (err) {
      console.error("Gagal nyari lagu:", err);
      setTracks([]);
      setFetchError("Pencarian gagal. Coba lagi sebentar.");
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        togglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    fetchTracks();
  }, [API_BASE]);
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
      setProgress(0);
      setCurrentTime(0);
      setDuration(0);
    }
  }, [currentTrack]);

  const downloadPercent =
    downloadProgress && downloadProgress.total > 0
      ? Math.min(
          100,
          Math.round(
            (downloadProgress.current / downloadProgress.total) * 100,
          ),
        )
      : null;

  return (
    <div className="relative flex h-screen bg-[#050505] text-zinc-200 font-sans overflow-hidden">
      {/* AMBIENT BACKGROUND ORBS */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#1DB954]/15 blur-[120px] ambient-orb"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 w-[420px] h-[420px] rounded-full bg-purple-600/10 blur-[120px] ambient-orb"
        style={{ animationDelay: "-6s" }}
      />

      {/* SIDEBAR */}
      <aside className="relative z-10 w-72 bg-black/60 backdrop-blur-2xl border-r border-white/[0.05] p-6 flex-col gap-6 hidden lg:flex">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1DB954] to-[#0a6e30] flex items-center justify-center shadow-lg shadow-[#1DB954]/30">
            <Disc3 size={22} className="text-black" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">
              nocturn<span className="text-[#1DB954]">.</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mt-1">
              Music Vault
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 text-sm font-semibold mt-2">
          {[
            { icon: HomeIcon, label: "Home", active: true },
            { icon: Search, label: "Search" },
            { icon: Library, label: "Library" },
          ].map(({ icon: Icon, label, active }) => (
            <button
              key={label}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                active
                  ? "bg-white/[0.04] text-white"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#1DB954]" />
              )}
              <Icon size={18} />
              {label}
            </button>
          ))}
          <div className="my-3 h-px bg-white/[0.05]" />
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.02] transition-all">
            <Heart size={18} /> Liked Songs
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.02] transition-all">
            <ListMusic size={18} /> Playlists
          </button>
        </nav>

        {/* Now playing mini card */}
        {currentTrack && (
          <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[#1DB954]/15 via-white/[0.03] to-transparent border border-[#1DB954]/20">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-end gap-[2px] h-3">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="eq-bar w-[3px] bg-[#1DB954] rounded-sm"
                    style={{
                      height: "100%",
                      animationDelay: `${i * 0.15}s`,
                      animationPlayState: isPlaying ? "running" : "paused",
                    }}
                  />
                ))}
              </div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#1DB954]">
                {isPlaying ? "Now Playing" : "Paused"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden ring-1 ring-white/[0.06]">
                {getCoverUrl(currentTrack.playlistCover) ? (
                  <img
                    src={getCoverUrl(currentTrack.playlistCover)!}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/20 to-black flex items-center justify-center">
                    <Music2 size={14} className="text-[#1DB954]/60" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {currentTrack.trackTitle || currentTrack.title}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {currentTrack.artistName || currentTrack.artist}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-b from-[#1DB954]/[0.07] via-[#050505] to-[#050505] pb-32">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 pt-10">
          {/* HERO HEADER */}
          <header className="mb-10 flex flex-col md:flex-row gap-8 items-start md:items-end">
            <label className="w-52 h-52 md:w-60 md:h-60 shrink-0 cursor-pointer overflow-hidden rounded-2xl relative group shadow-[0_20px_60px_-15px_rgba(29,185,84,0.5)] ring-1 ring-white/10">
              {(playlistInfo.image || getCoverUrl(currentTrack?.playlistCover)) ? (
                <img
                  src={playlistInfo.image || getCoverUrl(currentTrack?.playlistCover) || ""}
                  alt="Cover"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/30 via-[#0a6e30]/20 to-black flex items-center justify-center">
                  <Music2 size={72} className="text-[#1DB954]/70" />
                </div>
              )}
              <input
                type="file"
                className="hidden"
                onChange={handleImageUpload}
                accept="image/*"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity backdrop-blur-sm">
                <Sparkles size={28} className="text-white" />
                <p className="text-xs font-bold uppercase tracking-widest text-white">
                  Ganti Cover
                </p>
              </div>
            </label>

            <div className="flex flex-col gap-3 flex-1 min-w-0">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Public Playlist
              </span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-tight">
                Nocturn Vault
              </h2>
              <div className="flex items-center gap-3 text-sm text-zinc-300 flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold">
                  <div className="w-5 h-5 rounded-full bg-[#1DB954] flex items-center justify-center">
                    <Music2 size={11} className="text-black" />
                  </div>
                  nocturn
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">
                  {tracks.length} lagu
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400">
                  {calculateTotalPlaylistTime()}
                </span>
              </div>
            </div>
          </header>

          {/* QUICK ACTIONS BAR */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_auto] gap-3 mb-6">
              {/* Search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchQuery);
                }}
                className="flex items-center bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl px-4 py-3 border border-white/[0.06] focus-within:border-[#1DB954]/50 focus-within:bg-white/[0.05] transition-all"
              >
                <Search size={18} className="text-zinc-400" />
                <input
                  type="text"
                  placeholder="Cari lagu atau artis di library..."
                  className="bg-transparent border-none outline-none text-sm text-white w-full ml-3 focus:ring-0 placeholder:text-zinc-500"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => handleSearch("")}
                    className="text-zinc-500 hover:text-white text-xs px-2"
                  >
                    clear
                  </button>
                )}
              </form>

              {/* YouTube Add */}
              <div className="flex items-center bg-gradient-to-r from-[#1DB954]/10 to-white/[0.03] rounded-2xl pl-4 pr-1 py-1 border border-[#1DB954]/20 focus-within:border-[#1DB954]/60 transition-all">
                <Sparkles size={16} className="text-[#1DB954] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Tempel URL YouTube / Playlist..."
                  className="bg-transparent border-none outline-none text-sm text-white w-full md:w-72 py-2 focus:ring-0 placeholder:text-zinc-500"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleDownloadYoutube(youtubeUrl);
                  }}
                />
                <button
                  onClick={() => handleDownloadYoutube(youtubeUrl)}
                  disabled={isLoading || !youtubeUrl}
                  className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
                >
                  {isLoading ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  Add
                </button>
              </div>

              {/* Scan */}
              <button
                onClick={handleScanFolder}
                disabled={isLoading}
                title="Sync lagu lokal dari folder server"
                className="flex items-center justify-center gap-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-2xl px-4 py-3 text-zinc-300 hover:text-white transition-all disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={isLoading ? "animate-spin" : ""}
                />
                <span className="text-sm font-semibold">Sync</span>
              </button>
            </div>

            {/* DOWNLOAD PROGRESS CARD */}
            {isDownloading && (
              <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#1DB954]/[0.08] via-white/[0.02] to-transparent border border-[#1DB954]/20 overflow-hidden">
                {/* Header strip */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.05] bg-black/30">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1DB954]" />
                  </span>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                    Streaming dari Backend
                  </h4>
                  <div className="ml-auto flex items-center gap-3 text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {formatTime(downloadElapsed)}
                    </span>
                    {downloadProgress && downloadProgress.total > 0 && (
                      <>
                        <span className="text-zinc-600">·</span>
                        <span>
                          <span className="text-white font-bold">
                            {downloadProgress.current}
                          </span>
                          <span className="text-zinc-500">
                            /{downloadProgress.total}
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-3">
                    {/* Phase chip */}
                    {downloadProgress?.phase && (
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                          PHASE_COLORS[downloadProgress.phase] ||
                          "text-zinc-300"
                        } ${
                          downloadProgress.phase === "failed"
                            ? "border-red-400/30 bg-red-400/10"
                            : downloadProgress.phase === "skipped"
                              ? "border-zinc-500/30 bg-zinc-500/10"
                              : downloadProgress.phase === "completed"
                                ? "border-[#1DB954]/30 bg-[#1DB954]/10"
                                : "border-current/30 bg-white/[0.03]"
                        }`}
                      >
                        {PHASE_LABELS[downloadProgress.phase] ||
                          downloadProgress.phase}
                      </span>
                    )}
                    <p className="text-sm text-white truncate font-medium flex-1">
                      {downloadProgress?.title || "Memulai..."}
                    </p>
                    {downloadPercent !== null && (
                      <span className="text-sm font-bold text-[#1DB954] tabular-nums">
                        {downloadPercent}%
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden relative">
                    {downloadPercent !== null ? (
                      <div
                        className="h-full bg-gradient-to-r from-[#1DB954] via-[#1ed760] to-[#1DB954] rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(29,185,84,0.6)]"
                        style={{ width: `${downloadPercent}%` }}
                      />
                    ) : (
                      <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#1DB954] to-transparent animate-pulse rounded-full" />
                    )}
                  </div>

                  {/* Activity log */}
                  {downloadLog.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/[0.05]">
                      <button
                        onClick={() => setLogCollapsed((v) => !v)}
                        className="w-full flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-zinc-300 transition"
                      >
                        <span className="flex items-center gap-2">
                          <Activity size={11} />
                          Activity Log
                          <span className="text-zinc-600 normal-case">
                            ({downloadLog.length})
                          </span>
                        </span>
                        {logCollapsed ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronUp size={14} />
                        )}
                      </button>
                      {!logCollapsed && (
                        <div className="mt-2 max-h-36 overflow-y-auto scrollbar-thin font-mono text-[10px] flex flex-col-reverse gap-1 pr-1">
                          {[...downloadLog].reverse().map((entry) => {
                            const eventColor =
                              entry.event === "progress"
                                ? PHASE_COLORS[entry.phase || ""] ||
                                  "text-zinc-300"
                                : entry.event === "done"
                                  ? "text-[#1DB954]"
                                  : entry.event === "error"
                                    ? "text-red-400"
                                    : entry.event === "ping"
                                      ? "text-zinc-600"
                                      : "text-zinc-400";
                            return (
                              <div
                                key={entry.id}
                                className="flex gap-2 items-baseline px-2 py-1 rounded hover:bg-white/[0.02]"
                              >
                                <span className="text-zinc-600 shrink-0 tabular-nums">
                                  {new Date(entry.ts).toLocaleTimeString(
                                    "id-ID",
                                    { hour12: false },
                                  )}
                                </span>
                                <span
                                  className={`${eventColor} font-bold shrink-0 uppercase`}
                                >
                                  {entry.event}
                                  {entry.phase ? `:${entry.phase}` : ""}
                                </span>
                                {entry.title && (
                                  <span className="text-zinc-400 truncate">
                                    {entry.title}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isDownloading && (
              <div className="mb-6 p-4 bg-[#121212]/60 rounded-xl border border-[#1DB954]/30">
                <div className="flex items-center justify-between mb-2 text-xs font-mono">
                  <span className="text-[#1DB954] font-bold uppercase tracking-widest flex items-center gap-2">
                    <RefreshCw size={12} className="animate-spin" />
                    {downloadProgress?.phase
                      ? PHASE_LABELS[downloadProgress.phase] ||
                        downloadProgress.phase
                      : "Downloading"}
                    {downloadProgress &&
                      downloadProgress.total > 0 && (
                        <span className="text-gray-400 normal-case font-mono">
                          {downloadProgress.current}/{downloadProgress.total}
                        </span>
                      )}
                  </span>
                  <span className="text-gray-400">
                    {formatTime(downloadElapsed)}
                  </span>
                </div>

                {downloadProgress?.title && (
                  <p
                    className={`text-xs mb-2 truncate ${
                      PHASE_COLORS[downloadProgress.phase] || "text-gray-300"
                    }`}
                  >
                    {downloadProgress.title}
                  </p>
                )}

                <div className="h-1.5 w-full bg-[#4d4d4d]/40 rounded-full overflow-hidden relative">
                  {downloadProgress && downloadProgress.total > 0 ? (
                    <div
                      className="h-full bg-gradient-to-r from-[#1DB954] to-[#1ed760] transition-all duration-300 ease-out"
                      style={{
                        width: `${Math.min(
                          100,
                          (downloadProgress.current / downloadProgress.total) *
                            100,
                        )}%`,
                      }}
                    />
                  ) : (
                    <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#1DB954] to-transparent animate-pulse" />
                  )}
                </div>

                {downloadProgress && downloadProgress.total > 0 && (
                  <p className="text-[10px] text-gray-500 mt-2 font-mono">
                    {Math.round(
                      (downloadProgress.current / downloadProgress.total) * 100,
                    )}
                    % selesai
                  </p>
                )}

                {/* Live activity log */}
                {downloadLog.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">
                      Activity ({downloadLog.length})
                    </p>
                    <div className="max-h-32 overflow-y-auto bg-black/40 rounded-md p-2 font-mono text-[10px] flex flex-col-reverse gap-1">
                      {[...downloadLog].reverse().map((entry) => {
                        const eventColor =
                          entry.event === "progress"
                            ? PHASE_COLORS[entry.phase || ""] || "text-gray-300"
                            : entry.event === "done"
                              ? "text-[#1DB954]"
                              : entry.event === "error"
                                ? "text-red-400"
                                : entry.event === "ping"
                                  ? "text-gray-600"
                                  : "text-gray-400";
                        return (
                          <div
                            key={entry.id}
                            className="flex gap-2 items-baseline"
                          >
                            <span className="text-gray-600 shrink-0">
                              {new Date(entry.ts).toLocaleTimeString("id-ID", {
                                hour12: false,
                              })}
                            </span>
                            <span
                              className={`${eventColor} font-bold shrink-0 uppercase`}
                            >
                              {entry.event}
                              {entry.phase ? `:${entry.phase}` : ""}
                            </span>
                            {entry.title && (
                              <span className="text-gray-400 truncate">
                                {entry.title}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LIBRARY HEADER */}
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black tracking-tight text-white">
                  Library
                </h3>
                {isFetchingTracks && (
                  <RefreshCw size={14} className="text-zinc-500 animate-spin" />
                )}
              </div>
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
                {tracks.length} tracks
              </p>
            </div>

            {/* LIBRARY TABLE */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] overflow-hidden backdrop-blur-sm">
              <div className="grid grid-cols-[48px_1fr_80px_60px] gap-4 px-5 py-3 border-b border-white/[0.05] text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] bg-black/20">
                <p className="text-center">#</p>
                <p>Title</p>
                <p className="text-right">
                  <Clock size={12} className="inline" />
                </p>
                <p className="text-right">·</p>
              </div>

              {isFetchingTracks && tracks.length === 0 && (
                <div className="p-12 text-center text-sm text-zinc-400 flex flex-col items-center gap-3">
                  <RefreshCw size={20} className="animate-spin text-[#1DB954]" />
                  Mengambil daftar musik...
                </div>
              )}

              {!isFetchingTracks && fetchError && (
                <div className="p-12 text-center text-sm flex flex-col items-center gap-2">
                  <AlertTriangle size={24} className="text-red-400" />
                  <p className="text-red-400 font-semibold">{fetchError}</p>
                  <button
                    onClick={fetchTracks}
                    className="mt-2 text-xs text-[#1DB954] hover:text-[#1ed760] font-bold uppercase tracking-widest"
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {!isFetchingTracks && !fetchError && tracks.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center">
                    <ListMusic size={28} className="text-zinc-500" />
                  </div>
                  <p className="text-sm text-zinc-300 font-semibold">
                    Library kosong
                  </p>
                  <p className="text-xs text-zinc-500 max-w-xs">
                    Tempel link YouTube di atas atau klik <b>Sync</b> untuk
                    scan folder server.
                  </p>
                </div>
              )}

              {!isFetchingTracks &&
                !fetchError &&
                tracks.map((track, index) => {
                  const isActive = currentTrack?.id === track.id;
                  const trackDuration =
                    track.durationSeconds || track.duration || 0;
                  return (
                    <div
                      key={track.id}
                      onClick={() => setCurrentTrack(track)}
                      className={`grid grid-cols-[48px_1fr_80px_60px] gap-4 px-5 py-3 items-center transition-colors cursor-pointer border-b border-white/[0.03] last:border-b-0 group ${
                        isActive
                          ? "bg-[#1DB954]/[0.08]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      {/* Index / Playing indicator */}
                      <div className="flex items-center justify-center">
                        {isActive && isPlaying ? (
                          <div className="flex items-end gap-[2px] h-4">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="eq-bar w-[3px] bg-[#1DB954] rounded-sm"
                                style={{
                                  height: "100%",
                                  animationDelay: `${i * 0.15}s`,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <>
                            <span
                              className={`text-sm font-mono group-hover:hidden ${
                                isActive ? "text-[#1DB954]" : "text-zinc-500"
                              }`}
                            >
                              {index + 1}
                            </span>
                            <Play
                              size={14}
                              fill="currentColor"
                              className="hidden group-hover:block text-white"
                            />
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
                        <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden ring-1 ring-white/[0.06]">
                          {getCoverUrl(track.playlistCover) ? (
                            <img
                              src={getCoverUrl(track.playlistCover)!}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/20 to-black flex items-center justify-center">
                              <Music2 size={14} className="text-[#1DB954]/50" />
                            </div>
                          )}
                        </div>
                        <div className="overflow-hidden min-w-0">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isActive ? "text-[#1DB954]" : "text-white"
                            }`}
                          >
                            {track.trackTitle || track.title}
                          </p>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">
                            {track.artistName || track.artist}
                          </p>
                        </div>
                      </div>

                      {/* Duration */}
                      <p className="text-xs text-zinc-500 text-right font-mono tabular-nums">
                        {trackDuration > 0 ? formatTime(trackDuration) : "—"}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => openCoverModal(e, track)}
                          title="Ganti cover"
                          className="p-2 rounded-lg text-zinc-400 hover:bg-[#1DB954]/15 hover:text-[#1DB954] transition-all"
                        >
                          <ImagePlus size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTrack(e, track.id)}
                          title="Hapus lagu"
                          className="p-2 rounded-lg text-zinc-400 hover:bg-red-500/15 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        </div>
      </main>

      {/* PLAYER BAR */}
      {currentTrack && (
        <footer className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
          <div className="max-w-[1400px] mx-auto h-[88px] bg-black/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl px-4 flex items-center gap-4 shadow-2xl shadow-black/50">
            {/* INFO LEFT */}
            <div className="flex items-center gap-3 w-[28%] min-w-0">
              <div className="w-14 h-14 rounded-xl shrink-0 overflow-hidden ring-1 ring-white/[0.06]">
                {getCoverUrl(currentTrack.playlistCover) ? (
                  <img
                    src={getCoverUrl(currentTrack.playlistCover)!}
                    alt="cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1DB954]/30 to-[#0a6e30]/20 flex items-center justify-center">
                    <Music2 size={22} className="text-[#1DB954]" />
                  </div>
                )}
              </div>
              <div className="truncate min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {currentTrack.trackTitle || currentTrack.title}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  {currentTrack.artistName || currentTrack.artist}
                </p>
              </div>
            </div>

            {/* CONTROLS CENTER */}
            <div className="flex flex-col items-center justify-center flex-1 gap-1.5">
              <div className="flex items-center gap-2 text-zinc-300">
                <button
                  onClick={playPrevious}
                  className="p-2 rounded-full hover:bg-white/[0.06] hover:text-white transition active:scale-90"
                  title="Lagu sebelumnya"
                >
                  <SkipBack size={18} fill="currentColor" />
                </button>

                <button
                  onClick={togglePlay}
                  className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition active:scale-95 shadow-lg"
                >
                  {isPlaying ? (
                    <Pause size={18} fill="black" />
                  ) : (
                    <Play size={18} fill="black" className="translate-x-[1px]" />
                  )}
                </button>

                <button
                  onClick={playNext}
                  className="p-2 rounded-full hover:bg-white/[0.06] hover:text-white transition active:scale-90"
                  title="Lagu selanjutnya"
                >
                  <SkipForward size={18} fill="currentColor" />
                </button>
              </div>

              {/* Seek bar */}
              <div className="flex items-center gap-2 w-full max-w-xl group">
                <span className="text-[10px] text-zinc-500 font-mono tabular-nums w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <div
                  onClick={handleSeek}
                  className="h-1 flex-1 bg-white/[0.08] rounded-full relative cursor-pointer hover:h-1.5 transition-all"
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-white group-hover:bg-[#1DB954] transition-colors rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    style={{ left: `${progress}%`, marginLeft: "-6px" }}
                  />
                </div>
                <span className="text-[10px] text-zinc-500 font-mono tabular-nums w-10">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* RIGHT: Volume */}
            <div className="w-[28%] flex justify-end items-center gap-3 text-zinc-300">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/[0.06] hover:text-white transition"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>

              <div className="relative w-28 h-1 bg-white/[0.08] rounded-full overflow-hidden group hover:h-1.5 transition-all">
                <div
                  className="absolute top-0 left-0 h-full bg-white group-hover:bg-[#1DB954] transition-colors rounded-full"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
            </div>
          </div>

          {/* AUDIO ELEMENT */}
          <audio
            ref={audioRef}
            key={currentTrack.id}
            src={`${API_BASE}/storage/music/${getTrackFileName(currentTrack)}`}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
            onEnded={playNext}
            autoPlay
          />
        </footer>
      )}

      {/* COVER UPDATE MODAL */}
      {coverModal.open && coverModal.track && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeCoverModal}
        >
          <div
            className="w-full max-w-sm bg-[#111] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <ImagePlus size={16} className="text-[#1DB954]" />
                <h3 className="text-sm font-bold text-white">Ganti Cover</h3>
              </div>
              <button
                onClick={closeCoverModal}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.06] transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              {/* Track name */}
              <p className="text-xs text-zinc-400 truncate">
                <span className="text-zinc-500">Lagu: </span>
                {coverModal.track.trackTitle || coverModal.track.title}
              </p>

              {/* Preview + current cover */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/[0.08] bg-zinc-900">
                  {(coverFilePreview || getCoverUrl(coverModal.track.playlistCover)) ? (
                    <img
                      src={coverFilePreview || getCoverUrl(coverModal.track.playlistCover)!}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 size={24} className="text-zinc-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {coverFilePreview && (
                    <p className="text-[10px] text-[#1DB954] font-semibold truncate">
                      {coverFile?.name}
                    </p>
                  )}
                  <button
                    onClick={() => coverFileInputRef.current?.click()}
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white transition"
                  >
                    <Upload size={13} />
                    Upload file
                  </button>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverFileChange}
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">atau</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* URL input */}
              <div className="flex items-center gap-2 bg-white/[0.03] rounded-xl px-3 py-2.5 border border-white/[0.06] focus-within:border-[#1DB954]/40 transition">
                <Link size={14} className="text-zinc-500 shrink-0" />
                <input
                  type="url"
                  placeholder="https://i.ytimg.com/..."
                  value={coverUrlInput}
                  onChange={(e) => {
                    setCoverUrlInput(e.target.value);
                    if (e.target.value) {
                      setCoverFile(null);
                      setCoverFilePreview(null);
                    }
                  }}
                  className="bg-transparent text-sm text-white outline-none w-full placeholder:text-zinc-600"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleUpdateCover}
                disabled={isUpdatingCover || (!coverFile && !coverUrlInput.trim())}
                className="w-full py-2.5 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdatingCover ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <ImagePlus size={14} />
                )}
                {isUpdatingCover ? "Menyimpan..." : "Simpan Cover"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
