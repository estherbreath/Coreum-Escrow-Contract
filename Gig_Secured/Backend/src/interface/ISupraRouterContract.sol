// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.19;

interface ISupraRouterContract {
    function generateRequest(
        string memory _functionSig,
        uint8 _rngCount,
        uint256 _numConfirmations,
        uint256 _clientSeed
    ) external returns (uint256);
}
