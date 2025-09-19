// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

contract ChatUsDApp is AutomationCompatibleInterface {
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
        bool isPriceUpdate;
    }

    struct PriceData {
        int256 btcUsd;
        int256 ethUsd;
        int256 btcEth;
        uint8 btcUsdDecimals;
        uint8 ethUsdDecimals;
        uint8 btcEthDecimals;
        uint256 lastUpdated;
    }

    // Chainlink price feed addresses for Sepolia
    AggregatorV3Interface internal btcUsdPriceFeed;
    AggregatorV3Interface internal ethUsdPriceFeed;
    AggregatorV3Interface internal btcEthPriceFeed;

    // Automation configuration
    uint256 public priceUpdateInterval = 6 hours;
    uint256 public lastPriceUpdate;

    mapping(address => User) public users;
    mapping(string => address) public ensToAddress;
    mapping(string => bool) public ensExists;
    mapping(bytes32 => Message[]) public chatMessages;

    address[] public registeredAddresses;
    PriceData public currentPrices;

    event UserRegistered(
        address indexed userAddress,
        string ensName,
        string displayName
    );
    event MessageSent(
        address indexed from,
        address indexed to,
        string content,
        uint256 timestamp
    );
    event GroupMessageSent(
        address indexed from,
        string content,
        uint256 timestamp
    );
    event PriceUpdateSent(
        uint256 timestamp,
        int256 btcUsd,
        int256 ethUsd,
        int256 btcEth
    );

    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    constructor() {
        // Sepolia testnet price feed addresses
        btcUsdPriceFeed = AggregatorV3Interface(
            0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43
        ); // BTC/USD
        ethUsdPriceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        ); // ETH/USD
        btcEthPriceFeed = AggregatorV3Interface(
            0x5fb1616F78dA7aFC9FF79e0371741a747D2a7F22
        ); // BTC/ETH

        lastPriceUpdate = block.timestamp;
    }

    function getLatestPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (int256, uint8) {
        try priceFeed.latestRoundData() returns (
            uint80 /* roundId */,
            int256 price,
            uint256 /* startedAt */,
            uint256 /* timeStamp */,
            uint80 /* answeredInRound */
        ) {
            uint8 decimals = priceFeed.decimals();
            return (price, decimals);
        } catch {
            return (0, 8);
        }
    }

    /**
     * @dev Chainlink Automation checkUpkeep function
     */
    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory /* performData */)
    {
        upkeepNeeded =
            (block.timestamp - lastPriceUpdate) >= priceUpdateInterval;
        return (upkeepNeeded, "");
    }

    /**
     * @dev Chainlink Automation performUpkeep function
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        require(
            (block.timestamp - lastPriceUpdate) >= priceUpdateInterval,
            "Upkeep not needed"
        );
        _updatePrices();
    }

    function updatePrices() external {
        _updatePrices();
    }

    function _updatePrices() internal {
        // Get raw price data from Chainlink
        (int256 btcUsdPrice, uint8 btcUsdDecimals) = getLatestPrice(
            btcUsdPriceFeed
        );
        (int256 ethUsdPrice, uint8 ethUsdDecimals) = getLatestPrice(
            ethUsdPriceFeed
        );
        (int256 btcEthPrice, uint8 btcEthDecimals) = getLatestPrice(
            btcEthPriceFeed
        );

        // Store raw prices
        currentPrices = PriceData({
            btcUsd: btcUsdPrice,
            ethUsd: ethUsdPrice,
            btcEth: btcEthPrice,
            btcUsdDecimals: btcUsdDecimals,
            ethUsdDecimals: ethUsdDecimals,
            btcEthDecimals: btcEthDecimals,
            lastUpdated: block.timestamp
        });

        // Create simple price update message with raw values
        string memory priceMessage = string(
            abi.encodePacked(
                "PRICE_UPDATE|",
                toString(uint256(btcUsdPrice)),
                "|",
                toString(btcUsdDecimals),
                "|",
                toString(uint256(ethUsdPrice)),
                "|",
                toString(ethUsdDecimals),
                "|",
                toString(uint256(btcEthPrice)),
                "|",
                toString(btcEthDecimals),
                "|",
                toString(block.timestamp)
            )
        );

        // Send to group chat
        bytes32 groupChatId = keccak256("GROUP_CHAT");

        Message memory priceUpdateMessage = Message({
            from: address(this),
            to: address(0),
            content: priceMessage,
            timestamp: block.timestamp,
            isGroupMessage: true,
            isPriceUpdate: true
        });

        chatMessages[groupChatId].push(priceUpdateMessage);
        lastPriceUpdate = block.timestamp;

        emit PriceUpdateSent(
            block.timestamp,
            btcUsdPrice,
            ethUsdPrice,
            btcEthPrice
        );
        emit GroupMessageSent(address(this), priceMessage, block.timestamp);
    }

    function getCurrentPrices() external view returns (PriceData memory) {
        return currentPrices;
    }

    // Helper function to convert uint to string
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // Existing functions...

    function registerUser(
        string memory _displayName,
        string memory _profileImageHash
    ) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(bytes(_displayName).length > 0, "Display name cannot be empty");

        string memory fullENSName = string(
            abi.encodePacked(_displayName, ENS_DOMAIN)
        );
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

    function sendMessage(
        string memory _ensName,
        string memory _content
    ) external onlyRegistered {
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
            isGroupMessage: false,
            isPriceUpdate: false
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
            isGroupMessage: true,
            isPriceUpdate: false
        });

        chatMessages[groupChatId].push(newMessage);
        emit GroupMessageSent(msg.sender, _content, block.timestamp);
    }

    function getMessagesByENS(
        string memory _ensName1,
        string memory _ensName2
    ) external view returns (Message[] memory) {
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

    function getChatId(
        address _user1,
        address _user2
    ) internal pure returns (bytes32) {
        if (_user1 < _user2) {
            return keccak256(abi.encodePacked(_user1, _user2));
        } else {
            return keccak256(abi.encodePacked(_user2, _user1));
        }
    }
}
