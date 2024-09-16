// Importing necessary modules and functions from Hardhat and Chai for testing
const {
  loadFixture, anyValue
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Describing a test suite for the CollateralizedLoan contract
describe("CollateralizedLoan", function () {
  // A fixture to deploy the contract before each test. This helps in reducing code repetition.
  async function deployCollateralizedLoanFixture() {
    // Deploying the CollateralizedLoan contract and returning necessary variables
    const [borrower, lender] = await ethers.getSigners();
    const CollateralizedLoan = await ethers.getContractFactory("CollateralizedLoan");
    const collateralizedLoan = await CollateralizedLoan.deploy();
    return { collateralizedLoan, borrower, lender };
  }

  // Test suite for the loan request functionality
  describe("Loan Request", function () {
    it("Should let a borrower deposit collateral and request a loan", async function () {
      // Loading the fixture
      const { collateralizedLoan, borrower } = await loadFixture(deployCollateralizedLoanFixture);
      
      const blockTime = (await ethers.provider.getBlock("latest")).timestamp;

      const collateralAmount = ethers.parseEther("1"); // 1 ETH as collateral
      const interestRate = 10; // 10% interest
      const duration = (3 * 24 * 60 * 60); // 3 days in seconds
      const expectedDueDate = blockTime + duration + 1;

      await expect(
        collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount })
      ).to.emit(collateralizedLoan, "LoanRequested")
        .withArgs(0, 
          borrower.address, 
          collateralAmount, 
          collateralAmount, 
          interestRate, 
          expectedDueDate
      ); // Verify event emission

      const loan = await collateralizedLoan.loans(0);
      expect(loan.borrower).to.equal(borrower.address);
      expect(loan.collateralAmount).to.equal(collateralAmount);
    });
  });

  // Test suite for funding a loan
  describe("Funding a Loan", function () {
    it("Allows a lender to fund a requested loan", async function () {
      // Loading the fixture
      const { collateralizedLoan, borrower, lender } = await loadFixture(deployCollateralizedLoanFixture);
      
      const collateralAmount = ethers.parseEther("1"); // 1 ETH as collateral
      const interestRate = 10; // 10% interest
      const duration = 7 * 24 * 60 * 60; // 7 days in seconds

      // Borrower requests a loan
      await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });

      // Lender funds the loan
      await expect(
        collateralizedLoan.connect(lender).fundLoan(0, { value: collateralAmount })
      ).to.emit(collateralizedLoan, "LoanFunded")
        .withArgs(0, lender.address); // Verify event emission

      const loan = await collateralizedLoan.loans(0);
      expect(loan.lender).to.equal(lender.address);
      expect(loan.isFunded).to.equal(true);
    });
  });

  // Test suite for repaying a loan
  describe("Repaying a Loan", function () {
    it("Enables the borrower to repay the loan fully", async function () {
      // Loading the fixture
      const { collateralizedLoan, borrower, lender } = await loadFixture(deployCollateralizedLoanFixture);

      const collateralAmount = ethers.parseEther("1"); // 1 ETH as collateral
      const interestRate = 10; // 10% interest
      const duration = 7 * 24 * 60 * 60; // 7 days in seconds
      const repaymentAmount = ethers.parseEther("1.1"); // Loan + interest (1.1 ETH)

      // Borrower requests a loan
      await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });

      // Lender funds the loan
      await collateralizedLoan.connect(lender).fundLoan(0, { value: collateralAmount });

      // Borrower repays the loan
      await expect(
        collateralizedLoan.connect(borrower).repayLoan(0, { value: repaymentAmount })
      ).to.emit(collateralizedLoan, "LoanRepaid")
        .withArgs(0, repaymentAmount); // Verify event emission

      const loan = await collateralizedLoan.loans(0);
      expect(loan.isRepaid).to.equal(true);
    });
  });

  // Test suite for claiming collateral
  describe("Claiming Collateral", function () {
    it("Permits the lender to claim collateral if the loan isn't repaid on time", async function () {
      // Loading the fixture
      const { collateralizedLoan, borrower, lender } = await loadFixture(deployCollateralizedLoanFixture);

      const collateralAmount = ethers.parseEther("1"); // 1 ETH as collateral
      const interestRate = 10; // 10% interest
      const duration = 7 * 24 * 60 * 60; // 7 days in seconds

      // Borrower requests a loan
      await collateralizedLoan.connect(borrower).depositCollateralAndRequestLoan(interestRate, duration, { value: collateralAmount });

      // Lender funds the loan
      await collateralizedLoan.connect(lender).fundLoan(0, { value: collateralAmount });

      // Simulate time passing (to make loan overdue)
      await ethers.provider.send("evm_increaseTime", [duration + 1]); // Increase time past the due date
      await ethers.provider.send("evm_mine"); // Force block to mine

      // Lender claims collateral
      await expect(
        collateralizedLoan.connect(lender).claimCollateral(0)
      ).to.emit(collateralizedLoan, "CollateralClaimed")
        .withArgs(0, lender.address); // Verify event emission

      const loan = await collateralizedLoan.loans(0);
      expect(loan.isRepaid).to.equal(true); // Collateral claimed marks loan as "repaid"
    });
  });
});
