import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/lib/socketConfig";
import { useAuth } from "@/Context/AuthContext";
import axiosInterceptor from "@/axiosInstance";
import moment from "moment";
import { Send ,Smile} from 'lucide-react';
import { Button } from "@/components/ui/button"
import {toast} from 'sonner';
import { UploadMenu } from '@/ui/uploadMenu';
import EmojiPicker from "emoji-picker-react";
import { useSelector } from 'react-redux';
const UserChatComponent = ({ tutorId }) => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [tutorInfo, setTutorInfo] = useState({ name: "", isOnline: false, tutor_image: "" });
  const [isTutorTyping, setIsTutorTyping] = useState(false);
  const { socket, isConnected, emitUserOnline, joinChatRoom, requestUserStatus } = useSocket();
  const { user, setUser } = useAuth();
  const messagesEndRef = useRef(null);
  const lastSentMessageRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const theme = useSelector((state) => state.theme.theme);

  useEffect(() => {
    if (user && tutorId) {
      console.log('UserChatComponent: Initializing with user and tutorId', { userId: user.id, tutorId });
      fetchOrCreateChat();
      fetchTutorInfo();
    }
  }, [user, tutorId]);

  useEffect(() => {
    if (socket && chat) {
      console.log('UserChatComponent: Setting up socket listeners', { chatId: chat._id });
      socket.on("receive-message", handleNewMessage);
      socket.on("tutor-typing", handleTutorTyping);
      socket.on("tutor-stop-typing", () => setIsTutorTyping(false));
      socket.on("user-status-change", handleUserStatusChange);
      socket.on("self-status-change", handleSelfStatusChange);

      joinChatRoom(chat._id);
      requestUserStatus(tutorId);
      emitUserOnline(user.id, 'user');

      return () => {
        console.log('UserChatComponent: Cleaning up socket listeners');
        socket.off("receive-message", handleNewMessage);
        socket.off("tutor-typing", handleTutorTyping);
        socket.off("tutor-stop-typing");
        socket.off("user-status-change", handleUserStatusChange);
        socket.off("self-status-change", handleSelfStatusChange);
      };
    }
  }, [socket, chat, tutorId, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const fetchOrCreateChat = async () => {
    try {
      setLoading(true);
      const url = `/user/student/chats/${user.id}?role=user&tutorId=${tutorId}`;
      console.log('UserChatComponent: Fetching or creating chat', { url });
      const response = await axiosInterceptor.get(url);
      if (response.data && response.data.length > 0) {
        console.log('UserChatComponent: Existing chat found', { chatId: response.data[0]._id });
        setChat(response.data[0]);
        fetchMessages(response.data[0]._id);
      } else {
        console.log('UserChatComponent: Creating new chat');
        const newChatResponse = await axiosInterceptor.post("/user/student/chat/create", {
          newChatDetails: {
            user_id: user.id,
            tutor_id: tutorId,
          },
          role: "user",
        });
        console.log('UserChatComponent: New chat created', { chatId: newChatResponse.data._id });
        setChat(newChatResponse.data);
        fetchMessages(newChatResponse.data._id);
      }
    } catch (error) {
      console.error("UserChatComponent: Error fetching or creating chat:", error);
      toast.error("Failed to load chat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTutorInfo = async () => {
    try {
      console.log('UserChatComponent: Fetching tutor info', { tutorId });
      const response = await axiosInterceptor.get(`/user/tutor-info/${tutorId}`);
      console.log(response.data,"TTTTTTTTTTTTTTTTT")
      console.log('UserChatComponent: Tutor info fetched', response.data);
      setTutorInfo({
        name: response.data.full_name,
        isOnline: response.data.is_online,
        tutor_image: response.data.tutor_image,
      });
    } catch (error) {
      console.error("UserChatComponent: Error fetching tutor info:", error);
      setTutorInfo({ name: "Unknown Tutor", isOnline: false, tutor_image: "" });
      toast.error("Failed to load tutor information.");
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      console.log('UserChatComponent: Fetching messages', { chatId });
      const response = await axiosInterceptor.get(`/user/student/messages/${chatId}`);
      const uniqueMessages = response.data.filter(
        (msg, index, self) => index === self.findIndex((m) => m._id === msg._id)
      );
      console.log('UserChatComponent: Messages fetched', { messageCount: uniqueMessages.length });
      setMessages(uniqueMessages);
    } catch (error) {
      console.error("UserChatComponent: Error fetching messages:", error);
      toast.error("Failed to load messages. Please try again.");
    }
  };

  const handleNewMessage = useCallback(
    (data) => {
      console.log('UserChatComponent: New message received', data);
      if (data.chat && data.chat._id === chat?._id) {
        if (lastSentMessageRef.current && lastSentMessageRef.current._id === data.message._id) {
          console.log('UserChatComponent: Duplicate message, ignoring');
          return;
        }

        setMessages((prevMessages) => {
          const isDuplicate = prevMessages.some((msg) => msg._id === data.message._id);
          if (!isDuplicate) {
            if (data.message.sender_id !== user.id) {
              console.log('UserChatComponent: Marking message as read', { messageId: data.message._id });
              axiosInterceptor.post("/user/student/message/read", {
                message_id: data.message._id,
                chat_id: chat._id,
              });
            }
            return [
              ...prevMessages,
              { ...data.message, is_read: data.message.sender_id === user.id },
            ];
          }
          return prevMessages;
        });
      }
    },
    [chat, user.id]
  );

  const handleTutorTyping = useCallback(() => {
    console.log('UserChatComponent: Tutor is typing');
    setIsTutorTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      console.log('UserChatComponent: Tutor stopped typing');
      setIsTutorTyping(false);
    }, 2000);
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chat || (!newMessage.trim() && !attachment)) return;

    try {
      console.log('UserChatComponent: Sending message', { chatId: chat._id, hasAttachment: !!attachment });
      const formData = new FormData();
      formData.append("chat_id", chat._id);
      formData.append("sender_id", user.id);
      formData.append("receiver_id", tutorId);

      if (newMessage.trim()) {
        formData.append("message", newMessage.trim());
      }

      if (attachment) {
        formData.append("file", attachment);
      }

      const response = await axiosInterceptor.post("/user/student/message", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log('UserChatComponent: Message sent successfully', response.data);
      lastSentMessageRef.current = response.data;

      setMessages((prevMessages) => {
        const isDuplicate = prevMessages.some((msg) => msg._id === response.data._id);
        return isDuplicate ? prevMessages : [...prevMessages, response.data];
      });

      setNewMessage("");
      setAttachment(null);

      if (socket && isConnected) {
        console.log('UserChatComponent: Emitting send-message event', { chatId: chat._id });
        socket.emit("send-message", {
          chat: { _id: chat._id },
          message: response.data,
        });
      }
    } catch (error) {
      console.error("UserChatComponent: Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const handleUpload = async (file) => {
    try {
      // Validate file
      if (!file) {
        throw new Error('No file selected');
      }
  
      // Log file details for debugging
      console.log('Upload file details:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      });
  
      // Determine upload URL based on file type
      const uploadType = file.type.startsWith('image/') 
        ? 'image'
        : file.type.startsWith('video/') 
        ? 'video'
        : 'raw';
  
      const uploadUrl = `https://api.cloudinary.com/v1_1/edusphere/${uploadType}/upload`;
  
      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "edusphere");
      formData.append("cloud_name", "edusphere");
  
      // Perform upload
      const response = await fetch(uploadUrl, {
        method: "POST", 
        body: formData 
      });
  
      // Check response status
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Cloudinary upload error:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorData
        });
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
  
      // Parse response
      const data = await response.json();
  
      // Validate upload result
      if (!data.secure_url) {
        throw new Error("No secure URL returned from Cloudinary");
      }
  
      // Log successful upload
      console.log('File uploaded successfully', { 
        fileUrl: data.secure_url,
        publicId: data.public_id 
      });
  
      // Prepare and send message
      const messageFormData = new FormData();
      messageFormData.append("chat_id", chat._id);
      messageFormData.append("sender_id", user.id);
      messageFormData.append("receiver_id", tutorId);
      messageFormData.append("file_url", data.secure_url);
  
      const messageResponse = await axiosInterceptor.post("/user/student/message", messageFormData);
  
      // Update messages state
      setMessages(prevMessages => {
        const isDuplicate = prevMessages.some(msg => msg._id === messageResponse.data._id);
        return isDuplicate ? prevMessages : [...prevMessages, messageResponse.data];
      });
  
      // Emit socket event if connected
      if (socket && isConnected) {
        socket.emit("send-message", {
          chat: { _id: chat._id },
          message: messageResponse.data,
        });
      }
  
      return data.secure_url;
    } catch (error) {
      console.error("Detailed upload error:", {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
  
      // User-friendly error toast
      toast.error(error.message || "Failed to upload file. Please try again.");
      
      throw error;
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleUserStatusChange = useCallback((data) => {
    console.log("UserChatComponent: Status change received:", data);
    if (data.userId === tutorId) {
      setTutorInfo(prev => ({
        ...prev, 
        isOnline: data.isOnline
      }));
    }
    if (data.userId === user.id) {
      setUser(prevUser => ({ ...prevUser, isOnline: data.isOnline }));
    }
  }, [tutorId, user.id, setUser]);

  const handleSelfStatusChange = useCallback((data) => {
    console.log("UserChatComponent: Self status change:", data);
    if (data.userId === user.id) {
      setUser(prevUser => ({ ...prevUser, isOnline: data.isOnline }));
    }
  }, [user.id, setUser]);

  const handleTyping = () => {
    if (socket && isConnected) {
      console.log('UserChatComponent: Emitting student-typing event', { chatId: chat._id });
      socket.emit("student-typing", { chat_id: chat._id });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-300 dark:border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gradient-to-r from-green-700 to-green-400 dark:from-green-900 dark:to-green-600 p-4 flex items-center rounded-t-lg">
        <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 p-1 mr-3 overflow-hidden">
          <img
            src={tutorInfo.tutor_image || "/default-tutor.png"}
            alt="Tutor"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div>
          <h2 className="font-bold text-white text-lg">{tutorInfo.name}</h2>
          <span className={`text-sm ${tutorInfo.isOnline ? "text-green-200" : "text-gray-300"}`}>
            {tutorInfo.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 dark:bg-gray-800 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="text-xl font-semibold">No messages yet</p>
            <p className="text-sm">Start the conversation with your tutor!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.sender_id === user.id;
            return (
              <div
                key={message._id || index}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-end ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  <img
                    src={isUser ? (user.profileImage || "/default-user.png") : (tutorInfo.tutor_image || "/default-tutor.png")}
                    alt={isUser ? "User" : "Tutor"}
                    className="w-8 h-8 rounded-full mx-2 object-cover"
                  />
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isUser 
                        ? "bg-green-500 dark:bg-green-600 text-white" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="break-words">{message.message_text}</p>
                    {message.file_url && (
                      <div className="mt-2">
                        {message.file_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={message.file_url}
                            alt="Shared image"
                            className="rounded-lg object-cover max-w-full h-auto"
                          />
                        ) : message.file_url.match(/\.(mp4|webm)$/i) ? (
                          <video
                            controls
                            className="rounded-lg max-w-full h-auto"
                            src={message.file_url}
                          />
                        ) : (
                          <a
                            href={message.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline dark:text-green-300"
                          >
                            Attached File
                          </a>
                        )}
                      </div>
                    )}
                    <div className="text-[11px] mt-1 text-gray-600 dark:text-gray-300">
                      {moment(message.createdAt).fromNow()}
                      {message.is_read && isUser && (
                        <span className="ml-1 text-green-300">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isTutorTyping && (
          <div className="flex items-start space-x-2">
            <img
              src={tutorInfo.tutor_image || "/default-tutor.png"}
              alt="Tutor"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg px-4 py-2 flex items-center">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-typing-pulse"></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-typing-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-typing-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4 rounded-b-lg">
        <form onSubmit={sendMessage} className="flex items-center space-x-2">
          <div className="relative">
            <Smile 
              className="h-6 w-6 text-gray-500 dark:text-gray-400 cursor-pointer" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full left-0 mb-2 z-50 ">
                <div className="shadow-lg rounded-lg ">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={theme === 'dark' ? 'dark' : 'light'}
                  />
                </div>
              </div>
            )}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          />
          <UploadMenu onUpload={handleUpload} />
          <Button
            type="submit"
            disabled={!newMessage.trim() && !attachment}
            className="px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-full hover:bg-green-600 dark:hover:bg-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="h-5 w-5" />
            Send
          </Button>
        </form>
        {attachment && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            File attached: {attachment.name}
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChatComponent;
