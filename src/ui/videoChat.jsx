import React, { useState, useEffect } from 'react';
import { useCallContext } from '@/lib/callProvider';
import VideoCall from './videoCall';
import { CallPopup } from './CallPop';

const VideoChatManager = ({ tutorId, user }) => {
  const {
    isCallPopupOpen,
    incomingCallInfo,
    isVisible,
    setIsVisible,
    setupStream,
    startCall,
    endCall
  } = useCallContext();

  const [isInCall, setIsInCall] = useState(false);

  const handleStartCall = async () => {
    try {
      await setupStream();
      await startCall(tutorId);
      setIsInCall(true);
      setIsVisible(true);
    } catch (error) {
      console.error('Call initiation failed:', error);
      toast.error('Failed to start call. Please try again.');
    }
  };

  const handleEndCall = () => {
    endCall();
    setIsInCall(false);
    setIsVisible(false);
  };

  // Handle incoming call visibility
  useEffect(() => {
    if (incomingCallInfo?.isSomeoneCalling) {
      setIsInCall(true);
    }
  }, [incomingCallInfo]);

  // Always render both components, let their internal visibility logic handle display
  return (
    <>
      <CallPopup />
      {(isVisible || isInCall || isCallPopupOpen) && (
        <VideoCall
          isInitiator={!incomingCallInfo?.isSomeoneCalling}
          partnerId={tutorId}
          onEndCall={handleEndCall}
          callerInfo={{
            name: user.full_name,
            avatar: user.user_image || user.profileImage,
            userId: user.id
          }}
        />
      )}
    </>
  );
};

export default VideoChatManager;