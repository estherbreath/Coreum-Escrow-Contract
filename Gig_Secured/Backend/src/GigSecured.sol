// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import {EscrowUtils} from "./library/EscrowLibrary.sol";
import {IAudit} from "./interface/IAudit.sol";
import {IFactory} from "./interface/IFactory.sol";
import {IERC20} from "./interface/IERC20.sol";

/**
 * @title GigSecured
 * @dev This contract manages secured gig contracts, facilitating interactions
  between clients, freelancers, and auditors. It enforces various rules and status
   transitions to ensure the integrity of the gig contract process.
 *
 * @notice The contract emits events to track contract creation, status updates, deadline changes,
  and freelancer updates.
 *
 * @dev The contract assumes the existence of other smart contracts and interfaces,
  including EscrowUtils, IAudit, and IERC20.
 *
 * @author [Author Name]
 * @notice This contract is provided under the MIT License.
 */
contract GigSecured {
    event GigContractCreated(string title, address creator, address freelancer);
    event GigStatusUpdated(uint gigId, Status newStatus);
    event GigDeadlineUpdated(uint gigId, uint newDeadline);
    event GigFreelancerUpdated(
        uint gigId,
        string newFreelancerEmail,
        address newFreelancerAddress
    );

    /**
 * @title GigSecured
 * @dev This contract manages secured gig contracts, providing a platform for clients, 
 freelancers, and auditors to engage in gig-related transactions. It enforces rules, 
 status transitions, and permissions to ensure the integrity of the gig contract process.
 *
 * @notice The contract defines a `GigContract` struct, which encapsulates essential information
  about each gig, such as title, category, client and freelancer details, deadlines, and more. 
  Gigs are tracked using a mapping.
 *
 * @dev The contract also defines a `Status` enum, representing the various stages a gig can be in, 
 including 'Pending,' 'Building,' 'Completed,' 'UnderReview,' 'Dispute,' and 'Closed.'
 *
 * @param _gigs The total number of gig contracts created.
 * @param _governanceAddress The address of the governance authority responsible for contract management.
 * @param _usdcAddress The address of the USDC token contract used for payments.
 * @param _auditContract The address of the IAudit contract responsible for audit functionality.
 */
    struct GigContract {
        string title;
        string category;
        string clientEmail;
        string freelancerEmail;
        address freeLancer;
        bytes freelancerSign;
        string description;
        uint deadline;
        uint completedTime;
        Status _status;
        bool isAudit;
        address auditor;
        uint price;
        address creator;
        uint creationDate;
        string joblink;
    }

    enum Status {
        Pending,
        Building,
        Completed,
        UnderReview,
        Dispute,
        Closed
    }

    uint _gigs;

    address _governanceAddress;
    address _usdcAddress;
    address _auditContract;

    mapping(uint256 => GigContract) private _allGigs;
    GigContract[] _contractGigs;

    error DuplicateEmails();
    error AlreadyInDispute();
    error NotYetCompleted();
    error NotYetReviewed();
    error FreelancerSignedAlready();
    error AtLeastAnHour();
    error InvalidFreelancer(address freeLancer);
    error ZeroAmount();
    error MaxStagesOfDevelopment();
    error NotAssignedFreeLancer();
    error NotPermitted();
    error RemissionFailed();
    error DeadlineInPast(uint newDeadline);
    error NotPendingStatus(Status currentStatus);
    error EmptyTitle();
    error EmptyProjectLink();
    error EmptyCategory();
    error InvalidStatusChange();
    error ContractSettlementTimeNotActive();
    error MustSignBeforeStartBuilding();
    error DeadlineHasPassedForBuilding();
    error DeadlineHasPassedForCompletion();
    error TooSoonToDispute();

    /**
     * @notice Constructor to initialize the GigSecured contract with essential addresses.
     * @param auditContract The address of the IAudit contract for audit functionality.
     * @param governance The address of the governance authority responsible for contract management.
     * @param usdcAddress The address of the USDC token contract used for payments.
     */
    constructor(
        address auditContract,
        address governance,
        address usdcAddress
    ) {
        _governanceAddress = governance;
        _auditContract = auditContract;
        _usdcAddress = usdcAddress;
    }

    /**
 * @dev Modifier to restrict access to clients only.
 * @param gigId The unique identifier of the gig contract to check.
 * @notice It checks whether the sender of the transaction is the creator (client) of the specified 
 gig contract. If not, it raises a "Not Client" error.
 */
    modifier onlyClient(uint gigId) {
        GigContract storage _newGigContract = _allGigs[gigId];
        require(msg.sender == _newGigContract.creator, "Not Client");
        _;
    }

    /**
 * @dev Modifier to restrict access to the governance authority.
 * @notice It checks whether the sender of the transaction is the governance authority's address.
  If not, it raises an "Only Governance" error.
 */
    modifier onlyGovernance() {
        require(msg.sender == _governanceAddress, "Only Governance");
        _;
    }

    /**
 * @dev Modifier to restrict access to permitted accounts (governance or client).
 * @param gigId The unique identifier of the gig contract to check.
 * @notice It checks whether the sender of the transaction is either the governance authority or
  the creator (client) of the specified gig contract. If not, it raises an "Only Governance or Client" error.
 */
    modifier onlyPermittedAccounts(uint gigId) {
        GigContract storage gigContract = _allGigs[gigId];
        require(
            msg.sender == _governanceAddress ||
                gigContract.creator == msg.sender,
            "Only Governance or Client"
        );
        _;
    }

    /**
 * @dev Modifier to restrict access to permitted administrators.
 * @param gigId The unique identifier of the gig contract to check.
 * @notice It checks whether the sender of the transaction is either the governance authority
  or the assigned auditor for the specified gig contract. If not, it raises an "Only Governance or 
  Auditor" error.
 */
    modifier onlyPermittedAdmin(uint gigId) {
        GigContract storage gigContract = _allGigs[gigId];
        require(
            msg.sender == _governanceAddress ||
                gigContract.auditor == msg.sender,
            "Only Governance or Auditor"
        );
        _;
    }

    /**
 * @dev Modifier to restrict access to freelancers only.
 * @param gigId The unique identifier of the gig contract to check.
 * @notice It checks whether the sender of the transaction is the assigned freelancer for the 
 specified gig contract. If not, it raises a "Not Freelancer" error.
 */
    modifier onlyFreelancer(uint gigId) {
        GigContract storage _newGigContract = _allGigs[gigId];
        require(msg.sender == _newGigContract.freeLancer, "Not Freelancer");
        _;
    }

    /**
 * @dev Modifier to restrict access to auditors only.
 * @param gigId The unique identifier of the gig contract to check.
 * @notice It checks whether the sender of the transaction is the assigned auditor for the specified 
 gig contract. If not, it raises a "Not Auditor" error.
 */
    modifier onlyAuditor(uint gigId) {
        GigContract storage _newGigContract = _allGigs[gigId];
        require(msg.sender == _newGigContract.auditor, "Not Auditor");
        _;
    }

    /***
 * @dev Create a new gig contract.
 *
 * @param _title The title of the gig.
 * @param _category The category of the gig.
 * @param _clientSign The client's signature.
 * @param _clientName The name of the client.
 * @param _clientEmail The email of the client.
 * @param _description The description of the gig.
 * @param _deadline The deadline for the gig (in seconds since Unix epoch).
 * @param _price The price of the gig.
 * @param _freelancer The address of the freelancer who will work on the gig.
 *
 * @return gigContract Returns true if the gig contract was created successfully.
 *
 * @dev This function creates a new gig contract, verifies parameters, transfers funds, and emits 
 an event upon success.
 *
 * @notice The deadline must be at least an hour in the future.
 * @notice The _freelancer address must not be the zero address.
 * @notice This function transfers USDC tokens from the sender's account to the gig contract.
 *
 * @param AtLeastAnHour The function reverts if the deadline is less than an hour from the current time.
 * @param InvalidFreelancer The function reverts if the _freelancer address is the zero address.
 * @param RemissionFailed The function reverts if the token transfer fails.
 */
    function addGig(
        string memory _title,
        string memory _category,
        string memory _clientEmail,
        string memory _freelancerEmail,
        string memory _description,
        uint _deadline,
        uint _price,
        address _freelancer
    ) public returns (bool gigContract) {
        if (_deadline < (block.timestamp + 3600)) {
            revert AtLeastAnHour();
        }
        if (
            (keccak256(abi.encode(_freelancerEmail)) ==
                keccak256(abi.encode(_clientEmail)))
        ) {
            revert DuplicateEmails();
        }
        if (_freelancer == address(0) || _freelancer == msg.sender) {
            revert InvalidFreelancer(_freelancer);
        }
        if (_price == 0) {
            revert ZeroAmount();
        }
        bool success = IERC20(_usdcAddress).transferFrom(
            msg.sender,
            address(this),
            _price
        );
        if (!success) {
            revert RemissionFailed();
        }
        _gigs++;
        GigContract storage _newGigContract = _allGigs[_gigs];
        _newGigContract.title = _title;
        _newGigContract.category = _category;
        _newGigContract.clientEmail = _clientEmail;
        _newGigContract.freelancerEmail = _freelancerEmail;
        _newGigContract.description = _description;
        _newGigContract.deadline = _deadline;
        _newGigContract._status = Status.Pending;
        _newGigContract.price = _price;
        _newGigContract.creator = msg.sender;
        _newGigContract.creationDate = block.timestamp;
        _newGigContract.freeLancer = _freelancer;

        IFactory(_governanceAddress).increaseFreelancerCurrentGigs(
            _freelancer,
            address(this),
            _gigs
        );

        _contractGigs.push(_newGigContract);
        gigContract = true;
        emit GigContractCreated(_title, msg.sender, _freelancer);
    }

    /***
 * @dev Freelancer signs the gig contract.
 *
 * @param _freelancerSign The signature provided by the freelancer to sign the gig contract.
 * @param _gigContract The identifier of the gig contract to be signed.
 *
 * @return success Returns true if the gig contract is successfully signed by the freelancer.
 *
 * @dev This function allows the freelancer to sign a gig contract if it has been correctly verified by 
 EscrowUtils.
 *
 * @notice The function reverts if the verification by EscrowUtils fails.
 *
 * @param NotAssignedFreeLancer The function reverts if the freelancer is not assigned to the gig contract.
 */
    function freeLancerSign(
        address freelancer,
        bytes memory _freelancerSign,
        uint _gigContract
    ) external returns (bool success) {
        GigContract storage gigContract = _allGigs[_gigContract];
        bool isVerified = EscrowUtils.verify(
            freelancer,
            gigContract.title,
            _gigContract,
            gigContract.price,
            gigContract.deadline,
            _freelancerSign
        );
        if (!isVerified) {
            revert NotAssignedFreeLancer();
        } else {
            gigContract.freelancerSign = _freelancerSign;
            success = true;
        }
    }

    /***
     * @dev Edit the deadline of a gig contract.
     *
     * @param gigId The identifier of the gig contract to be edited.
     * @param newDeadline The new deadline for the gig contract (in seconds since Unix epoch).
     *
     * @dev This function allows the client to edit the deadline of a pending gig contract.
     *
     * @notice The function reverts if the new deadline is in the past.
     * @notice The function reverts if the gig contract is not in a pending status.
     * @notice The new deadline must be at least an hour in the future.
     *
     * @param DeadlineInPast The function reverts if the new deadline is in the past.
     * @param NotPendingStatus The function reverts if the gig contract is not in a pending status.
     * @param AtLeastAnHour The function reverts if the new deadline is less than an hour from the current time.
     */
    function editGigDeadline(
        uint256 gigId,
        uint256 newDeadline
    ) external onlyClient(gigId) {
        GigContract storage gig = _allGigs[gigId];
        if (newDeadline < block.timestamp) {
            revert DeadlineInPast(newDeadline);
        }
        if (gig._status != Status.Pending) {
            revert NotPendingStatus(gig._status);
        }
        if (newDeadline < (block.timestamp + 3600)) {
            revert AtLeastAnHour();
        }

        gig.deadline = newDeadline;
        emit GigDeadlineUpdated(gigId, newDeadline);
    }

    /***
     * @dev Edit the title of a gig contract.
     *
     * @param gigId The identifier of the gig contract to be edited.
     * @param newTitle The new title for the gig contract.
     *
     * @dev This function allows the client to edit the title of a pending gig contract.
     *
     * @notice The function reverts if the gig contract is not in a pending status.
     * @notice The new title must not be empty.
     *
     * @param NotPendingStatus The function reverts if the gig contract is not in a pending status.
     * @param EmptyTitle The function reverts if the new title is empty.
     */
    function editGigTitle(
        uint gigId,
        string memory newTitle
    ) public onlyClient(gigId) {
        GigContract storage gig = _allGigs[gigId];
        if (gig._status != Status.Pending) {
            revert NotPendingStatus(gig._status);
        }
        if (bytes(newTitle).length == 0) {
            revert EmptyTitle();
        }
        gig.title = newTitle;
    }

    /***
     * @dev Edit the description of a gig contract.
     *
     * @param gigId The identifier of the gig contract to be edited.
     * @param newDescription The new description for the gig contract.
     *
     * @dev This function allows the client to edit the description of a pending gig contract.
     *
     * @notice The function reverts if the gig contract is not in a pending status.
     * @notice The new description must not be empty.
     *
     * @param NotPendingStatus The function reverts if the gig contract is not in a pending status.
     * @param EmptyDescription The function reverts if the new description is empty.
     */
    function editGigDescription(
        uint gigId,
        string memory newDescription
    ) public onlyClient(gigId) {
        GigContract storage gig = _allGigs[gigId];
        if (gig._status != Status.Pending) {
            revert NotPendingStatus(gig._status);
        }
        if (bytes(newDescription).length == 0) {
            revert EmptyProjectLink();
        }
        gig.description = newDescription;
    }

    /***
     * @dev Edit the category of a gig contract.
     *
     * @param gigId The identifier of the gig contract to be edited.
     * @param newCategory The new category for the gig contract.
     *
     * @dev This function allows the client to edit the category of a pending gig contract.
     *
     * @notice The function reverts if the gig contract is not in a pending status.
     * @notice The new category must not be empty.
     *
     * @param NotPendingStatus The function reverts if the gig contract is not in a pending status.
     * @param EmptyCategory The function reverts if the new category is empty.
     */
    function editGigCategory(
        uint gigId,
        string memory newCategory
    ) public onlyClient(gigId) {
        GigContract storage gig = _allGigs[gigId];
        if (gig._status != Status.Pending) {
            revert NotPendingStatus(gig._status);
        }
        if (bytes(newCategory).length == 0) {
            revert EmptyCategory();
        }
        gig.category = newCategory;
    }

    /***
     * @dev Edit the freelancer details of a gig contract.
     *
     * @param gigId The identifier of the gig contract to be edited.
     * @param newFreelancerName The new name of the freelancer.
     * @param newFreelancerEmail The new email of the freelancer.
     * @param newFreelancerAddress The new address of the freelancer.
     *
     * @dev This function allows the client to edit the freelancer details of a pending gig contract.
     *
     * @notice The function reverts if the gig contract is not in a pending status.
     *
     * @param NotPendingStatus The function reverts if the gig contract is not in a pending status.
     */
    // function editGigFreelancer(
    //     uint256 gigId,
    //     string memory newFreelancerEmail,
    //     address newFreelancerAddress
    // ) public onlyClient(gigId) {
    //     GigContract storage gig = _allGigs[gigId];
    //     if (gig._status != Status.Pending) {
    //         revert NotPendingStatus(gig._status);
    //     }
    //     if (gig.freelancerSign.length != 0) {
    //         revert FreelancerSignedAlready();
    //     }
    //     gig.freelancerEmail = newFreelancerEmail;
    //     gig.freeLancer = newFreelancerAddress;
    //     emit GigFreelancerUpdated(
    //         gigId,
    //         newFreelancerEmail,
    //         newFreelancerAddress
    //     );
    // }

    /***
     * @dev Update the status of a gig contract.
     *
     * @param _id The identifier of the gig contract to be updated.
     * @param _status The new status to set for the gig contract.
     *
     * @dev This function allows the creator or freelancer to update the status of a gig contract.
     *
     * @param Status The new status to set for the gig contract. It should be one of the predefined status values.
     */
    function updateGig(
        uint _id,
        Status _status,
        string memory joblink_,
        uint ran
    ) public {
        GigContract storage _newGigContract = _allGigs[_id];
        if (_newGigContract.creator == msg.sender) {
            clientUpdateGig(_status, _id, joblink_, ran);
        }
        if (_newGigContract.freeLancer == msg.sender) {
            freeLancerUpdateGig(_id, _status, joblink_, ran);
        }
    }

    /***
 * @dev Perform the payment and fee distribution for a closed gig contract.
 *
 * @param gigId The identifier of the gig contract for which payment is being processed.
 *
 * @dev This internal function handles payment and fee distribution when a gig contract is closed.
 *
 * It calculates the client's payback fee, our fee, and the freelancer's payback fee based on the gig's 
 price, updates the gig's price to zero, and transfers the fees to the respective parties.
 *
 * @param Payment Failed The function requires that both the client's payback and the freelancer's payment 
 are successful; otherwise, it reverts with the "Payment Failed" message.
 */
    function _sendPaymentClosed(uint gigId) internal {
        GigContract storage gig = _allGigs[gigId];
        uint clientPaybackFee = EscrowUtils.cientNoAudit(gig.price);
        uint ourFee = EscrowUtils.nonAuditFees(gig.price);
        uint freelancerPaybackFee = EscrowUtils.freeLancerNoAudit(gig.price);

        gig.price = 0;

        bool successRemitClient = IERC20(_usdcAddress).transfer(
            gig.creator,
            clientPaybackFee
        );
        bool successPayFreelancer = IERC20(_usdcAddress).transfer(
            gig.freeLancer,
            freelancerPaybackFee
        );
        IERC20(_usdcAddress).transfer(_governanceAddress, ourFee);
        require(successRemitClient && successPayFreelancer, "Payment Failed");
    }

    /***
 * @dev Perform payment and fee distribution after an auditor settles a gig.
 *
 * @param gigId The identifier of the gig contract for which payment is being processed.
 * @param freelancerPercent The percentage of the gig's payment to be allocated to the freelancer.
 *
 * @dev This function handles payment and fee distribution after an auditor settles a gig contract. 
 It calculates fees for the auditor, freelancer, system, and the client, updates the gig's price to zero, 
 and transfers the fees to the respective parties.
 *
 * @notice The freelancerPercent should be within the range of 1 to 92 (inclusive).
 *
 * @param Out of bounds The function reverts if the freelancerPercent is out of the valid range.
 * @param Payment Failed The function requires that both the auditor's payment and the freelancer's payment
  are successful; otherwise, it reverts with the "Payment Failed" message.
 */
    function sendPaymentAfterAuditorSettle(
        uint gigId,
        uint freelancerPercent
    ) external onlyPermittedAdmin(gigId) {
        GigContract storage gig = _allGigs[gigId];
        require(
            freelancerPercent > 0 && freelancerPercent <= 92,
            "Out of bounds"
        );
        gig.price = 0;
        uint auditPaymentFee = EscrowUtils.auditFees(gig.price);
        uint systemPaymentFee = EscrowUtils.systemAuditFees(gig.price);
        uint freelancerPaymentFee = EscrowUtils.freeLancerAudit(
            gig.price,
            freelancerPercent
        );
        uint clientPaybackFee = gig.price -
            (auditPaymentFee + freelancerPaymentFee + systemPaymentFee);

        gig.price = 0;
        gig._status = Status.Closed;

        bool successPayAuditor = IERC20(_usdcAddress).transfer(
            gig.auditor,
            auditPaymentFee
        );
        bool successPayFreelancer = IERC20(_usdcAddress).transfer(
            gig.freeLancer,
            freelancerPaymentFee
        );

        if (clientPaybackFee > 0) {
            IERC20(_usdcAddress).transfer(gig.creator, clientPaybackFee);
        }
        IAudit(_auditContract).decreaseAuditorCurrentGigs(gig.auditor);
        require(successPayAuditor && successPayFreelancer, "Payment Failed");
    }

    /**
 * @dev Assign an auditor based on the specified category.
 *
 * @param category The category for which an auditor is being assigned.
 *
 * @return auditor The address of the assigned auditor.
 *
 * @dev This internal function assigns an auditor by querying the audit contract for an auditor 
 associated with the specified category. It also increments the assigned auditor's current gig count.
 */
    function _assignAuditor(
        string memory category,
        uint gigId,
        uint _rand
    ) internal returns (address) {
        address selectedAuditor;
        selectedAuditor = IAudit(_auditContract).getAuditorByCategory(
            category,
            _rand
        );
        selectedAuditor = IAudit(_auditContract).returnSelectedAuditor();
        IAudit(_auditContract).increaseAuditorCurrentGigs(
            selectedAuditor,
            address(this),
            gigId
        );

        return selectedAuditor;
    }

    /***
 * @dev Update the status of a gig contract by the client.
 *
 * @param newStatus The new status to set for the gig contract.
 * @param gigId The identifier of the gig contract to be updated.
 *
 * @return success Returns true if the gig contract status is successfully updated.
 *
 * @dev This function allows the client to update the status of a gig contract, potentially changing it 
 to "UnderReview," "Closed," or "Dispute."
 *
 * @notice The function reverts if the newStatus is not one of the valid status changes.
 * @notice When changing to "Dispute," it checks if the contract settlement time is active.
 *
 * @param InvalidStatusChange The function reverts if the newStatus is not one of the valid status changes.
 * @param ContractSettlementTimeNotActive The function reverts if changing to "Dispute" and the contract 
 settlement time is not active.
 */
    function clientUpdateGig(
        Status newStatus,
        uint256 gigId,
        string memory _joblink,
        uint ranD
    ) public onlyClient(gigId) returns (bool success) {
        GigContract storage gig = _allGigs[gigId];
        if (
            newStatus != Status.UnderReview &&
            newStatus != Status.Closed &&
            newStatus != Status.Dispute
        ) {
            revert InvalidStatusChange();
        }
        if (newStatus == Status.Closed) {
            if (gig._status < Status.UnderReview) {
                revert NotYetReviewed();
            }
            _sendPaymentClosed(gigId);
        }
        if (newStatus == Status.UnderReview) {
            if (gig._status != Status.Completed) {
                revert NotYetCompleted();
            }
        }
        if (newStatus == Status.Dispute) {
            if (gig._status != Status.UnderReview) {
                revert NotYetReviewed();
            }
            if (gig._status == Status.Dispute) {
                revert AlreadyInDispute();
            }
            gig.isAudit = true;
            gig.joblink = _joblink;
            address _auditor = _assignAuditor(gig.category, gigId, ranD);
            gig.auditor = _auditor;
        }

        gig._status = newStatus;
        success = true;
    }

    /***
     * @dev Update the status of a gig contract by the freelancer.
     *
     * @param gigId The identifier of the gig contract to be updated.
     * @param newStatus The new status to set for the gig contract.
     *
     * @dev This function allows the freelancer to update the status of a gig contract, potentially changing it to "Building," "Completed," or "Dispute."
     *
     * @notice The function reverts if the status change is not valid according to the contract conditions.
     *
     * @param MustSignBeforeStartBuilding The function reverts if trying to set the status to "Building" without signing.
     * @param DeadlineHasPassedForBuilding The function reverts if trying to set the status to "Building" after the deadline has passed.
     * @param DeadlineHasPassedForCompletion The function reverts if trying to set the status to "Completed" after the deadline has passed.
     * @param TooSoonToDispute The function reverts if trying to set the status to "Dispute" before the settlement time.
     * @param InvalidStatusChange The function reverts if the requested status change is not valid.
     */
    function freeLancerUpdateGig(
        uint256 gigId,
        Status newStatus,
        string memory _joblink,
        uint ranD
    ) public onlyFreelancer(gigId) {
        GigContract storage gig = _allGigs[gigId];

        if (newStatus == Status.Building && gig.freelancerSign.length == 0) {
            revert MustSignBeforeStartBuilding();
        }
        if (newStatus == Status.Building && block.timestamp > gig.deadline) {
            revert DeadlineHasPassedForBuilding();
        }
        if (newStatus == Status.Completed && block.timestamp > gig.deadline) {
            revert DeadlineHasPassedForCompletion();
        }
        if (
            newStatus == Status.Dispute &&
            block.timestamp <= gig.completedTime + 259200
        ) {
            revert TooSoonToDispute();
        }
        if (gig._status == Status.Dispute) {
            revert AlreadyInDispute();
        }
        gig._status = newStatus;
        if (newStatus == Status.Completed) {
            gig.completedTime = block.timestamp;
            gig._status = Status.Completed;
        } else if (newStatus == Status.Building) {
            gig._status = Status.Building;
        } else if (newStatus == Status.Dispute) {
            _freeLancerAudit(gigId, ranD);
            gig.joblink = _joblink;
        } else {
            revert InvalidStatusChange();
        }

        emit GigStatusUpdated(gigId, newStatus);
    }

    /**
 * @dev Initiate an audit by assigning an auditor for a gig contract in dispute.
 *
 * @param gigId The identifier of the gig contract for which an audit is initiated.
 *
 * @dev This internal function assigns an auditor for a gig contract in dispute. It marks the 
 contract as audited and sets the status to "Dispute."
 */
    function _freeLancerAudit(uint256 gigId, uint256 _ranD) internal {
        GigContract storage gig = _allGigs[gigId];
        address _auditor = _assignAuditor(gig.category, gigId, _ranD);
        gig.auditor = _auditor;
        gig.isAudit = true;

        gig._status = Status.Dispute;
    }

    /***
 * @dev Force closure of a gig contract under specific conditions.
 *
 * @param gigId The identifier of the gig contract to be forcefully closed.
 *
 * @dev This function allows permitted accounts to forcefully close a gig contract under certain 
 conditions. If the gig is not in "Building" or "Pending" status and the deadline has passed, 
 it closes the gig and transfers the remaining funds to the client.
 *
 * @notice The function reverts if the conditions for force closure are not met.
 *
 * @param NotPermitted The function reverts if the caller is not permitted to force close the gig.
 */
    function forceClosure(uint gigId) external onlyPermittedAccounts(gigId) {
        GigContract storage gig = _allGigs[gigId];
        if (
            gig._status == Status.Pending ||
            (gig._status < Status.Completed && gig.deadline < block.timestamp)
        ) {
            uint priceMinusFee = EscrowUtils.nonAuditFees(gig.price);
            uint gigContractPrice = gig.price;

            gig.price = 0;
            gig._status = Status.Closed;

            IERC20(_usdcAddress).transfer(
                gig.creator,
                (gigContractPrice - priceMinusFee)
            );
        } else {
            revert NotPermitted();
        }
    }

    /**
     * @dev Get the details of a gig contract by its identifier.
     *
     * @param _gigId The identifier of the gig contract to retrieve details for.
     *
     * @return gigContract A struct containing the details of the specified gig contract.
     *
     * @dev This function allows anyone to retrieve the details of a gig contract by providing its identifier.
     */
    function getGig(uint256 _gigId) public view returns (GigContract memory) {
        return _allGigs[_gigId];
    }

    function getGigsCount() public view returns (uint _gigCount) {
        return _gigs;
    }

    function getAllGigs() public view returns (GigContract[] memory) {
        return _contractGigs;
    }
}
