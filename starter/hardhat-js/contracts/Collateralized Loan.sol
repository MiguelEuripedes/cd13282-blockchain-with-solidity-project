// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Collateralized Loan Contract
contract CollateralizedLoan {
    // Define the structure of a loan
    struct Loan {
        address borrower;
        address lender;
        uint256 collateralAmount;
        uint256 loanAmount;
        uint256 interestRate;
        uint256 dueDate;
        bool isFunded;
        bool isRepaid;
    }

    // Create a mapping to manage the loans
    mapping(uint => Loan) public loans;
    uint public nextLoanId;

    // Define events for loan requested, funded, repaid, and collateral claimed
    event LoanRequested(uint loanId, address borrower, uint256 collateralAmount, uint256 loanAmount, uint256 interestRate, uint256 dueDate);
    event LoanFunded(uint loanId, address lender);
    event LoanRepaid(uint loanId, uint256 repaymentAmount);
    event CollateralClaimed(uint loanId, address lender);

    // Custom Modifiers
    // Write a modifier to check if a loan exists
    modifier loanExists(uint _loanId){
        require(_loanId < nextLoanId, "Loan does not exist.");
        _;
    }
    // Write a modifier to ensure a loan is not already funded
    modifier notFunded(uint _loanId){
        require(!loans[_loanId].isFunded, "Loan is alredy dunded.");
        _;
    }
    // Modifier created for access control
    modifier onlyBorrower(uint _loanId) {
        require(loans[_loanId].borrower == msg.sender, "Only borrower can perform this action");
        _;
    }

    modifier onlyLender(uint _loanId) {
        require(loans[_loanId].lender == msg.sender, "Only lender can perform this action");
        _;
    }

    // Function to deposit collateral and request a loan
    function depositCollateralAndRequestLoan(uint256 _interestRate, uint256 _duration) external payable {
        // Check if the collateral is more than 0
        require(msg.value > 0, "Collateral value must be greater than 0");
        // Calculate the loan amount based on the collateralized amount
        uint256 loanAmount = msg.value;

        // Create a new loan in the loans mapping
        loans[nextLoanId] = Loan({
            borrower: msg.sender,
            lender: address(0),
            collateralAmount: msg.value,
            loanAmount: loanAmount,
            interestRate: _interestRate,
            dueDate: block.timestamp + _duration,
            isFunded: false,
            isRepaid: false
        });
        

        // Emit an event for loan request
        emit LoanRequested(nextLoanId, msg.sender, msg.value, loanAmount, _interestRate, block.timestamp + _duration);

        // Increment nextLoanId
        nextLoanId++;
    }

    // Function to fund a loan with necessary checks and logic
    function fundLoan(uint _loanId) external payable loanExists(_loanId) notFunded(_loanId){
        Loan storage loan = loans[_loanId];
        require(msg.value == loan.loanAmount, "Incorrect loan amount");

        // Assign lender and mark loan as funded
        loan.lender = msg.sender;
        loan.isFunded = true;

        // Send loan amount to the borrower
        payable(loan.borrower).transfer(loan.loanAmount);

        // Emit an event for loan funding
        emit LoanFunded(_loanId, msg.sender);
    }

    // Function to repay a loan with necessary checks and logic
    function repayLoan(uint _loanId) external payable loanExists(_loanId) onlyBorrower(_loanId) {
        Loan storage loan = loans[_loanId];
        require(loan.isFunded, "Loan is not funded");
        require(!loan.isRepaid, "Loan already repaid");
        require(block.timestamp <= loan.dueDate, "Loan is overdue");

        uint256 repaymentAmount = loan.loanAmount + (loan.loanAmount * loan.interestRate / 100);
        require(msg.value == repaymentAmount, "Incorrect repayment amount");

        // Mark Loan as repaid
        loan.isRepaid = true;

        // Send repayment to the lender
        payable(loan.lender).transfer(repaymentAmount);

        // Return collateral to the borrower
        payable(loan.borrower).transfer(loan.collateralAmount);

        // Emit an event for loan repayment
        emit LoanRepaid(_loanId, msg.value);
    }

    // Function to claim collateral on default with necessary checks and logic
    function claimCollateral(uint _loanId) external loanExists(_loanId) onlyLender(_loanId) {
        Loan storage loan = loans[_loanId];
        require(block.timestamp > loan.dueDate, "Loan is not overdue");
        require(!loan.isRepaid, "Loan already repaid");

        // Mark the loan as completed (collateral claimed)
        loan.isRepaid = true;

        // Transfer collateral to the lender
        payable(loan.lender).transfer(loan.collateralAmount);

        // Emit an event for collateral claim
        emit CollateralClaimed(_loanId, msg.sender);
    }
}