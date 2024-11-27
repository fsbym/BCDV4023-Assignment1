require("@nomiclabs/hardhat-waffle");
// In the root directory: npm install --save-dev @nomicfoundation/hardhat-ethers ethers
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  defaultNetwork: "sepolia",
  solidity: "0.8.4",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_URL,
      accounts: [process.env.METAMASK_ACCOUNT_PRIVATE_KEY],
    },
  },
};
