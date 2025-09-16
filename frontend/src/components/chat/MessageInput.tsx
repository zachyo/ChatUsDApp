import React, { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useChatContext } from '@/context/ChatContext';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  isGroupChat?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ isGroupChat = false }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { currentChat, users, currentUser } = useChatContext();
  const { writeContract } = useWriteContract();

  const currentChatUser = users.find(user => user.userAddress === currentChat);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!isGroupChat && !currentChatUser) {
      toast({
        title: "No recipient selected",
        description: "Please select a user to send a message to.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      if (isGroupChat) {
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'sendGroupMessage',
          args: [message.trim()],
        } as any);
      } else if (currentChatUser) {
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'sendMessage',
          args: [currentChatUser.ensName, message.trim()],
        } as any);
      }

      setMessage('');
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Send message error:', error);
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const placeholder = isGroupChat 
    ? "Type a message to the group..." 
    : currentChatUser
      ? `Message ${currentChatUser.displayName}...`
      : "Select a user to start chatting...";

  const isDisabled = isSending || (!isGroupChat && !currentChat);

  return (
    <div className="p-4 border-t border-chat-border bg-chat-surface">
      <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={placeholder}
          disabled={isDisabled}
          className="flex-1 bg-chat-background border-chat-border focus:border-chat-primary"
          maxLength={500}
        />
        <Button
          type="submit"
          variant="chat"
          size="icon"
          disabled={isDisabled || !message.trim()}
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
      {message.length > 400 && (
        <p className="text-xs text-chat-text-muted mt-2 text-center">
          {500 - message.length} characters remaining
        </p>
      )}
    </div>
  );
};

export default MessageInput;