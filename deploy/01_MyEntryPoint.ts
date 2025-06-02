import { HardhatRuntimeEnvironment } from "hardhat/types";

export default async (hre: HardhatRuntimeEnvironment) => {
    const { deployer } = await hre.getNamedAccounts();
    console.log({deployer});
    const demo = await hre.deployments.deploy("MyEntryPoint", {
        from: deployer,
    });
    console.log("MyEntryPoint Deployed at:", demo.address, demo.newlyDeployed);
};
