import React, { useEffect, useRef } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { getIPFSUrl } from '@/lib/ipfs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessagesProps {
  isGroupChat?: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ isGroupChat = false }) => {
  const { 
    groupMessages, 
    privateMessages, 
    currentChat, 
    users, 
    currentUser 
  } = useChatContext();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = isGroupChat 
    ? groupMessages 
    : currentChat 
      ? privateMessages[
          [currentUser?.userAddress, currentChat].sort().join('-')
        ] || []
      : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getUserInfo = (address: string) => {
    return users.find(user => user.userAddress === address);
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (!isGroupChat && !currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-chat-background">
        <div className="text-center">
          <div className="w-24 h-24 bg-chat-surface rounded-full flex items-center justify-center mb-4 mx-auto border border-chat-border">
            <svg className="w-12 h-12 text-chat-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-chat-text mb-2">Select a user to start chatting</h3>
          <p className="text-chat-text-muted">Choose someone from the user list to begin a private conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-chat-background">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message, index) => {
            const userInfo = getUserInfo(message.from);
            const isCurrentUser = message.from === currentUser?.userAddress;
            const showAvatar = !isCurrentUser && (!messages[index - 1] || messages[index - 1].from !== message.from);
            
            return (
              <div
                key={index}
                className={`flex items-end gap-3 ${
                  isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {!isCurrentUser && showAvatar && (
                  <Avatar className="w-8 h-8 border border-chat-border">
                    <AvatarImage 
                      src={userInfo ? getIPFSUrl(userInfo.profileImageHash) : ''} 
                      alt={userInfo?.displayName}
                    />
                    <AvatarFallback className="bg-chat-primary text-white text-xs">
                      {userInfo?.displayName.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                {!isCurrentUser && !showAvatar && (
                  <div className="w-8" />
                )}

                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-4 py-2 shadow-message ${
                    isCurrentUser
                      ? 'bg-chat-primary text-white rounded-br-md'
                      : 'bg-chat-surface text-chat-text border border-chat-border rounded-bl-md'
                  }`}
                >
                  {!isCurrentUser && showAvatar && isGroupChat && (
                    <p className="text-xs font-medium mb-1 opacity-70">
                      {userInfo?.displayName || 'Unknown'}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed break-words">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-1 ${
                      isCurrentUser ? 'text-white/70' : 'text-chat-text-muted'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
    </div>
  );
};

export default ChatMessages;