// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IAudit} from "./interface/IAudit.sol";
import {Audit} from "./Audit.sol";
import {USDC} from "./USDC.sol";
import {IGigSecured} from "./interface/IGigSecured.sol";
import {GigSecured} from "./GigSecured.sol";

/**
 * @title GigContractFactory
 * @dev A smart contract that acts as a factory for creating GigSecured contracts. Each GigSecured contract
 * represents a secure gig or task, and the factory allows for their creation and management.
 */
contract GigContractFactory {
    /**
     * @dev STATE VARIABLES
     */
    address[] _gigSecuredContracts; // An array to store the addresses of created GigSecured contracts.
    address _auditorsContract; // The address of the auditors contract.
    address _usdcContract; // The address of the USDC (stablecoin) contract.
    address _owner; // The address of the contract owner.
    mapping(address => address) _creatorContractAddress; // A mapping to track the existence of GigSecured contracts.
    mapping(address => bool) _gigContractExist; // A mapping to track the existence of GigSecured contracts.
    mapping(address => bool) _freelancerExist; // A mapping to track the existence of GigSecured contracts.
    mapping(address => Freelance) _freelancerDetails; // A mapping to track the existence of GigSecured contracts.
    mapping(address => bool) _haveCreated; // A mapping to track the existence of GigSecured contracts.

    event GigContractCreated(address indexed creator, address indexed factory);

    struct Freelance {
        address freelancer;
        uint currentGigs;
        FreelancerContracts[] contractsAddress;
    }

    struct FreelancerContracts {
        address contractInstance;
        uint id;
    }

    struct Register {
        address creator;
        address register;
    }

    Register[] allregisters;

    /**
     * @dev Error: NotOwner
     * An error to be used when an unauthorized user attempts an action that only the owner is allowed to perform.
     */
    error NotOwner();

    /**
     * @dev Error: InvalidContract
     * An error to be used when an invalid contract address is encountered.
     */
    error InvalidContract();

    error ZeroAddress();

    /**
     * @dev Constructor
     * @param auditorsContractAddress The address of the auditors contract to be used.
     * @param usdcContractAddress The address of the USDC (stablecoin) contract to be used.
     * Initializes the factory with the owner and contract addresses.
     */
    constructor(address auditorsContractAddress, address usdcContractAddress) {
        _owner = msg.sender;
        _usdcContract = usdcContractAddress;
        _auditorsContract = auditorsContractAddress;
    }

    /**
     * @dev Modifier: onlyOwner
     * Reverts the transaction if the sender is not the owner of the contract.
     */
    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert NotOwner();
        }
        _;
    }

    modifier onlyPermittedAccounts() {
        bool isGigContract = _gigContractExist[msg.sender];
        require(
            _owner == msg.sender || isGigContract,
            "Only Owner or Gig Contract Owner"
        );
        _;
    }

    /**
     * @dev Creates a new GigSecured contract instance.
     * @return newGigSecuredContract The newly created GigSecured contract instance.
     *
     * This function allows the owner to create a new GigSecured contract instance. It initializes the new
     * contract with the provided addresses for the auditors contract, the factory contract itself, and the USDC
     * (stablecoin) contract. The newly created contract address is added to the list of created contracts,
     * and its existence is recorded in the `_gigContractExist` mapping. Additionally, the address of the new
     * contract is registered with the auditors contract using the `addGigContractAddresses` function.
     *
     * Emits a `GigContractCreated` event to indicate the creation of the new GigSecured contract instance,
     * with the owner as the creator and the new contract's address.
     */

    function createGigSecuredContractInstance()
        external
        returns (GigSecured newGigSecuredContract)
    {
        require(_haveCreated[msg.sender] == false, "Already Created");
        newGigSecuredContract = new GigSecured(
            _auditorsContract,
            address(this),
            _usdcContract
        );
        allregisters.push(Register(msg.sender, address(newGigSecuredContract)));
        _haveCreated[msg.sender] = true;
        _creatorContractAddress[msg.sender] = address(newGigSecuredContract);
        _gigSecuredContracts.push(address(newGigSecuredContract));
        _gigContractExist[address(newGigSecuredContract)] = true;
        IAudit(_auditorsContract).addGigContractAddresses(
            address(newGigSecuredContract)
        );
        emit GigContractCreated(_owner, address(newGigSecuredContract));
    }

    /**
     * @dev Confirms an auditor.
     * @param _auditor The address of the auditor to be confirmed.
     *
     * This function allows the owner to confirm an auditor by calling the `confirmAuditor` function
     * from the auditors contract (`IAudit` interface). The provided `_auditor` address is passed as a parameter
     * to confirm their status as an auditor. Only the owner is permitted to perform this action.
     */
    function confirmAnAuditor(address _auditor) external onlyOwner {
        IAudit(_auditorsContract).confirmAuditor(_auditor);
    }

    /**
     * @dev Removes an auditor.
     * @param _auditor The address of the auditor to be removed.
     *
     * This function allows the owner to remove an auditor by calling the `removeAuditor` function
     * from the auditors contract (`IAudit` interface). The provided `_auditor` address is passed as a parameter
     * to revoke their status as an auditor. Only the owner is permitted to perform this action.
     */
    function removeAnAuditor(address _auditor) external onlyOwner {
        IAudit(_auditorsContract).removeAuditor(_auditor);
    }

    /**
     * @dev Increases the number of gigs assigned to an auditor.
     * @param _auditor The address of the auditor for whom the number of assigned gigs will be increased.
     *
     * This function allows the owner to increase the number of gigs assigned to a specific auditor. The address
     * of the auditor is provided as the `_auditor` parameter. The implementation details for increasing the
     * gigs assigned to the auditor should be handled within the `IAudit` contract or its associated interface.
     * Only the owner is allowed to execute this function.
     */

    function decreaseAuditorGigs(address _auditor) external onlyOwner {
        IAudit(_auditorsContract).decreaseAuditorCurrentGigs(_auditor);
    }

    function increaseFreelancerCurrentGigs(
        address _freelancer,
        address _gigContract,
        uint _gigId
    ) external onlyPermittedAccounts {
        if (_freelancer == address(0)) {
            revert ZeroAddress();
        }
        Freelance storage freelancerToEdit = _freelancerDetails[_freelancer];
        freelancerToEdit.freelancer = _freelancer;
        freelancerToEdit.currentGigs += 1;

        FreelancerContracts memory _freelancerContract;
        _freelancerContract.contractInstance = _gigContract;
        _freelancerContract.id = _gigId;

        freelancerToEdit.contractsAddress.push(_freelancerContract);
    }

    /**
     * @dev Decreases the number of gigs assigned to an auditor.
     * @param _auditor The address of the auditor for whom the number of assigned gigs will be decreased.
     *
     * This function allows the owner to decrease the number of gigs assigned to a specific auditor. The address
     * of the auditor is provided as the `_auditor` parameter. The implementation details for decreasing the
     * gigs assigned to the auditor should be handled within the `IAudit` contract or its associated interface.
     * Only the owner is allowed to execute this function.
     */
    // function decreaseAnAuditorGigs(address _auditor) external onlyOwner {
    //     IAudit(_auditorsContract).removeAuditor(_auditor);
    // }

    /**
     * @dev Forcibly closes a GigSecured contract by governance.
     * @param gigContractAddress The address of the GigSecured contract to be forcibly closed.
     * @param gigContractId The identifier of the specific gig within the contract to be closed.
     *
     * This function allows the owner to forcibly close a GigSecured contract by invoking the
     * `forceClosure` function on the specified `gigContractAddress` with the provided `gigContractId`.
     * Prior to initiating the closure, the function checks if the contract exists based on the `_gigContractExist`
     * mapping. If the contract doesn't exist, it reverts with the 'InvalidContract' error.
     * Only the owner is authorized to execute this function.
     */
    function forceClosureByGovernance(
        address gigContractAddress,
        uint gigContractId
    ) external onlyOwner {
        if (_gigContractExist[gigContractAddress] == false) {
            revert InvalidContract();
        }
        IGigSecured(gigContractAddress).forceClosure(gigContractId);
    }

    /**
     * @dev Sends payment in case an audit doesn't settle as expected.
     * @param gigContractAddress The address of the GigSecured contract associated with the gig.
     * @param gigContractId The identifier of the specific gig within the contract.
     * @param percentToAward The percentage of payment to award in case of a settlement issue.
     *
     * This function allows the owner to send a payment to a GigSecured contract by invoking the
     * `sendPaymentAfterAuditorSettle` function on the specified `gigContractAddress` with the provided
     * `gigContractId` and the `percentToAward`. It is typically used when an audit settlement does not
     * proceed as expected. Before sending the payment, the function checks if the contract exists based on
     * the `_gigContractExist` mapping. If the contract doesn't exist, it reverts with the 'InvalidContract' error.
     * Only the owner is authorized to execute this function.
     */
    function sendPaymentIncaseAuditDoesnt(
        address gigContractAddress,
        uint gigContractId,
        uint percentToAward
    ) external onlyOwner {
        if (_gigContractExist[gigContractAddress] == false) {
            revert InvalidContract();
        }
        IGigSecured(gigContractAddress).sendPaymentAfterAuditorSettle(
            gigContractId,
            percentToAward
        );
    }

    function getCreatorSystem(
        address creator
    ) external view returns (address _gigCreatorSystem) {
        _gigCreatorSystem = _creatorContractAddress[creator];
    }

    function getAllRegisters()
        external
        view
        returns (Register[] memory _allRegisters)
    {
        _allRegisters = allregisters;
    }

    function getFreelancerDetails(
        address freelancer
    ) external view returns (Freelance memory freelancerDetails) {
        freelancerDetails = _freelancerDetails[freelancer];
    }

    function withdraw(address payable _to, uint amount) external onlyOwner {
        uint bal = address(this).balance;
        require(bal >= amount, "Insufficient funds");
        (bool sent, ) = _to.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
}
