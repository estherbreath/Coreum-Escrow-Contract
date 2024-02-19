// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

contract MultiSig {
    struct Transaction {
        address spender;
        uint amount;
        uint numberOfApproval;
        bool isActive;
    }
    address[] Admins;
    uint constant MINIMUM = 3;
    uint transactionId;

    mapping(address => bool) isAdmin;
    mapping(uint => Transaction) transaction;
    mapping(uint => mapping(address => bool)) hasApproved;

    error InvalidAddress(uint position);
    error InvalidAdminNumber(uint number);
    error duplicate(address _addr);

    event Create(address who, address spender, uint amount);

    modifier onlyAdmin() {
        require(isAdmin[msg.sender], "Not a Valid Admin");
        _;
    }

    constructor(address[] memory _admins) payable {
        if (_admins.length < MINIMUM) {
            revert InvalidAdminNumber(MINIMUM);
        }
        for (uint i = 0; i < _admins.length; i++) {
            if (_admins[i] == address(0)) {
                revert InvalidAddress(i + 1);
            }
            if (isAdmin[_admins[i]]) {
                revert duplicate(_admins[i]);
            }

            isAdmin[_admins[i]] = true;
        }
        Admins = _admins;
    }

    function createTransaction(
        uint amount,
        address _spender
    ) external onlyAdmin {
        transactionId++;
        Transaction storage _transaction = transaction[transactionId];
        _transaction.amount = amount;
        _transaction.spender = _spender;
        _transaction.isActive = true;
        emit Create(msg.sender, _spender, amount);
        AprroveTransaction(transactionId);
    }

    function AprroveTransaction(uint id) public onlyAdmin {
        //check if addmin has not approved yet;
        require(!hasApproved[id][msg.sender], "Already Approved!!");
        hasApproved[id][msg.sender] = true;

        Transaction storage _transaction = transaction[id];

        require(_transaction.isActive, "Not active");

        _transaction.numberOfApproval += 1;
        uint count = _transaction.numberOfApproval;
        uint MinApp = calculateMinimumApproval();
        if (count >= MinApp) {
            sendtransaction(id);
        }
    }

    function sendtransaction(uint id) internal {
        Transaction storage _transaction = transaction[id];
        payable(_transaction.spender).transfer(_transaction.amount);
        _transaction.isActive = false;
    }

    function calculateMinimumApproval() public view returns (uint MinApp) {
        uint size = Admins.length;
        MinApp = (size * 70) / 100;
    }

    function getTransaction(
        uint id
    ) external view returns (Transaction memory) {
        return transaction[id];
    }

    receive() external payable {}
}
