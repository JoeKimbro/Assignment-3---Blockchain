import "dotenv/config";
import { artifacts } from "hardhat";
import { createWalletClient, createPublicClient, http, parseUnits, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID!);
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");
const TOKEN = process.env.TOKEN_ADDRESS as `0x${string}`;

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

    // 4 recipients with different amounts
    const recipients = [
      getAddress(account.address),
      getAddress("0x70997970C51812dc3A010C7d01b50e0d17dc79C8"),
      getAddress("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"),
      getAddress("0x90F79bf6EB2c4f870365E785982E1f101E93b906"),
    ];

    const amounts = [
      parseUnits("10", 18),
      parseUnits("15", 18), 
      parseUnits("20", 18),
      parseUnits("25", 18)
    ];

    // Batch airdrop
    const batchHash = await wallet.writeContract({
      address: TOKEN, abi, functionName: "airdrop", args: [recipients, amounts],
      maxPriorityFeePerGas: 2_000_000_000n, maxFeePerGas: 22_000_000_000n
    });
    
    const batchReceipt = await publicClient.waitForTransactionReceipt({ hash: batchHash });
    const batchGas = batchReceipt.gasUsed;

    // Individual transfers
    let totalSingleGas = 0n;
    
    for (let i = 0; i < recipients.length; i++) {
      const singleHash = await wallet.writeContract({
        address: TOKEN, abi, functionName: "transfer", args: [recipients[i], amounts[i]],
        maxPriorityFeePerGas: 2_000_000_000n, maxFeePerGas: 22_000_000_000n
      });
      
      const singleReceipt = await publicClient.waitForTransactionReceipt({ hash: singleHash });
      totalSingleGas += singleReceipt.gasUsed;
    }

    const gasSaved = totalSingleGas - batchGas;
    const percentSaved = totalSingleGas > 0n ? 
      (Number(gasSaved) / Number(totalSingleGas) * 100).toFixed(2) : "0.00";

    console.log(`Batch airdrop gas: ${batchGas}, Individual transfers gas: ${totalSingleGas}, Gas saved: ${percentSaved}%`);

  } catch (error) {
    console.error("Airdrop script failed:", error);
    process.exit(1);
  }
}

main();