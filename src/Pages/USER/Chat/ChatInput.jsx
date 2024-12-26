import React, { useState } from 'react';
import {Textarea} from '@/components/ui/Textarea';
import {Button} from '@/components/ui/button';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim() !== '') {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="flex space-x-2">
      <Textarea 
        placeholder="Type your message..." 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-grow resize-none text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
        rows={2}
      />
      <Button 
        onClick={handleSend} 
        size="icon" 
        className="self-end dark:bg-gray-700 dark:hover:bg-gray-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 dark:text-white"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </Button>
    </div>
  );
};

export default MessageInput;

