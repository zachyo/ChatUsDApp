import { useState } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, MessageSquare } from 'lucide-react';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';

const GroupChat = () => {
  const { groupMessages } = useChatContext();

  return (
    <div className="h-full flex flex-col bg-chat-surface border-l border-chat-border">
      {/* Group Header */}
      <div className="p-4 border-b border-chat-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-hero rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-chat-text">Lunar Chat Global</h2>
            <p className="text-sm text-chat-text-muted">
              {groupMessages.length} messages
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ChatMessages isGroupChat={true} />

      {/* Message Input */}
      <MessageInput isGroupChat={true} />
    </div>
  );
};

export default GroupChat;