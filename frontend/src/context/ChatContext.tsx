import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '@/lib/contract';

export interface User {
  ensName: string;
  displayName: string;
  profileImageHash: string;
  userAddress: string;
  isRegistered: boolean;
}

export interface Message {
  from: string;
  to: string;
  content: string;
  timestamp: bigint;
  isGroupMessage: boolean;
}

interface ChatState {
  users: User[];
  groupMessages: Message[];
  privateMessages: Record<string, Message[]>;
  currentChat: string | null;
  currentUser: User | null;
  isLoading: boolean;
}

interface ChatContextType extends ChatState {
  setCurrentChat: (chatId: string | null) => void;
  addGroupMessage: (message: Message) => void;
  addPrivateMessage: (message: Message) => void;
  setUsers: (users: User[]) => void;
  setCurrentUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

type ChatAction =
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_CURRENT_CHAT'; payload: string | null }
  | { type: 'ADD_GROUP_MESSAGE'; payload: Message }
  | { type: 'ADD_PRIVATE_MESSAGE'; payload: Message }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GROUP_MESSAGES'; payload: Message[] }
  | { type: 'SET_PRIVATE_MESSAGES'; payload: Record<string, Message[]> };

const initialState: ChatState = {
  users: [],
  groupMessages: [],
  privateMessages: {},
  currentChat: null,
  currentUser: null,
  isLoading: false,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_CURRENT_CHAT':
      return { ...state, currentChat: action.payload };
    case 'ADD_GROUP_MESSAGE':
      if (state.groupMessages.some(m => m.timestamp === action.payload.timestamp && m.from === action.payload.from)) {
        return state; // Avoid duplicates
      }
      return {
        ...state,
        groupMessages: [...state.groupMessages, action.payload],
      };
    case 'ADD_PRIVATE_MESSAGE':
      const chatKey = [action.payload.from, action.payload.to].sort().join('-');
      const chatMessages = state.privateMessages[chatKey] || [];
      if (chatMessages.some(m => m.timestamp === action.payload.timestamp && m.from === action.payload.from)) {
        return state; // Avoid duplicates
      }
      return {
        ...state,
        privateMessages: {
          ...state.privateMessages,
          [chatKey]: [...chatMessages, action.payload],
        },
      };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_GROUP_MESSAGES':
        return { ...state, groupMessages: action.payload };
    case 'SET_PRIVATE_MESSAGES':
        return { ...state, privateMessages: action.payload };
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { address } = useAccount();

  // Fetch all users
  const { data: users } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getAllUsers',
  });

  // Fetch current user data
  const { data: currentUserData, refetch : refetchUser } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'users',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Fetch group messages
  const { data: groupMessagesData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getGroupMessages',
    query: { enabled: !!state.currentUser?.isRegistered }
  });

  // Fetch private messages for the current user with all other users
  const contractsForPrivateMessages = useMemo(() => {
    if (state.currentUser && state.currentUser.isRegistered && state.users.length > 0 && state.currentUser.ensName) {
      return state.users
        .filter(user => user.userAddress !== state.currentUser!.userAddress && user.ensName)
        .map(user => ({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getMessagesByENS',
          args: [state.currentUser!.ensName!, user.ensName!].sort(),
        }));
    }
    return [];
  }, [state.currentUser, state.users]);

  const { data: privateMessagesData } = useReadContracts({
    contracts: contractsForPrivateMessages,
    query: {
      enabled: contractsForPrivateMessages.length > 0,
    }
  });

  console.log(currentUserData)

  // Watch for user registration events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'UserRegistered',
    onLogs(logs) {
      // Refetch users when new user registers
      console.log('New user registered:', logs);
      refetchUser()
    },
  });

  // Watch for group messages
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'GroupMessageSent',
    onLogs(logs) {
      logs.forEach((log) => {
        const message: Message = {
          from: log.args.from!,
          to: '0x0000000000000000000000000000000000000000',
          content: log.args.content!,
          timestamp: log.args.timestamp!,
          isGroupMessage: true,
        };
        dispatch({ type: 'ADD_GROUP_MESSAGE', payload: message });
      });
    },
  });

  // Watch for private messages
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    eventName: 'MessageSent',
    onLogs(logs) {
      logs.forEach((log) => {
        const message: Message = {
          from: log.args.from!,
          to: log.args.to!,
          content: log.args.content!,
          timestamp: log.args.timestamp!,
          isGroupMessage: false,
        };
        dispatch({ type: 'ADD_PRIVATE_MESSAGE', payload: message });
      });
    },
  });

  // Update users when data changes
  useEffect(() => {
    if (users && Array.isArray(users)) {
      dispatch({ type: 'SET_USERS', payload: users as User[] });
    }
  }, [users]);

  // Update group messages when data changes
  useEffect(() => {
    if (groupMessagesData && Array.isArray(groupMessagesData)) {
      const messages = groupMessagesData.map((m: any) => ({
        from: m.from,
        to: m.to,
        content: m.content,
        timestamp: m.timestamp,
        isGroupMessage: m.isGroupMessage,
      }));
      dispatch({ type: 'SET_GROUP_MESSAGES', payload: messages });
    }
  }, [groupMessagesData]);

  // Update private messages when data changes
  useEffect(() => {
    if (privateMessagesData) {
      const allMessages: Message[] = privateMessagesData
        .filter(result => result.status === 'success' && result.result)
        .flatMap(result => (result.result as Message[]).map((m: any) => ({
          from: m.from,
          to: m.to,
          content: m.content,
          timestamp: m.timestamp,
          isGroupMessage: m.isGroupMessage,
        })));

      const privateMessages: Record<string, Message[]> = {};
      allMessages.forEach(message => {
        const chatKey = [message.from, message.to].sort().join('-');
        if (!privateMessages[chatKey]) {
          privateMessages[chatKey] = [];
        }
        privateMessages[chatKey].push(message);
      });
      dispatch({ type: 'SET_PRIVATE_MESSAGES', payload: privateMessages });
    }
  }, [privateMessagesData]);

  // Update current user when data changes
  useEffect(() => {
    if (currentUserData && currentUserData[4]) { // isRegistered is at index 4
      dispatch({ 
        type: 'SET_CURRENT_USER', 
        payload: {
          ensName: currentUserData[0],
          displayName: currentUserData[1],
          profileImageHash: currentUserData[2],
          userAddress: currentUserData[3],
          isRegistered: currentUserData[4],
        }
      });
    } else {
      dispatch({ type: 'SET_CURRENT_USER', payload: null });
    }
  }, [currentUserData]);

  const setCurrentChat = useCallback((chatId: string | null) => {
    dispatch({ type: 'SET_CURRENT_CHAT', payload: chatId });
  }, []);

  const addGroupMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_GROUP_MESSAGE', payload: message });
  }, []);

  const addPrivateMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_PRIVATE_MESSAGE', payload: message });
  }, []);

  const setUsers = useCallback((users: User[]) => {
    dispatch({ type: 'SET_USERS', payload: users });
  }, []);

  const setCurrentUser = useCallback((user: User | null) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const value: ChatContextType = {
    ...state,
    setCurrentChat,
    addGroupMessage,
    addPrivateMessage,
    setUsers,
    setCurrentUser,
    setLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};