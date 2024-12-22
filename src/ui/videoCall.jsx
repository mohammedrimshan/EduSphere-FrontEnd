import React, { useState, useEffect, useRef } from "react";
import { UserInfo } from "./UserInfo";
import { VideoControls } from "./VideoControls";
import useCallContext from "@/lib/callProvider";

function VideoCall({ isInitiator, partnerId, onEndCall, callerInfo }) {
  const [isHovering, setIsHovering] = useState(false);
  const [interactionTimeout, setInteractionTimeout] = useState(null);
  const containerRef = useRef(null);

  const {
    myVideoRef,
    peerVideoRef,
    isFullScreen,
    streamRef,
    setupStream,
    toggleVideo,
    toggleAudio,
    isVideoOff,
    isMuted,
  } = useCallContext();

  useEffect(() => {
    const initializeStream = async () => {
      try {
        await setupStream();
      } catch (error) {
        console.error("Failed to initialize stream:", error);
      }
    };

    initializeStream();
  }, [setupStream]);

  useEffect(() => {
    if (streamRef.current && myVideoRef.current) {
      myVideoRef.current.srcObject = streamRef.current;
    }
  }, [streamRef.current, myVideoRef]);

  const handleInteraction = () => {
    if (interactionTimeout) {
      clearTimeout(interactionTimeout);
    }

    setIsHovering(true);

    const timeout = setTimeout(() => {
      setIsHovering(false);
    }, 3000);
    setInteractionTimeout(timeout);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <video
        className="w-full h-full object-cover"
        ref={peerVideoRef}
        autoPlay
        playsInline
      />
      <div
        className={`absolute transition-all duration-300 ease-in-out ${
          isFullScreen
            ? "bottom-20 right-4 w-1/4 h-1/4"
            : "bottom-4 right-4 w-1/5 h-1/5"
        } rounded-lg overflow-hidden`}
      >
        <video
          className="w-full h-full bg-gray-900 object-cover"
          ref={myVideoRef}
          autoPlay
          muted
          playsInline
        />
      </div>
      <div
        className={`absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 transition-opacity duration-300 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute top-4 left-4">
          <UserInfo
            name={callerInfo.name}
            status="In call"
            avatar={callerInfo.avatar}
          />
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <VideoControls
            isVideoOff={isVideoOff}
            isMuted={isMuted}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onEndCall={onEndCall}
          />
        </div>
      </div>
    </div>
  );
}

export default VideoCall;

