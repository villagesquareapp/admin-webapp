"use client";

import { useState } from "react";
import ReactPlayer from "react-player";
import { formatDuration } from "./vflixStatus";

/**
 * VFlix player. Playback rule (guide §4.1): prefer the transcoded HLS stream
 * (`transcoded_media_url`, .m3u8) when `is_transcode_complete` is true,
 * otherwise fall back to the raw `media_url`. react-player handles HLS.
 */
const VflixVideoPlayer = ({ media }: { media?: IVflixMedia | null }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!media) {
    return (
      <div className="w-full aspect-[9/16] rounded-xl overflow-hidden bg-black/90 flex items-center justify-center text-white/60 text-sm">
        No media
      </div>
    );
  }

  const src =
    media.is_transcode_complete && media.transcoded_media_url
      ? media.transcoded_media_url
      : media.media_url;

  return (
    <div className="w-full aspect-[9/16] max-h-[70vh] rounded-xl overflow-hidden bg-black relative mx-auto">
      {/* transcode + duration overlays */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {!media.is_transcode_complete && (
          <span className="rounded-full bg-yellow-500/90 text-black px-2 py-0.5 text-xs font-semibold">
            Transcoding…
          </span>
        )}
      </div>
      <div className="absolute top-3 right-3 z-10">
        <span className="rounded-full bg-black/60 text-white px-2 py-0.5 text-xs font-semibold">
          {formatDuration(media.duration)}
        </span>
      </div>

      <ReactPlayer
        url={src}
        width="100%"
        height="100%"
        controls
        playing={isPlaying}
        playsinline
        stopOnUnmount
        volume={0.8}
        light={media.thumbnail || false}
        className="react-player"
        style={{ borderRadius: "12px" }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => setIsPlaying(false)}
      />
    </div>
  );
};

export default VflixVideoPlayer;
