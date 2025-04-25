import { deployments, ethers, network } from "hardhat";
import { MyEntryPoint__factory, MySmartWallet__factory } from "../typechain-types";
import { AddressLike } from "ethers";

const entryPointAddrSepolia = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108";
const rpcUrl = (network.config as { url: string }).url;
const provider = new ethers.JsonRpcProvider(rpcUrl);

async function main() {
    const [owner, receiver, beneficiary, bundler] = await ethers.getSigners();

    const mySmartWalletDeploymet = await deployments.get("MySmartWallet");
    const myEntryPointDeployment = await deployments.get("MyEntryPoint");
    const mySmartWallet = MySmartWallet__factory.connect(mySmartWalletDeploymet.address, owner);
    const myEntryPoint = MyEntryPoint__factory.connect(myEntryPointDeployment.address, bundler);
    // const myEntryPoint = MyEntryPoint__factory.connect(entryPointAddrSepolia, bundler);

    const nonce = await myEntryPoint.getNonce(mySmartWalletDeploymet.address, 0);
    const callData = new ethers.Interface(["function execute(address target, uint256 value, bytes calldata data)"]).encodeFunctionData("execute", [
        receiver.address,
        ethers.parseEther("0.001"),
        "0x",
    ]);
    const verificationGasLimit = ethers.zeroPadValue(ethers.toBeHex(1000_000), 16);
    const callGasLimit = ethers.zeroPadValue(ethers.toBeHex(1000_000), 16);
    const accountGasLimits = verificationGasLimit + callGasLimit.slice(2);
    // console.log(accountGasLimits);
    // console.log(accountGasLimits.length);
    const feeData = await provider.getFeeData();
    console.log(feeData);
    const maxPriorityFeePerGas = ethers.zeroPadValue(ethers.toBeHex(feeData.maxPriorityFeePerGas!), 16);
    const maxFeePerGas = ethers.zeroPadValue(ethers.toBeHex(feeData.maxFeePerGas!), 16);
    const gasFees = maxPriorityFeePerGas + maxFeePerGas.slice(2);
    // console.log(gasFees);
    // console.log(gasFees.length);

    const userOp = {
        sender: mySmartWalletDeploymet.address,
        nonce,
        initCode: "0x",
        callData,
        accountGasLimits,
        preVerificationGas: 50_000,
        gasFees,
        paymasterAndData: "0x",
        signature: "0x",
    };

    if (Number(ethers.formatEther(await provider.getBalance(mySmartWalletDeploymet.address))) < 0.5) {
        console.log("Funding wallet...");
        await (
            await owner.sendTransaction({
                to: mySmartWalletDeploymet.address,
                value: ethers.parseEther("0.5"),
            })
        ).wait();
    }

    const signature = await owner.signMessage(ethers.getBytes("0x123456"));
    userOp.signature = signature;

    const result = await myEntryPoint.simulateValidation(userOp);
    throw result;

    // const userOpHash = await myEntryPoint.getUserOpHash(userOp);

    // const signature = await owner.signMessage(ethers.getBytes(userOpHash));
    // userOp.signature = signature;

    // const ops = [userOp];

    // await logBalances("Before:");
    // console.log("EntryPoint:", await mySmartWallet.entryPoint());

    // const tx = await myEntryPoint.handleOps(ops, beneficiary);
    // const receipt = await tx.wait();
    // await logBalances("after:");

    // console.log("withdraw wallet...");
    // await (await mySmartWallet.withdraw()).wait();
    // await logBalances("withdrawn:");

    async function logBalances(tag: string) {
        console.log(tag);
        await logBalance("\towner", owner.address);
        await logBalance("\treceiver", receiver.address);
        await logBalance("\tbeneficiary", beneficiary.address);
        await logBalance("\tbundler", bundler.address);
        await logBalance("\twallet", mySmartWalletDeploymet.address);
    }
    async function logBalance(name: string, address: AddressLike) {
        console.log(name, "balance:", ethers.formatEther(await provider.getBalance(address)));
    }
}

main().catch((e) => {
    console.error(e);
    const errorData = e.data || e.error?.data;

    // Check if it includes the simulateValidation result
    if (errorData && errorData.startsWith("0x4d")) {
        // Decode using ABI
        const iface = new ethers.Interface([
            "function simulateValidation((address,uint256,bytes,bytes,bytes,bytes,uint256,bytes,bytes))",
            "error ValidationResult(uint256 preOpGas, uint256 prefund, struct StakeInfo stakeInfo)",
        ]);

        const decoded = iface.parseError(errorData);
        console.log(decoded);
    }
});
