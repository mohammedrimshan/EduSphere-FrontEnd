import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';
import useCallContext from "@/lib/callProvider";

export function VideoControls() {
  const {
    isVideoOff,
    isMuted,
    isFullScreen,
    toggleVideo,
    toggleAudio,
    endCall,
    updateState
  } = useCallContext();

  const toggleFullScreen = () => {
    updateState({ isFullScreen: !isFullScreen });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
        onClick={toggleAudio}
      >
        {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
        onClick={toggleVideo}
      >
        {isVideoOff ? (
          <VideoOff className="h-5 w-5" />
        ) : (
          <Video className="h-5 w-5" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
        onClick={toggleFullScreen}
      >
        {isFullScreen ? (
          <Minimize2 className="h-5 w-5" />
        ) : (
          <Maximize2 className="h-5 w-5" />
        )}
      </Button>
      <Button
        variant="destructive"
        size="icon"
        className="h-12 w-12 rounded-full"
        onClick={endCall}
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
}

