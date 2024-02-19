// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console2, console} from "forge-std/Test.sol";
import {Audit} from "../src/Audit.sol";

contract CounterTest is Test {
    Audit public audit;
    address _governance;
    address _auditorAddr;
    address _auditorAddr2;
    address _auditorAddr3;
    address _auditorAddr4;
    address _gigContract;

    Audit.Auditor _newAuditor;

    function setUp() public {
        _governance = address(0x0234);
        _auditorAddr = address(1);
        _auditorAddr2 = address(2);
        _auditorAddr3 = address(3);
        _auditorAddr4 = address(4);
        _gigContract = address(5);
        audit = new Audit();
    }

    function testConfirmAuditor() public {
        // Create an auditor
        // address auditor = address(1);
        vm.startPrank(_auditorAddr);
        audit.becomeAuditor("category", "email");
        vm.stopPrank();

        // Confirm the auditor
        audit.confirmAuditor(_auditorAddr);

        bool auditorConfirmed = audit.checkAuditorStatus(_auditorAddr);
        // Check that the auditor is confirmed
        // assertEq(Audit.auditor_(_auditorAddr).isConfirmed);
        assertTrue(auditorConfirmed);
    }

    function createAuditor(
        address auditor,
        string memory category,
        string memory email
    ) public {
        vm.startPrank(auditor);
        audit.becomeAuditor(category, email);
        vm.stopPrank();
    }

    function confirmAuditor(address auditor, uint256 confirmationTime) public {
        vm.warp(confirmationTime);
        audit.confirmAuditor(auditor);
    }

    function testgetAuditor() public {
        vm.startPrank(_auditorAddr);
        audit.becomeAuditor("free", "email");
        vm.stopPrank();
        vm.startPrank(_auditorAddr2);
        audit.becomeAuditor("free", "email");
        vm.stopPrank();
        vm.startPrank(_auditorAddr3);
        audit.becomeAuditor("writing", "email");
        vm.stopPrank();
        vm.startPrank(_auditorAddr4);
        audit.becomeAuditor("writing", "email");
        vm.stopPrank();

        // Confirm the auditor
        audit.confirmAuditor(_auditorAddr);
        audit.confirmAuditor(_auditorAddr2);
        audit.confirmAuditor(_auditorAddr3);
        audit.confirmAuditor(_auditorAddr4);

        audit.getAuditorByCategory(
            "writing",
            25209736735244536545235326535323438424
        );
        // address s = audit.selectedAuditor();
        // audit.increaseAuditorCurrentGigs(s, address(0x233), 1);

        // audit.getAuditorByCategory(
        //     "writing",
        //     25209736735244536545235326535323438424
        // );
        // address l = audit.selectedAuditor();
        // audit.increaseAuditorCurrentGigs(l, address(0x234), 1);

        // audit.getAuditorByCategory(
        //     "free",
        //     25209736735244536545235326535323438424
        // );
        // address h = audit.selectedAuditor();
        // audit.increaseAuditorCurrentGigs(h, address(0x235), 1);
        // audit.getAuditorByCategory(
        //     "free",
        //     25209736735244536545235326535323438424
        // );
        // address p = audit.selectedAuditor();
        // audit.increaseAuditorCurrentGigs(p, address(0x236), 1);
    }
}
