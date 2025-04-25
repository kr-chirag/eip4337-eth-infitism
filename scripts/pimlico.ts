import { deployments, ethers, network } from "hardhat";
import { MyEntryPoint__factory, MySmartWallet__factory } from "../typechain-types";
import axios from "axios";

(async () => {
    const entryPointAddrSepolia = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108";
    const rpcUrl = (network.config as { url: string }).url;
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const [owner, receiver, beneficiary, bundler] = await ethers.getSigners();

    const mySmartWalletDeploymet = await deployments.get("MySmartWallet");
    const myEntryPointDeployment = await deployments.get("MyEntryPoint");
    const mySmartWallet = MySmartWallet__factory.connect(mySmartWalletDeploymet.address, owner);
    const myEntryPoint = MyEntryPoint__factory.connect(myEntryPointDeployment.address, bundler);

    // Example values (replace with your actual values)
    const bundlerUrl = `https://api.pimlico.io/v1/11155111/rpc`; // e.g. polygon-mumbai
    const entryPoint = "0x4337084D9E255Ff0702461CF8895CE9E3b5Ff108"; // EntryPoint address
    const smartAccountAddress = mySmartWalletDeploymet.address;

    const nonce = await myEntryPoint.getNonce(myEntryPointDeployment.address, 0);
    const callData = new ethers.Interface(["function execute(address target, uint256 value, bytes calldata data)"]).encodeFunctionData("execute", [
        receiver.address,
        ethers.parseEther("0.001"),
        "0x",
    ]);

    // UserOp creation (simplified for example)
    const userOp = {
        sender: smartAccountAddress,
        nonce,
        initCode: "0x",
        callData, // encode a call if needed
        callGasLimit: "0x100000",
        verificationGasLimit: "0x100000",
        preVerificationGas: "0x10000",
        maxFeePerGas: "0x" + BigInt(1e9).toString(16),
        maxPriorityFeePerGas: "0x" + BigInt(1e9).toString(16),
        paymasterAndData: "0x",
        signature: "0x", // will be signed below
    };

    // 1. Hash the UserOp using the EntryPoint method `getUserOpHash`
    async function getUserOpHash(userOp: any): Promise<string> {
        // You may have to manually encode it depending on your setup
        // Here assuming a local EntryPoint instance or utility library
        const entryPointContract = new ethers.Contract(
            entryPoint,
            [
                "function getUserOpHash((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes)) public view returns (bytes32)",
            ],
            owner
        );

        return await entryPointContract.getUserOpHash(userOp);
    }

    const userOpHash = await getUserOpHash(userOp);

    // 2. Sign it
    const signature = await owner.signMessage(ethers.getBytes(userOpHash));
    userOp.signature = signature;

    // 3. Send it to Pimlico bundler
    // const response = await axios.post(
    //     bundlerUrl,
    //     {
    //         jsonrpc: "2.0",
    //         id: 1,
    //         method: "eth_sendUserOperation",
    //         params: [userOp, entryPoint],
    //     },
    //     {
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     }
    // );

    console.log("UserOp sent! Response:");
    console.log("UserOp sent! Response:");
    // console.dir(response.data);
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    console.log("");
    // console.log(response);
})();
