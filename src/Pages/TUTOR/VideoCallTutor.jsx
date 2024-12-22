import React, { useEffect, useState } from 'react';
import { useCallContext } from '../lib/callProvider';
import { VideoControls } from './VideoControls';
import { CallPopup } from './CallPop';

const VideoCall = ({ 
  isInitiator, 
  partnerId, 
  onEndCall, 
  callerInfo, 
  incomingCall 
}) => {
  const {
    localVideoRef,
    remoteVideoRef,
    isFullScreen,
    setIsFullScreen,
    isVisible,
    setIsVisible,
    initiateCall,
    answerCall,
    destroyConnection,
    streamRef,
    peerStreamRef,
    mediaError,
    connectionRef
  } = useCallContext();

  const [diagnosticInfo, setDiagnosticInfo] = useState(null);

  // Diagnostic function to check video stream status
  const runVideoStreamDiagnostics = () => {
    try {
      const diagnostics = {
        localStream: streamRef.current ? {
          active: streamRef.current.active,
          id: streamRef.current.id,
          tracks: streamRef.current.getTracks().map(track => ({
            kind: track.kind,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
            id: track.id
          }))
        } : 'Not available',
        remoteStream: peerStreamRef.current ? {
          active: peerStreamRef.current.active,
          id: peerStreamRef.current.id,
          tracks: peerStreamRef.current.getTracks().map(track => ({
            kind: track.kind,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
            id: track.id
          }))
        } : 'Not available',
        peerConnection: connectionRef.current && connectionRef.current._pc ? {
          iceConnectionState: connectionRef.current._pc.iceConnectionState,
          signalingState: connectionRef.current._pc.signalingState,
          connectionState: connectionRef.current._pc.connectionState,
          localDescription: connectionRef.current._pc.localDescription,
          remoteDescription: connectionRef.current._pc.remoteDescription
        } : 'Not available'
      };
  
      console.log('Diagnostics:', diagnostics);
      setDiagnosticInfo(JSON.stringify(diagnostics, null, 2));
    } catch (error) {
      console.error('Diagnostic error:', error);
      setDiagnosticInfo(`Error: ${error.message}`);
    }
  };

  // Call initiation effects
  useEffect(() => {
    const initializeCall = async () => {
      try {
        if (isInitiator && partnerId) {
          await initiateCall(partnerId, null, callerInfo);
          setIsVisible(true);
        } else if (incomingCall) {
          await answerCall(incomingCall);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Call initialization failed:', error);
        setIsVisible(false);
      }
    };

    initializeCall();

    return () => {
      destroyConnection();
    };
  }, [isInitiator, partnerId, incomingCall, callerInfo]);

  // Local video stream binding
  useEffect(() => {
    if (streamRef.current && localVideoRef.current) {
      try {
        console.log('Binding local video stream:', streamRef.current.getTracks());
        localVideoRef.current.srcObject = streamRef.current;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play().catch(error => {
            console.error('Error playing local video:', error);
          });
        };
      } catch (error) {
        console.error('Local video binding error:', error);
      }
    } else {
      console.warn('Local video ref or stream not available');
    }
  }, [streamRef.current, localVideoRef]);

  // Remote video stream binding
  useEffect(() => {
    if (peerStreamRef.current && remoteVideoRef.current) {
      try {
        console.log('Binding remote video stream:', peerStreamRef.current.getTracks());
        remoteVideoRef.current.srcObject = peerStreamRef.current;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch(error => {
            console.error('Error playing remote video:', error);
          });
        };
        
        // Unmute the video track
        const videoTrack = peerStreamRef.current.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = true;
          console.log('Remote video track unmuted');
        }
      } catch (error) {
        console.error('Remote video binding error:', error);
      }
    } else {
      console.warn('Remote video ref or stream not available');
    }
  }, [peerStreamRef.current, remoteVideoRef]);

  // Handle call end
  const handleEndCall = () => {
    try {
      destroyConnection();
      onEndCall();
      setIsVisible(false);
    } catch (error) {
      console.error('Error ending call:', error);
    }
  };

  const triggerICEReconnect = () => {
    if (connectionRef.current && connectionRef.current._pc) {
      connectionRef.current._pc.restartIce();
      console.log('ICE reconnection triggered');
    } else {
      console.warn('No peer connection or underlying RTCPeerConnection to restart ICE');
    }
  };
  useEffect(() => {
    if (localVideoRef.current && streamRef.current) {
      try {
        localVideoRef.current.srcObject = streamRef.current;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play().catch(error => {
            console.error('Error playing local video:', error);
          });
        };
      } catch (error) {
        console.error('Local video ref or stream not available:', error);
      }
    }
  
    if (remoteVideoRef.current && peerStreamRef.current) {
      try {
        remoteVideoRef.current.srcObject = peerStreamRef.current;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch(error => {
            console.error('Error playing remote video:', error);
          });
        };
      } catch (error) {
        console.error('Remote video ref or stream not available:', error);
      }
    }
  }, [localVideoRef, remoteVideoRef, streamRef, peerStreamRef]);
  // Render nothing if not visible
  if (!isVisible) return null;

  return (
    <div className={`fixed ${isFullScreen ? 'inset-0' : 'bottom-4 right-4 w-96 h-64'} bg-black rounded-lg overflow-hidden z-50`}>
      {/* Media Error Display */}
      {mediaError && (
        <div className="absolute top-0 left-0 w-full bg-red-600 text-white p-2 text-center z-10">
          {mediaError}
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full h-full">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />

        {/* Local Video (Small Overlay) */}
        <div className="absolute top-2 right-2 w-1/4 h-1/4 bg-gray-800 rounded-lg overflow-hidden">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
        </div>

        {/* Video Controls */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <VideoControls onEndCall={handleEndCall} />
        </div>

        {/* Diagnostic Info (Optional, for debugging) */}
        {diagnosticInfo && (
          <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white text-xs p-1 overflow-auto max-h-24">
            <pre>{diagnosticInfo}</pre>
          </div>
        )}
        <button
          className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
          onClick={runVideoStreamDiagnostics}
        >
          Run Diagnostics
        </button>
        <button
          className="absolute top-2 left-32 bg-blue-500 text-white px-2 py-1 rounded text-sm"
          onClick={triggerICEReconnect}
        >
          Reconnect ICE
        </button>
      </div>

      {/* Call Popup */}
      <CallPopup />
    </div>
  );
};

export default VideoCall;

