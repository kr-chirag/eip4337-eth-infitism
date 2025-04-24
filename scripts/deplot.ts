import { deployments, ethers, network } from "hardhat";

const entryPointAddr = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108";

async function main() {
    const signers = await ethers.getSigners();
    const rpcUrl = (network.config as { url: string }).url;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const [signer] = signers;

    // console.log(rpcUrl);
    signers.map((s, idx) => console.log(idx, s.address));
}

main().catch(console.error);
