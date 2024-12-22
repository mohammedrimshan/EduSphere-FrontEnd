// import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
// import Peer from 'simple-peer';
// import socket from "./socket";

// const CallContext = createContext();

// export const CallProvider = ({ children }) => {
//   const myVideoRef = useRef();
//   const peerVideoRef = useRef();
//   const connectionRef = useRef();
//   const streamRef = useRef(null);
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [state, setState] = useState({
//     isVisible: false,
//     isFullScreen: false,
//     isVideoOff: false,
//     isMuted: false,
//     isCallAccepted: false,
//     isCallPopupOpen: false,
//     callerData: null,
//     incomingCallInfo: {},
//     callInitiatorData: null
//   });

//   const updateState = useCallback((updates) => {
//     setState(prev => ({ ...prev, ...updates }));
//   }, []);

//   const logDebug = useCallback((message, data) => {
//     console.log(`[DEBUG] ${message}`, data);
//   }, []);





//   const setupStream = useCallback(async () => {
//     try {
//       logDebug('Setting up stream');
//       if (!streamRef.current) {
//         const newStream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true
//         });
//         streamRef.current = newStream;
//         logDebug('New stream created', newStream);
//         if (myVideoRef.current) {
//           myVideoRef.current.srcObject = newStream;
//           logDebug('Stream set to myVideoRef');
//         } else {
//           logDebug('myVideoRef is not available');
//         }
//       }
//       return streamRef.current;
//     } catch (error) {
//       console.error("Error initializing stream:", error);
//       throw error;
//     }
//   }, [logDebug]);

//   const createPeer = useCallback((initiator, stream) => {
//     logDebug('Creating peer', { initiator, stream });
//     return new Peer({
//       initiator,
//       trickle: false,
//       stream,
//       config: {
//         iceServers: [
//           { urls: 'stun:stun.l.google.com:19302' },
//           { urls: 'stun:global.stun.twilio.com:3478' }
//         ]
//       }
//     });
//   }, [logDebug]);


//   const registerForVideo = useCallback(async (userData) => {
//     return new Promise((resolve, reject) => {
//       socket.emit('register-for-video', userData);
      
//       const timeout = setTimeout(() => {
//         reject(new Error('Registration timeout'));
//       }, 5000);

//       socket.once('video-registration-success', (data) => {
//         clearTimeout(timeout);
//         setIsRegistered(true);
//         updateState({ callInitiatorData: userData });
//         resolve(data);
//       });

//       socket.once('video-registration-error', (error) => {
//         clearTimeout(timeout);
//         reject(new Error(error.message));
//       });
//     });
//   }, [updateState]);



//   const initiateCall = useCallback(async (receiver_id, callerInfo) => {
//     try {
//       if (!isRegistered) {
//         await registerForVideo(callerInfo);
//       }

//       logDebug('Initiating call', { receiver_id, callerInfo });
//       const stream = await setupStream();
//       const peer = createPeer(true, stream);

//       return new Promise((resolve, reject) => {
//         const timeout = setTimeout(() => {
//           reject(new Error('Call initiation timeout'));
//         }, 30000);

//         peer.on('signal', (signalData) => {
//           logDebug('Peer signaling', signalData);
//           socket.emit("initiateCall", {
//             receiver_id,
//             signalData,
//             callerInfo
//           });
//         });

//         peer.on('stream', (remoteStream) => {
//           logDebug('Received remote stream', remoteStream);
//           if (peerVideoRef.current) {
//             peerVideoRef.current.srcObject = remoteStream;
//             logDebug('Remote stream set to peerVideoRef');
//           }
//         });

//         peer.on('error', (err) => {
//           clearTimeout(timeout);
//           reject(err);
//         });

//         socket.once("callAccepted", ({ signalData }) => {
//           clearTimeout(timeout);
//           updateState({ isCallAccepted: true });
//           peer.signal(signalData);
//           resolve();
//         });

//         connectionRef.current = peer;
//       });
//     } catch (error) {
//       console.error("Error in initiate call", error);
//       throw error;
//     }
//   }, [isRegistered, setupStream, createPeer, updateState, logDebug, registerForVideo]);

//   const answerCall = useCallback(async () => {
//     try {
//       logDebug('Answering call');
//       const stream = await setupStream();
//       const peer = createPeer(false, stream);

//       peer.on('signal', (data) => {
//         logDebug('Peer signaling (answer)', data);
//         socket.emit("answerCall", {
//           signalData: data,
//           to: state.incomingCallInfo?.callerData?.user_id,
//         });
//       });

//       peer.on('stream', (remoteStream) => {
//         logDebug('Received remote stream (answer)', remoteStream);
//         if (peerVideoRef.current) {
//           peerVideoRef.current.srcObject = remoteStream;
//           logDebug('Remote stream set to peerVideoRef (answer)');
//         } else {
//           logDebug('peerVideoRef is not available (answer)');
//         }
//       });

//       peer.signal(state.incomingCallInfo.signalData);
//       connectionRef.current = peer;
//       updateState({ isCallAccepted: true, isCallPopupOpen: false, isVisible: true });
//     } catch (error) {
//       console.error("Error in answer call", error);
//     }
//   }, [setupStream, createPeer, state.incomingCallInfo, updateState, logDebug]);

//   const endCall = useCallback(() => {
//     logDebug('Ending call');
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => {
//         track.stop();
//         logDebug('Track stopped', track);
//       });
//     }
//     if (connectionRef.current) {
//       connectionRef.current.destroy();
//       logDebug('Peer connection destroyed');
//     }
//     updateState({
//       isVideoOff: true,
//       isMuted: true,
//       isVisible: false,
//       isFullScreen: false,
//       isCallAccepted: false,
//       callerData: null,
//       incomingCallInfo: {},
//       callInitiatorData: null
//     });
//     socket.emit("endCall", { to: state.incomingCallInfo?.from });
//   }, [updateState, state.incomingCallInfo, logDebug]);

//   const toggleVideo = useCallback(() => {
//     const videoTrack = streamRef.current?.getTracks().find(track => track.kind === "video");
//     if (videoTrack) {
//       videoTrack.enabled = !videoTrack.enabled;
//       updateState({ isVideoOff: !videoTrack.enabled });
//       logDebug('Video toggled', { enabled: videoTrack.enabled });
//     } else {
//       logDebug('No video track found');
//     }
//   }, [updateState, logDebug]);

//   const toggleAudio = useCallback(() => {
//     const audioTrack = streamRef.current?.getTracks().find(track => track.kind === "audio");
//     if (audioTrack) {
//       audioTrack.enabled = !audioTrack.enabled;
//       updateState({ isMuted: !audioTrack.enabled });
//       logDebug('Audio toggled', { enabled: audioTrack.enabled });
//     } else {
//       logDebug('No audio track found');
//     }
//   }, [updateState, logDebug]);

//   useEffect(() => {
//     socket.on("incomingCall", ({ from, signalData, callerData }) => {
//       logDebug('Incoming call', { from, callerData });
//       updateState({
//         incomingCallInfo: { from, signalData, callerData },
//         isCallPopupOpen: true
//       });
//     });

//     socket.on("callEnded", () => {
//       logDebug('Call ended by peer');
//       endCall();
//     });

//     return () => {
//       socket.off("incomingCall");
//       socket.off("callEnded");
//     };
//   }, [endCall, updateState, logDebug]);

//   useEffect(() => {
//     // Clean up registrations and connections on unmount
//     return () => {
//       if (connectionRef.current) {
//         connectionRef.current.destroy();
//       }
//       setIsRegistered(false);
//     };
//   }, []);

//   const value = {
//     ...state,
//     myVideoRef,
//     peerVideoRef,
//     connectionRef,
//     streamRef,
//     updateState,
//     setupStream,
//     initiateCall,
//     answerCall,
//     endCall,
//     toggleVideo,
//     toggleAudio,
//     logDebug,
//     isRegistered,
//     registerForVideo
//   };

//   return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
// };

// export const useCallContext = () => useContext(CallContext);

// export default useCallContext;

