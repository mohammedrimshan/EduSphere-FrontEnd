"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from 'lucide-react';
import Chat from './chat';
import { useSelector } from 'react-redux';

const FloatingChatBot = ({ courseId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useSelector((state) => state.theme.theme);
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-[350px] h-[600px] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold text-lg dark:text-white">Chat Assistant</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5 dark:text-white" />
            </Button>
          </div>
          <div className="flex-grow overflow-hidden">
            <Chat courseId={courseId} />
          </div>
        </div>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full w-16 h-16 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white shadow-lg"
        >
          <MessageCircle className="h-8 w-8" />
        </Button>
      )}
    </div>
  );
};

export default FloatingChatBot;
