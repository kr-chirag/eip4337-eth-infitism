import dotEnv from "dotenv";
dotEnv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    defaultNetwork: "sepolia",
    networks: {
        sepolia: {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
            chainId: 11155111,
            accounts: [`${process.env.DEPLOYER_KEY}`],
        },
    },
    verify: {
        etherscan: {
            apiKey: `${process.env.ETHERSCAN_API_KEY}`,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
};

export default config;
