"use client";

import React from 'react';
import { Message } from '@/types/message';
import { format } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
  currentUserId?: string | null;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, currentUserId }) => {
  const isOwnMessage = message.senderId === currentUserId;
  
  const formattedTime = format(new Date(message.createdAt), 'h:mm a');
  const formattedDate = format(new Date(message.createdAt), 'MMM d, yyyy');
  const isToday = format(new Date(message.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  
  const displayTime = isToday ? formattedTime : `${formattedDate} ${formattedTime}`;

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isOwnMessage
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-gray-100 dark:bg-muted text-foreground rounded-bl-sm border border-gray-200 dark:border-border'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground">
          {message.content}
        </p>
        <p
          className={`text-xs mt-2 ${
            isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
          }`}
        >
          {displayTime}
        </p>
      </div>
    </div>
  );
};

