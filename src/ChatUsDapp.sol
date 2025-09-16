// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ChatUsDApp {
    string constant ENS_DOMAIN = ".lunar";
    
    struct User {
        string ensName;
        string displayName;
        string profileImageHash;
        address userAddress;
        bool isRegistered;
    }
    
    struct Message {
        address from;
        address to;
        string content;
        uint256 timestamp;
        bool isGroupMessage;
    }
    
    mapping(address => User) public users;
    mapping(string => address) public ensToAddress;
    mapping(string => bool) public ensExists;
    mapping(bytes32 => Message[]) public chatMessages;
    
    address[] public registeredAddresses;
    
    event UserRegistered(address indexed userAddress, string ensName, string displayName);
    event MessageSent(address indexed from, address indexed to, string content, uint256 timestamp);
    event GroupMessageSent(address indexed from, string content, uint256 timestamp);
    
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }
    
    function registerUser(
        string memory _displayName,
        string memory _profileImageHash
    ) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(bytes(_displayName).length > 0, "Display name cannot be empty");
        
        string memory fullENSName = string(abi.encodePacked(_displayName, ENS_DOMAIN));
        require(!ensExists[fullENSName], "ENS name already taken");
        
        users[msg.sender] = User({
            ensName: fullENSName,
            displayName: _displayName,
            profileImageHash: _profileImageHash,
            userAddress: msg.sender,
            isRegistered: true
        });
        
        ensToAddress[fullENSName] = msg.sender;
        ensExists[fullENSName] = true;
        registeredAddresses.push(msg.sender);
        
        emit UserRegistered(msg.sender, fullENSName, _displayName);
    }
    
    function isDisplayNameAvailable(string memory _displayName) external view returns (bool) {
        string memory fullENSName = string(abi.encodePacked(_displayName, ENS_DOMAIN));
        return !ensExists[fullENSName];
    }
    
    function sendMessage(string memory _ensName, string memory _content) external onlyRegistered {
        address recipient = ensToAddress[_ensName];
        require(recipient != address(0), "ENS not found");
        require(users[recipient].isRegistered, "Recipient not registered");
        require(bytes(_content).length > 0, "Message cannot be empty");
        
        bytes32 chatId = getChatId(msg.sender, recipient);
        
        Message memory newMessage = Message({
            from: msg.sender,
            to: recipient,
            content: _content,
            timestamp: block.timestamp,
            isGroupMessage: false
        });
        
        chatMessages[chatId].push(newMessage);
        emit MessageSent(msg.sender, recipient, _content, block.timestamp);
    }
    
    function sendGroupMessage(string memory _content) external onlyRegistered {
        require(bytes(_content).length > 0, "Message cannot be empty");
        
        bytes32 groupChatId = keccak256("GROUP_CHAT");
        
        Message memory newMessage = Message({
            from: msg.sender,
            to: address(0),
            content: _content,
            timestamp: block.timestamp,
            isGroupMessage: true
        });
        
        chatMessages[groupChatId].push(newMessage);
        emit GroupMessageSent(msg.sender, _content, block.timestamp);
    }    
    
    function getMessagesByENS(string memory _ensName1, string memory _ensName2) external view returns (Message[] memory) {
        address user1 = ensToAddress[_ensName1];
        address user2 = ensToAddress[_ensName2];
        require(user1 != address(0), "User One not found");
        require(user2 != address(0), "User Two not found");
        
        bytes32 chatId = getChatId(user1, user2);
        return chatMessages[chatId];
    }
    
    function getGroupMessages() external view returns (Message[] memory) {
        bytes32 groupChatId = keccak256("GROUP_CHAT");
        return chatMessages[groupChatId];
    }
    
    function getAllUsers() external view returns (User[] memory) {
        User[] memory allUsers = new User[](registeredAddresses.length);
        for (uint i = 0; i < registeredAddresses.length; i++) {
            allUsers[i] = users[registeredAddresses[i]];
        }
        return allUsers;
    }
    
    function searchUserByDisplayName(string memory _displayName) external view returns (User memory) {
        string memory fullENSName = string(abi.encodePacked(_displayName, ENS_DOMAIN));
        address userAddress = ensToAddress[fullENSName];
        require(userAddress != address(0), "User not found");
        return users[userAddress];
    }
    
    function resolve(string memory _ensName) external view returns (address) {
        return ensToAddress[_ensName];
    }
    
    function getChatId(address _user1, address _user2) internal pure returns (bytes32) {
        if (_user1 < _user2) {
            return keccak256(abi.encodePacked(_user1, _user2));
        } else {
            return keccak256(abi.encodePacked(_user2, _user1));
        }
    }
}