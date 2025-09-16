import { useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '@/context/ChatContext';
import UserList from '@/components/chat/UserList';
import ChatMessages from '@/components/chat/ChatMessages';
import MessageInput from '@/components/chat/MessageInput';
import GroupChat from '@/components/chat/GroupChat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getIPFSUrl } from '@/lib/ipfs';
import { LogOut, MessageCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const Chat = () => {
  const [tab, setTab] = useState('private');
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const { currentUser, users, currentChat, setCurrentChat } = useChatContext();

  // Redirect to auth if not connected or not registered
  useEffect(() => {
    if (!isConnected || (isConnected && currentUser && !currentUser.isRegistered)) {
      navigate('/auth');
    }
  }, [isConnected, currentUser, navigate]);

  // Redirect to auth if not registered
  if (!currentUser?.isRegistered) {
    navigate('/auth');
    return null;
  }
  console.log(tab);

  const currentChatUser = users.find(user => user.userAddress === currentChat);

  return (
    <div className="h-screen flex flex-col bg-chat-background">
      {/* Header */}
      <header className="bg-chat-surface border-b border-chat-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-chat-text">Lunar Chat</h1>
              <p className="text-sm text-chat-text-muted">Decentralized Messaging</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 border border-chat-border">
                <AvatarImage 
                  src={getIPFSUrl(currentUser.profileImageHash)} 
                  alt={currentUser.displayName}
                />
                <AvatarFallback className="bg-chat-primary text-white text-xs">
                  {currentUser.displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-chat-text">
                  {currentUser.displayName}
                </p>
                <p className="text-xs text-chat-text-muted">
                  {currentUser.ensName}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                disconnect();
                navigate('/');
              }}
              className="text-chat-text-muted hover:text-chat-text"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - User List */}
        <div className="w-80 hidden md:block">
          <UserList />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="private" className="flex-1 flex flex-col" onValueChange={tab => setTab(tab)}>
            <div className="border-b border-chat-border bg-chat-surface px-4">
              <TabsList className="bg-transparent">
                <TabsTrigger 
                  value="private" 
                  className="data-[state=active]:bg-chat-primary data-[state=active]:text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Private Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="group"
                  className="data-[state=active]:bg-chat-primary data-[state=active]:text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Group Chat
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="private" className={cn("flex-1 flex flex-col m-0", {
              "hidden": tab !== "private"
            })}>
              {/* Private Chat Header */}
              {currentChatUser && (
                <div className="bg-chat-surface p-4 border-b border-chat-border">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-chat-border">
                      <AvatarImage 
                        src={getIPFSUrl(currentChatUser.profileImageHash)} 
                        alt={currentChatUser.displayName}
                      />
                      <AvatarFallback className="bg-chat-primary text-white">
                        {currentChatUser.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-chat-text">
                        {currentChatUser.displayName}
                      </h3>
                      <p className="text-sm text-chat-text-muted">
                        {currentChatUser.ensName}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages */}
              <ChatMessages />

              {/* Input */}
              <MessageInput />
            </TabsContent>

            {tab === "group" && (
              <TabsContent value="group" className="flex-1 flex flex-col m-0">
                <GroupChat />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Mobile User List */}
        <div className="w-80 md:hidden">
          <UserList />
        </div>
      </div>
    </div>
  );
};

export default Chat;