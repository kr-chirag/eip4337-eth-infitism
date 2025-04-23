import { ethers } from "ethers";
import ABI_EntryPoint from "./ABI_EntryPoint.json";
import ABI_MySmartWallet from "./ABI_MySmartWallet.json";

import env from "dotenv";
env.config();

const SEPOLIA_RPC = `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`;
const PRIVATE_KEY = `0x${process.env.DEPLOYER_KEY}`;

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
const owner = new ethers.Wallet(PRIVATE_KEY, provider);

const entryPointAddr = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108";
const mySmartWalletAddr = "0x1D1E2346bA2DCBc8FF6EA41FD1cc79897ad69Dd4";
const acc3Addr = "0x58a70795F6dfdB1c87db819C7D2d2Ca4D8798e56";

const entryPoint = new ethers.Contract(entryPointAddr, ABI_EntryPoint, owner);
const mySmartWallet = new ethers.Contract(mySmartWalletAddr, ABI_MySmartWallet, owner);

const main = async () => {
    const nonce = await entryPoint.getNonce(mySmartWalletAddr, 0);
    const callData = new ethers.Interface(["function execute(address target, uint256 value, bytes calldata data)"]).encodeFunctionData("execute", [
        acc3Addr,
        ethers.parseEther("0.01"),
        "0x",
    ]);
    const verificationGasLimit = ethers.zeroPadValue(ethers.toBeHex(1000_000), 16);
    const callGasLimit = ethers.zeroPadValue(ethers.toBeHex(1000_000), 16);
    const accountGasLimits = verificationGasLimit + callGasLimit.slice(2);
    // console.log(accountGasLimits);
    // console.log(accountGasLimits.length);
    const maxPriorityFeePerGas = ethers.zeroPadValue(ethers.toBeHex(5e9), 16);
    const maxFeePerGas = ethers.zeroPadValue(ethers.toBeHex(30e9), 16);
    const gasFees = maxPriorityFeePerGas + maxFeePerGas.slice(2);
    // console.log(gasFees);
    // console.log(gasFees.length);

    const userOp = {
        sender: mySmartWalletAddr,
        nonce,
        initCode: "0x",
        callData,
        accountGasLimits,
        preVerificationGas: 50_000,
        gasFees,
        paymasterAndData: "0x",
        signature: "0x",
    };

    const userOpHash = await entryPoint.getUserOpHash(userOp);

    const signature = await owner.signMessage(ethers.getBytes(userOpHash));
    userOp.signature = signature;

    const ops = [userOp];
    const beneficiary = "0x6ee7b2cFdDcA903A049Cc445E8ac1388E58f5220";

    console.log("acc3 before balance:", ethers.formatEther(await provider.getBalance(acc3Addr)));
    console.log("wallet before balance:", ethers.formatEther(await provider.getBalance(mySmartWalletAddr)));
    console.log("beneficiary before balance:", ethers.formatEther(await provider.getBalance(beneficiary)));

    const tx = await entryPoint.handleOps(ops, beneficiary);
    const receipt = await tx.wait();

    console.log("acc3 after balance:", ethers.formatEther(await provider.getBalance(acc3Addr)));
    console.log("wallet after balance:", ethers.formatEther(await provider.getBalance(mySmartWalletAddr)));
    console.log("beneficiary after balance:", ethers.formatEther(await provider.getBalance(beneficiary)));
    console.log(receipt);
};

async function withdraw() {
    await mySmartWallet.withdraw();
    console.log("wallet balance:", ethers.formatEther(await provider.getBalance(mySmartWalletAddr)));
}

main().catch(console.error);
// withdraw().catch(console.error);
