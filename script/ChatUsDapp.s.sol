// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {ChatUsDApp} from "../src/ChatUsDapp.sol";

contract ChatUsDappScript is Script {
    ChatUsDApp public chatUsDapp;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        chatUsDapp = new ChatUsDApp();

        vm.stopBroadcast();
    }
}
