import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async (hre: HardhatRuntimeEnvironment) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("deploying...");

    const demo = await hre.deployments.deploy("MySmartWallet", {
        from: deployer,
        // proxy: {
        //     execute: {
        //         init: {
        //             methodName: "initialize",
        args: [deployer, "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108"],
        //         },
        //     },
        // },
        // args: [],
    });

    console.log("MySmartWallet Deployed at:", demo.address, demo.newlyDeployed);
};
