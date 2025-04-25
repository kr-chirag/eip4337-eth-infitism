import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async (hre: HardhatRuntimeEnvironment) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log("chainId:", await hre.getChainId());
    const demo = await hre.deployments.deploy("MyEntryPoint", {
        from: deployer,
    });
    console.log("MyEntryPoint Deployed at:", demo.address, demo.newlyDeployed);
};
