import "dotenv/config";
import { artifacts } from "hardhat";
import { createWalletClient, createPublicClient, http, parseUnits, formatUnits, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID!);
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");
const TOKEN = process.env.TOKEN_ADDRESS as `0x${string}`;
const RECIPIENT = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Example second address

async function main() {
  if (!RPC_URL || !CHAIN_ID || !PRIVATE_KEY || !TOKEN) {
    console.error("Missing required environment variables");
    process.exit(1);
  }

  try {
    const { abi } = await artifacts.readArtifact("CampusCreditV2");
    
    const chain = { 
      id: CHAIN_ID, 
      name: `didlab-${CHAIN_ID}`, 
      nativeCurrency: { name:"ETH", symbol:"ETH", decimals:18 }, 
      rpcUrls: { default: { http:[RPC_URL] } } 
    } as const;

    const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
    const wallet = createWalletClient({ account, chain, transport: http(RPC_URL) });
    const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

    const deployer = getAddress(account.address);
    const recipient = getAddress(RECIPIENT);

    const getBalances = async (label: string) => {
      const deployerBalance = await publicClient.readContract({
        address: TOKEN, abi, functionName: "balanceOf", args: [deployer]
      }) as bigint;
      const recipientBalance = await publicClient.readContract({
        address: TOKEN, abi, functionName: "balanceOf", args: [recipient]
      }) as bigint;
      console.log(`${label} - Deployer: ${formatUnits(deployerBalance, 18)} CAMP, Recipient: ${formatUnits(recipientBalance, 18)} CAMP`);
    };

    await getBalances("Before");

    // Transfer tokens
    const transferHash = await wallet.writeContract({
      address: TOKEN, abi, functionName: "transfer", 
      args: [recipient, parseUnits("100", 18)],
      maxPriorityFeePerGas: 1_000_000_000n, 
      maxFeePerGas: 20_000_000_000n
    });

    const transferReceipt = await publicClient.waitForTransactionReceipt({ hash: transferHash });
    console.log(`Transfer - tx hash: ${transferHash}, block: ${transferReceipt.blockNumber}, gas used: ${transferReceipt.gasUsed}`);

    // Approve tokens
    const approveHash = await wallet.writeContract({
      address: TOKEN, abi, functionName: "approve", 
      args: [recipient, parseUnits("50", 18)],
      maxPriorityFeePerGas: 2_000_000_000n, 
      maxFeePerGas: 21_000_000_000n
    });

    const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveHash });
    console.log(`Approve - tx hash: ${approveHash}, block: ${approveReceipt.blockNumber}, gas used: ${approveReceipt.gasUsed}`);

    // Show allowance
    const allowance = await publicClient.readContract({
      address: TOKEN, abi, functionName: "allowance", args: [deployer, recipient]
    }) as bigint;
    console.log(`Allowance: ${formatUnits(allowance, 18)} CAMP`);

    await getBalances("After");

  } catch (error) {
    console.error("Transfer/Approve script failed:", error);
    process.exit(1);
  }
}

main();