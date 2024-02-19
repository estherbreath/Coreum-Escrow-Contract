// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IFactory {
    function increaseFreelancerCurrentGigs(
        address _auditor,
        address gigContract,
        uint _gigId
    ) external;
}
