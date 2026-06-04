// @ts-nocheck
"use client";
import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  duration?: string;
  onComplete?: () => void;
  onProgress?: (percent: number) => void;
  autoCompleteThreshold?: number; // 0-100, default 95
  completionPolicy?: "manual" | "auto_at_95";
}

interface PlayerState {
  played: number;
  url: string;
}

export default function VideoPlayer({
  videoUrl,
  title,
  duration,
  onComplete,
  onProgress,
  autoCompleteThreshold = 95,
  completionPolicy = "manual",
}: VideoPlayerProps) {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [played, setPlayed] = useState(0);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const watchPercent = Math.round(played * 100);
  const watchMinutes = videoDuration ? Math.round((videoDuration * played) / 60) : 0;

  useEffect(() => {
    if (onProgress) {
      onProgress(watchPercent);
    }
  }, [watchPercent, onProgress]);

  useEffect(() => {
    if (completionPolicy === "auto_at_95" && watchPercent >= autoCompleteThreshold) {
      if (onComplete) {
        onComplete();
      }
    }
  }, [watchPercent, completionPolicy, autoCompleteThreshold, onComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
        }
      } else {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  if (error) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 text-center">
        <div className="text-red-500 mb-4 text-xl">⚠️ Unable to load video</div>
        <p className="text-gray-400 mb-4">{error}</p>
        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all"
          >
            Open Video in New Tab →
          </a>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full bg-gray-900 rounded-lg overflow-hidden mb-4"
    >
      <div className="relative" style={{ paddingBottom: "56.25%" }}>
        <div className="absolute inset-0">
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            playing={isPlaying}
            controls={false}
            width="100%"
            height="100%"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onProgress={(state: any) => setPlayed(state.played)}
            onDuration={setVideoDuration}
            onError={() => {
              setError("Could not load this video. It may be unavailable or blocked.");
            }}
          />
        </div>
      </div>

      {/* Custom Controls */}
      <div className="bg-gray-800 p-4 space-y-3">
        {/* Title */}
        {title && (
          <div className="text-white font-bold text-sm">{title}</div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <label htmlFor="video-progress" className="sr-only">Video progress</label>
          <input
            id="video-progress"
            type="range"
            min="0"
            max="0.999999"
            step="any"
            value={played}
            onChange={(e) => {
              setPlayed(parseFloat(e.target.value));
              if (playerRef.current) {
                playerRef.current.seekTo(parseFloat(e.target.value));
              }
            }}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>{watchMinutes}:{String(Math.round((videoDuration || 0) * played) % 60).padStart(2, "0")}</span>
            <span>{videoDuration ? `${Math.round(videoDuration / 60)}:${String(Math.round(videoDuration % 60)).padStart(2, "0")}` : "-- :--"}</span>
          </div>
        </div>

        {/* Watch Progress Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                watchPercent >= 90
                  ? "bg-green-500"
                  : watchPercent >= 50
                  ? "bg-yellow-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${watchPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-gray-300">{watchPercent}%</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={handlePlayPause}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded text-sm transition-all"
            >
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              onClick={handleFullscreen}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-1.5 px-3 rounded text-sm transition-all"
            >
              {isFullscreen ? "⛔ Exit" : "⛶ Fullscreen"}
            </button>
          </div>

          {/* Complete Button (if manual policy) */}
          {completionPolicy === "manual" && (
            <button
              onClick={() => onComplete && onComplete()}
              disabled={watchPercent < 80}
              className={`font-bold py-1.5 px-3 rounded text-sm transition-all ${
                watchPercent >= 80
                  ? "bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              ✓ Mark Done
            </button>
          )}

          {/* Auto-complete indicator */}
          {completionPolicy === "auto_at_95" && watchPercent >= autoCompleteThreshold && (
            <div className="flex items-center gap-1 text-green-500 font-bold text-sm">
              ✓ Auto-completing...
            </div>
          )}
        </div>

        {/* Help text */}
        <div className="text-xs text-gray-500">
          {completionPolicy === "manual"
            ? watchPercent >= 80
              ? "Watch at least 80% to mark complete"
              : `Watch more to unlock complete (${watchPercent}%)`
            : `Auto-completes at ${autoCompleteThreshold}%`}
        </div>
      </div>
    </div>
  );
}
