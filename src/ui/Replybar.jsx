import React from 'react'
import { X } from 'lucide-react'

export function ReplyBar({ replyingTo, onCancelReply, theme }) {
  if (!replyingTo) return null

  return (
    <div className={`mb-2 p-2 rounded-lg flex items-start justify-between ${
      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
    }`}>
      <div className="flex-1">
        <p className="text-sm text-gray-500">Replying to</p>
        <p className="text-sm truncate">{replyingTo.message_text}</p>
      </div>
      <button
        onClick={onCancelReply}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

