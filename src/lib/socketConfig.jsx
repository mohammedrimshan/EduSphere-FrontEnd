import React, { useEffect, useCallback, useState, createContext, useContext } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [incomingCall, setIncomingCall] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [CallPopupOpen,setIsCallPopupOpen]=useState(false)
  useEffect(() => {
    const socketInstance = io( 'https://edusphere-backend.rimshan.in:5000', {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      forceNew: true,
      autoConnect: true,
    });

    const handleConnect = () => {
      console.log('Socket Connected:', socketInstance.id);
      setIsConnected(true);
      // Change register to register-for-video
      if (localStorage.getItem('userId')) {
        socketInstance.emit('register-for-video', {
          userId: localStorage.getItem('userId'),
          role: localStorage.getItem('userRole') || 'student' // Add role
        });
      }
    };
  
    // Add video registration handlers
    socketInstance.on('video-registration-success', (data) => {
      console.log('Video registration successful:', data);
      // Store the registration state
      socketInstance.isVideoRegistered = true;
    });
  
    socketInstance.on('video-registration-error', (error) => {
      console.error('Video registration failed:', error);
      setLastError(error.message);
    });

    const handleDisconnect = (reason) => {
      console.log('Socket Disconnected:', reason);
      setIsConnected(false);
      setOnlineUsers(new Map());
    };

    const handleError = (error) => {
      console.error('Socket Error:', error);
      setLastError(error.message);
    };

// In socketConfig.jsx
const handleIncomingCall = (data) => {
  console.log('Socket received incoming call:', data);
  
  if (data?.fromUserId && data?.signalData) {
    setIncomingCall({
      from: data.fromUserId,
      signalData: data.signalData,
      callerData: data.callerData || {} // Include caller data if available
    });
    setIsCallPopupOpen(true);
  }
};

const handleUserStatusChange = (data) => {
  console.log('User status change:', data);
  setOnlineUsers(prev => {
    const newMap = new Map(prev);
    newMap.set(data.userId, { 
      isOnline: data.isOnline, 
      role: data.role 
    });
    return newMap;
  });
};

    
    socketInstance.on('connect', handleConnect);
    socketInstance.on('disconnect', handleDisconnect);
    socketInstance.on('connect_error', handleError);
    socketInstance.on('user-status-change', handleUserStatusChange);
    socketInstance.on('incomingCall', handleIncomingCall);
    socketInstance.on('callError', (error) => setLastError(error.message));
    socketInstance.on('user-status-change', (data) => {
      setOnlineUsers(prev => {
        const newMap = new Map(prev);
        newMap.set(data.userId, { 
          isOnline: data.isOnline, 
          socketId: data.socketId,
          role: data.role 
        });
        return newMap;
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect', handleConnect);
      socketInstance.off('disconnect', handleDisconnect);
      socketInstance.off('connect_error', handleError);
      socketInstance.off('incomingCall', handleIncomingCall);
      socketInstance.off('callError');
      socketInstance.off('user-status-change');
      socketInstance.off('user-status-change', handleUserStatusChange);
      socketInstance.disconnect();
    };
  }, []);

  const initiateCall = useCallback((receiverId, signalData, callerInfo = {}) => {
    if (!socket?.connected) {
      setLastError('Socket not connected');
      return;
    }
  
    // Prevent initiating call if one is in progress
    if (incomingCall) {
      setLastError('Cannot initiate call while handling incoming call');
      return;
    }
  
    const payload = {
      receiver_id: receiverId,
      signalData,
      from: socket.id,
      callerData: {
        userId: callerInfo.userId || socket.id,
        name: callerInfo.name || 'Unknown',
        avatar: callerInfo.avatar,
      }
    };
  console.log(payload,"checking Paylosd")
    socket.emit('initiateCall', payload);
  }, [socket, incomingCall]);
  
  const answerCall = useCallback((callerUserId, signalData) => {
    if (!socket?.connected) {
      setLastError('Socket not connected');
      return;
    }

    socket.emit('answerCall', {
      toUserId: callerUserId,
      signalData,
    });
    console.log(toUserId,"DAAAAAAAAAAAAAAAAAAAAAAAAA")
  }, [socket]);

  const endCall = useCallback((receiverId) => {
    if (socket?.connected) {
      socket.emit('endCall', { receiverId });
    }
  }, [socket]);


  const joinChatRoom = useCallback((chatId) => {
    if (socket && isConnected && chatId) {
      socket.emit('join-room', chatId);
    }
  }, [socket, isConnected]);

  const requestUserStatus = useCallback((userId) => {
    if (socket && isConnected) {
      socket.emit('request-user-status', { userId });
    }
  }, [socket, isConnected]);


  const emitUserOnline = useCallback((userId, role) => {
    if (socket?.connected) {
      console.log('Emitting register-for-video:', { userId, role });
      socket.emit('register-for-video', { userId, role });
      localStorage.setItem('userId', userId);
      localStorage.setItem('userRole', role);
    }
  }, [socket]);

  const leaveChatRoom = useCallback((chatId) => {
    if (socket?.connected) {
      console.log('Leaving chat room:', chatId);
      socket.emit('leave-chat-room', chatId);
    }
  }, [socket]);
  const value = {
    socket,
    isConnected,
    onlineUsers,
    incomingCall,
    lastError,
    leaveChatRoom,
    joinChatRoom ,
    requestUserStatus ,
    initiateCall,
    answerCall,
    endCall,
    emitUserOnline,
    setIncomingCall,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
