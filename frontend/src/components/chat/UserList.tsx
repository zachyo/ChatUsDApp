import { useChatContext } from '@/context/ChatContext';
import { getIPFSUrl } from '@/lib/ipfs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users } from 'lucide-react';

const UserList = () => {
  const { users, setCurrentChat, currentChat, currentUser } = useChatContext();

  const handleUserClick = (userAddress: string) => {
    if (userAddress === currentUser?.userAddress) return;
    setCurrentChat(userAddress);
  };

  return (
    <div className="h-full flex flex-col bg-chat-surface border-r border-chat-border">
      <div className="p-4 border-b border-chat-border">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-chat-primary" />
          <h2 className="font-semibold text-chat-text">Users</h2>
        </div>
        <p className="text-sm text-chat-text-muted">{users.length} members online</p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {users.map((user) => (
            <div
              key={user.userAddress}
              onClick={() => handleUserClick(user.userAddress)}
              className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-chat-surface-elevated ${
                currentChat === user.userAddress
                  ? 'bg-chat-primary/10 border border-chat-primary/20'
                  : 'hover:bg-chat-surface-elevated'
              } ${
                user.userAddress === currentUser?.userAddress
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-chat-border">
                    <AvatarImage 
                      src={getIPFSUrl(user.profileImageHash)} 
                      alt={user.displayName}
                    />
                    <AvatarFallback className="bg-chat-primary text-white">
                      {user.displayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-chat-success border-2 border-chat-surface rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-chat-text truncate">
                      {user.displayName}
                    </p>
                    {user.userAddress === currentUser?.userAddress && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-chat-text-muted truncate">
                    {user.ensName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserList;