// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

library EscrowUtils {
    // Functions to calculate
    // when there is no conflict

    // function to calculate non-audit fees, calculate 7% of the total price for the gig for the platorm
    function nonAuditFees(uint256 totalAmount) internal pure returns (uint256) {
        return (totalAmount * 7) / 112;
    }

    //function to calculate 10 percent that will be returned to Client if no audit is involved
    function cientNoAudit(uint256 totalAmount) internal pure returns (uint256) {
        return (totalAmount * 10) / 112;
    }

    //function to calculate 95% of the total price and pay it to the frrelancer
    function freeLancerNoAudit(
        uint256 totalAmount
    ) internal pure returns (uint256) {
        return (totalAmount * 95) / 112;
    }

    /// Functions to calculate
    // when audit is involved)
    // function to calculate audit fees, calculate 10% of the total price for the gig
    function auditFees(uint256 totalAmount) internal pure returns (uint256) {
        return (totalAmount * 10) / 100;
    }

    // function to calculate non-audit fees, calculate % of the total price for the gig for the platorm
    function systemAuditFees(
        uint256 totalAmount
    ) internal pure returns (uint256) {
        return (totalAmount * 10) / 100;
    }

    //function to calculate 92% of the total price and pay it to the freelancer when auditing is done
    function freeLancerAudit(
        uint256 totalAmount,
        uint freelancerPercent
    ) internal pure returns (uint256) {
        return (totalAmount * freelancerPercent) / 100;
    }

    function getOrderHash(
        address freeLancer,
        string memory title,
        uint gigContract,
        uint price,
        uint deadline
    ) public pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    freeLancer,
                    title,
                    gigContract,
                    price,
                    deadline
                )
            );
    }

    function getEthSignedOrderHash(
        bytes32 _messageHash
    ) public pure returns (bytes32) {
        /*
        Signature is produced by signing a keccak256 hash with the following format:
        "\x19Ethereum Signed Message\n" + len(msg) + msg
        */
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _messageHash
                )
            );
    }

    function verify(
        address freeLancer,
        string memory title,
        uint gigContract,
        uint price,
        uint deadline,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash = getOrderHash(
            freeLancer,
            title,
            gigContract,
            price,
            deadline
        );
        bytes32 ethSignedOrderHash = getEthSignedOrderHash(messageHash);

        return recoverSigner(ethSignedOrderHash, signature) == freeLancer;
    }

    function recoverSigner(
        bytes32 ethSignedOrderHash,
        bytes memory _signature
    ) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);

        return ecrecover(ethSignedOrderHash, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "invalid signature length");

        assembly {
            /*
            First 32 bytes stores the length of the signature

            add(sig, 32) = pointer of sig + 32
            effectively, skips first 32 bytes of signature

            mload(p) loads next 32 bytes starting at the memory address p into memory
            */

            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }
    }
}
