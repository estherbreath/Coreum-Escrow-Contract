// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IGigSecured {
    function forceClosure(uint gigId) external;

    function sendPaymentAfterAuditorSettle(
        uint gigId,
        uint freelancerPercent
    ) external;
}
