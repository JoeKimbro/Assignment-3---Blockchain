import "dotenv/config";
import { artifacts } from "hardhat";
import { createPublicClient, http, decodeEventLog } from "viem";

const RPC_URL = process.env.RPC_URL!;
const CHAIN_ID = Number(process.env.CHAIN_ID!);
const TOKEN = process.env.TOKEN_ADDRESS as `0x${string}`;

async function main() {
  if (!RPC_URL || !CHAIN_ID || !TOKEN) {
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

    const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });

    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock > 2000n ? latestBlock - 2000n : 0n;

    console.log(`Querying events from block ${fromBlock} to ${latestBlock}...`);

    const logs = await publicClient.getLogs({ 
      address: TOKEN, 
      fromBlock, 
      toBlock: "latest" 
    });

    console.log(`Found ${logs.length} events:`);

    for (const log of logs) {
      try {
        const decoded = decodeEventLog({ abi, data: log.data, topics: log.topics });
        
        if (decoded.eventName === "Transfer") {
          const { from, to, value } = decoded.args as any;
          console.log(`Block ${log.blockNumber} - Transfer: from=${from}, to=${to}, value=${value}`);
        } else if (decoded.eventName === "Approval") {
          const { owner, spender, value } = decoded.args as any;
          console.log(`Block ${log.blockNumber} - Approval: owner=${owner}, spender=${spender}, value=${value}`);
        } else {
          console.log(`Block ${log.blockNumber} - ${decoded.eventName}:`, decoded.args);
        }
      } catch (error) {
        console.log(`Block ${log.blockNumber} - Unknown event`);
      }
    }

  } catch (error) {
    console.error("Logs query script failed:", error);
    process.exit(1);
  }
}

main();