import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async (hre: HardhatRuntimeEnvironment) => {
    const { deployer } = await hre.getNamedAccounts();
    const entryPointAddr = (await hre.deployments.get("MyEntryPoint")).address;
    console.log("using entry point:", entryPointAddr);
    const demo = await hre.deployments.deploy("MySmartWallet", {
        from: deployer,
        proxy: {
            execute: {
                init: {
                    methodName: "initialize",
                    args: [deployer, entryPointAddr],
                },
            },
            proxyContract: "OpenZeppelinTransparentProxy",
        },
        // log: true
    });
    console.log("MySmartWallet Deployed at:", demo.address, demo.newlyDeployed);
};
