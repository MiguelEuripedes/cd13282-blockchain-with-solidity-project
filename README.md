# Project: Collateralized Loan Smart Contract Development

In this project, I aimed to develop, deploy, and interact with a simple collateralized loan contract on the Ethereum blockchain using Solidity. This contract will manage loans backed by Ethereum as collateral, offering hands-on experience with real-world financial smart contracts.

[Here you can check the Sepolia Etherscan link of the deployed contract.](https://sepolia.etherscan.io/tx/0x7c3b133231df5c56c3e7be445f6a129ea874570da65f5d35f4d434bfe7778d1f)


## Getting Started

This repository was created based on the original Udacity repository. 

You can use the following command to clone the original:

```
git clone Getting https://github.com/udacity/cd13282-blockchain-with-solidity-project

cd cd13282-blockchain-with-solidity-project
```

### Dependencies

I used mostly Hardhat for this project to write, deploy, and test the smart contract. Testing in the Sepolia Testnet, with the help of Infura.

### Installation

If you are using your local environment, head over to `hardhat-js` and install the necessary dependencies using the following command.

```
npm install
```

You will also find a file `.env.example` , you will need to create a `.env` file similar to that.

```
INFURA_API_KEY=
ACCOUNT_PRIVATE_KEY=
```

Add your wallet private key and [infura](https://www.infura.io/) API key.

## Testing

Head over to `test` folder and create a new file to write the tests.

Once you're done creating your test script, you can run the following command: 

```
npx hardhat test
```

### **Project Deliverables**

### 1. Deploy the Smart Contract on Sepolia Testnet

- ✅ Successfully deploy your Collateralized Loan smart contract to the Sepolia testnet. 

### 2. Write the Smart Contract and Hardhat Test Script

- ✅ Develop and finalize the Solidity code for the Collateralized Loan contract.
- ✅ Write comprehensive test scripts using Hardhat to validate the contract's functionalities.

### 3. Etherscan Verification

- ✅ Provide a link to the Sepolia Etherscan page confirming the successful deployment of your contract.
- ✅ The Etherscan link should display the contract address and transaction details on the Sepolia testnet.

### 4. GitHub Repository Link

- ✅ Submit the link to your GitHub repository containing the project.
- The repository should include:
  - ✅ The Solidity smart contract code.
  - ✅ Hardhat test scripts.
  - ✅ A README file containing the Sepolia Etherscan link of the deployed contract

## License

[License](LICENSE.txt)
