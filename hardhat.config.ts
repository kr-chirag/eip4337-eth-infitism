import dotEnv from "dotenv";
dotEnv.config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";

const sepoliaAccounts: string[] = [];
for (let i = 1; i <= 5; i++) {
    sepoliaAccounts.push(`${process.env[`ACCOUNT${i}_KEY`]}`);
}

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.28",
        settings: {
            evmVersion: "cancun",
            optimizer: {
                enabled: true,
                runs: 200, // Recommended default; adjust as needed
            },
        },
    },
    networks: {
        sepolia: {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`,
            chainId: 11155111,
            accounts: sepoliaAccounts,
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
