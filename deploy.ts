import "dotenv/config";
import { artifacts } from "hardhat";
import { createWalletClient, createPublicClient, http, parseUnits, getAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID!);
const PRIVATE_KEY = (process.env.PRIVATE_KEY || "").replace(/^0x/, "");
const NAME = process.env.TOKEN_NAME || "CampusCredit";
const SYMBOL = process.env.TOKEN_SYMBOL || "CAMP";
const CAP_HUMAN = process.env.TOKEN_CAP || "2000000";
const INIT_HUMAN = process.env.TOKEN_INITIAL || "1000000";

async function main() {
  if (!RPC_URL || !CHAIN_ID || !PRIVATE_KEY) {
    console.error("Missing required environment variables");
    process.exit(1);
  }

  try {
    const { abi, bytecode } = await artifacts.readArtifact("CampusCreditV2");
    
    const chain = {
      id: CHAIN_ID,
      name: `didlab-${CHAIN_ID}`,
      nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
      rpcUrls: { default: { http: [RPC_URL] } },
    } as const;

    const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
    const wallet = createWalletClient({ account, chain, transport: http(RPC_URL) });
    const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

    const cap = parseUnits(CAP_HUMAN, 18);
    const initialMint = parseUnits(INIT_HUMAN, 18);

    const hash = await wallet.deployContract({
      abi, 
      bytecode,
      args: [NAME, SYMBOL, cap, getAddress(account.address), initialMint],
      maxPriorityFeePerGas: 2_000_000_000n,
      maxFeePerGas: 20_000_000_000n,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log("Deploy tx hash:", hash);
    console.log("Deployed contract address:", receipt.contractAddress);
    console.log("Block number:", receipt.blockNumber.toString());
    console.log(`\nCopy this to your .env file:\nTOKEN_ADDRESS=${receipt.contractAddress}`);

  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main();