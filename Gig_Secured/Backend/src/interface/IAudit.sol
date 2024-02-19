// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

interface IAudit {
    struct AuditorContracts {
        address contractInstance;
        uint id;
    }

    function confirmAuditor(address _auditor) external;

    function removeAuditor(address _auditor) external;

    function addGigContractAddresses(address gigSecuredContract) external;

    function increaseAuditorCurrentGigs(
        address _auditor,
        address gigContract,
        uint _gigId
    ) external;

    function decreaseAuditorCurrentGigs(address _auditor) external;

    function getAuditorByCategory(
        string memory category,
        uint ranD
    ) external returns (address);

    function returnSelectedAuditor() external view returns (address);
}
