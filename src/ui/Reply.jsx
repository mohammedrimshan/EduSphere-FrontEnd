import React, { useState } from 'react';
import { Reply, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MessageComponent = ({ 
    message, 
    isUser, 
    userImage, 
    otherImage, 
    onReply, 
    onDelete,
    theme, 
    moment,
    isSelected,
    onSelect,
    selectedMessage
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await onDelete(message._id, message.chat_id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Check if this message is referencing a selected message
  const hasReference = message.selectedMessage || message.replyTo;
  const referenceMessage = message.selectedMessage || message.replyTo;

  // Add this check near the top of the component
  const isReferenced = selectedMessage && selectedMessage._id === message._id;

  return (
    <div 
      className={`flex ${isUser ? "justify-end" : "justify-start"} group relative mb-2 ${
        isReferenced ? 'bg-blue-100 dark:bg-blue-900 p-2 rounded-lg' : ''
      }`}
      onClick={() => onSelect && onSelect(message)}
    >
      <div 
        className={`flex items-end ${isUser ? "flex-row-reverse" : "flex-row"} relative max-w-[80%]
          ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2' : ''}`}
      >
        <img
          src={isUser ? userImage : otherImage}
          alt={isUser ? "User" : "Other"}
          className="w-8 h-8 rounded-full object-cover self-end"
        />
        <div className="flex flex-col">
          <div className="flex flex-col">
            {hasReference && (
              <div 
                className={`flex flex-col mb-1 px-3 py-2 border-l-4 rounded-r ${
                  isUser 
                    ? "bg-emerald-600/30 border-emerald-400 text-white" 
                    : "bg-gray-700/30 border-gray-500 dark:text-gray-200"
                }`}
              >
                <span className="text-xs font-medium opacity-75">
                  {referenceMessage.sender_id === (isUser ? "user" : "other") ? "You" : isUser ? "Student" : "Tutor"}
                </span>
                <div className="text-sm opacity-90 truncate">
                  {referenceMessage.message_text}
                </div>
              </div>
            )}
            <div
              className={`rounded-lg px-4 py-2 ${
                isUser 
                  ? "bg-emerald-500 text-white rounded-tr-none" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none"
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
                      className="text-sm underline"
                    >
                      Attached File
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className={`text-[11px] px-4 py-1 flex items-center gap-2 ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}>
            <span className="text-gray-500">{moment(message.createdAt).fromNow()}</span>
            {!message.is_deleted && (
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReply(message);
                  }}
                >
                  <Reply className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const ReplyBar = ({ replyingTo, onCancelReply, theme }) => {
  if (!replyingTo) return null;

  return (
    <div className={`p-2 border-b mb-2 ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-gray-50 border-gray-200'
    } flex items-center justify-between`}>
      <div className="flex items-center space-x-2">
        <Reply className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Replying to: {replyingTo.message_text.substring(0, 50)}
          {replyingTo.message_text.length > 50 ? '...' : ''}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onCancelReply}
        className="h-6 w-6 p-0"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export { MessageComponent, ReplyBar };
