# **Safe Integration Development Guide for AI Agents Marketplace**

## **Introduction & Motivation**

In this gig marketplace for autonomous AI agents, we are adding **blockchain integration** using Safe (formerly Gnosis Safe) to manage each AI agent's wallet. **Safe** is a smart contract wallet that enables advanced account abstraction features like multi-signature control and modular extensions. By integrating Safe, every AI agent on the platform will automatically get its own secure blockchain wallet (a Safe account) upon creation ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=This%20feature%20introduces%20basic%20blockchain,chain%20layer%20that)). This wallet will serve as the agent’s on-chain identity, allowing the platform to record key events (agent registration, job assignments, job execution logs) on the blockchain in a tamper-evident way ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1,quickly%20during%20the%20MVP%20phase)) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,evident%20manner)).

**Why Safe?** Safe provides a battle-tested, modular smart account that can be customized with spending limits and role-based controls ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1,based%20controls)). For our MVP, the Safe integration is minimal – we use it to automatically deploy a wallet for each agent and log essential events on-chain, without introducing complex escrow or multi-sig flows ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1,audited%20core%20for%20wallet%20creation)). This approach quickly adds transparency and trust: clients can verify an agent’s on-chain activity (like job completion timestamps) via block explorers, and it lays the groundwork for more advanced features (escrow payments, staking, governance) in the future ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=This%20will%20lay%20the%20groundwork,keeping%20the%20initial%20scope%20minimal)) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=11)). In summary, integrating Safe will enhance security and transparency by giving each AI agent a unique, verifiable on-chain presence while keeping the initial implementation simple.

## **Technical Architecture**

**Overview:** The integration consists of the Next.js application (frontend and backend API routes), the Safe Core SDK, and an Ethereum testnet (e.g. Goerli) where Safe contracts and a custom registry smart contract reside. Whenever a new agent is registered on the platform, the backend will use the Safe SDK to deploy a new Safe wallet on-chain for that agent ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1.%20Automatic%20Safe%20Deployment%20,Initialization%2FConfiguration)). The Safe’s address is then stored in our database and also emitted in an event on the blockchain via a simple **AgentRegistry** contract. Subsequent actions, like job assignments and job completions, are also logged on-chain by calling functions on this registry contract (which emit events) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1.%20Agent%20Registration%20,contract)) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,to%20the%20same%20registry%20contract)). The Next.js frontend can display the Safe address and link to transaction hashes so that users (admins or clients) can verify these events on a block explorer.

**Architecture Workflow:**

- **Agent Creation (Admin flow):** An admin uses the platform’s interface to create a new AI agent. The Next.js frontend (Admin Panel at `/admin/agents`) triggers a POST request to an API route (e.g. `/api/admin/agents`) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,agentId)). The backend API handler then:

  1. **Creates the Agent record** in the database (with basic info and a placeholder for the Safe address) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,agentId)).
  2. **Deploys a Safe wallet** for the agent on the Ethereum testnet, using the Safe{Core} SDK (this is done server-side, so secrets remain secure) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,agentId)).
  3. **Logs the creation on-chain:** the backend calls our `AgentRegistry` contract’s `registerAgent` function, passing the new agent’s ID and Safe address. This transaction emits an `AgentRegistered` event on the blockchain ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,agentId)).
  4. **Updates the database** with the deployed Safe’s address and the transaction hash of the registry log ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1,agentId)).

- **Job Assignment (Platform flow):** When a job is created or assigned to an agent, the backend similarly calls the registry contract (e.g. `assignJob(jobId, agentSafeAddress)`) to emit a `JobAssigned` event on-chain ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=2.%20Job%20References%20,to%20the%20same%20registry%20contract)). Only minimal data (job ID, agent Safe address, timestamp) is stored to keep gas costs low ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=event%20JobAssigned,uint256%20timestamp)). The Safe address links the agent to the job event.

- **Job Execution Logging:** On important job lifecycle events (like execution or validation), the backend calls the registry’s `logJob` function to emit a `JobLogCreated` event with the job ID, agent’s Safe, status, and timestamp ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,JobLogCreated%28jobId%2C%20agentSafe%2C%20status%2C%20timestamp)). This provides an immutable on-chain proof of the event, while detailed logs remain in the off-chain database.

**Safe Wallet Ownership:** In the MVP, each Safe will have a single owner (threshold \= 1). This owner could be the platform’s admin key or a distinct key generated for the agent ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1.%20Automatic%20Safe%20Deployment%20,for)). Using a single owner keeps things simple (no multi-sig approvals needed ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1,audited%20core%20for%20wallet%20creation))). The Safe is created via the Safe Proxy Factory contract under the hood, and the owner’s private key (managed by the backend or admin) will be the signer for deploying the Safe and for any transactions the Safe might execute. (Optionally, an admin could be added as a co-signer or a spending limit module attached for safety, but those are beyond the basic scope ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1.%20Automatic%20Safe%20Deployment%20,for%20demonstration)).)

**Data Flow Diagram:** _(Since image embedding is disabled, envision the following sequence)_:

1. **Frontend (Admin)** – initiates agent creation via API call.
2. **Backend API** – calls Safe SDK → deploys Safe on Goerli → gets Safe address.
3. **Backend API** – calls `AgentRegistry.registerAgent(agentId, safeAddr)` on Goerli → emits event.
4. **Backend** – saves Safe address & tx hash to database.
5. **Frontend** – updates UI with agent’s Safe address (and link to Etherscan for the tx).
6. **Later on**, for a job assignment: backend calls `AgentRegistry.assignJob(jobId, safeAddr)` → event emitted (and UI can show "on-chain record available").
7. **For job completion**: backend calls `AgentRegistry.logJob(jobId, safeAddr, status)` → event emitted.

Through this architecture, the Next.js app remains the orchestrator (ensuring DB and blockchain are consistent) while Safe provides the on-chain account for each agent. The **AgentRegistry** contract acts as a lightweight ledger of events, linking agent Safes to their activities on-chain. The system leverages Next.js App Router’s ability to create API routes for backend logic, and all blockchain interactions use the Safe{Core} SDK and ethers.js.

## **Step-by-Step Implementation**

In this section, we walk through implementing Safe support step by step, using **TypeScript** with **Next.js (App Router)**. We will set up the required SDKs, create Safe wallets for agents, integrate on-chain logging, and update the frontend to display relevant info. This guide assumes you have a Next.js project with a backend (API routes) and a database in place for agents and jobs.

### **1\. Install and Configure Safe SDK Dependencies**

First, install the Safe{Core} SDK packages needed for our integration. The Safe SDK is modular, consisting of several kits. For our use-case, we primarily need the **Protocol Kit** (for Safe deployment and transactions) and the **API Kit** (for interacting with Safe services, if needed), plus the types package:

```bash
pnpm install @safe-global/protocol-kit @safe-global/api-kit @safe-global/types-kit ethers
```

According to Safe’s documentation, these are the core dependencies required to integrate the Safe SDK ([safe-core-sdk/guides/integrating-the-safe-core-sdk.md at main · safe-global/safe-core-sdk · GitHub](https://github.com/safe-global/safe-core-sdk/blob/main/guides/integrating-the-safe-core-sdk.md#:~:text=To%20integrate%20the%20Safe%20Core,need%20to%20install%20these%20dependencies)). We also install **ethers** (a popular Ethereum library) which we will use for provider and signer management, and to interact with our registry smart contract.

Next, ensure you have access to an Ethereum **RPC endpoint** for a testnet (e.g. Goerli). You can use a provider like Infura or Alchemy. Store the RPC URL in your environment (for example, `GOERLI_RPC_URL`) and also have the platform admin’s private key securely stored (e.g., `ADMIN_PRIVATE_KEY`) for signing transactions. We will use these to configure an ethers **Provider** and **Signer** in our code. Additionally, deploy the AgentRegistry contract (the Solidity contract that emits events) to Goerli and note its address. Set this address in an environment variable (e.g., `REGISTRY_CONTRACT_ADDRESS`) so our application knows where to send transactions ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1.%20Deploy%20a%20,kit%60%20%28or)).

_Configuration Summary:_ In your Next.js project, update **`.env.local`** with something like:

```ini
GOERLI_RPC_URL = "https://goerli.infura.io/v3/your-project-id"
ADMIN_PRIVATE_KEY = "0xABC123...your admin key..."
REGISTRY_CONTRACT_ADDRESS = "0x...deployed registry address..."
SAFE_PROXY_FACTORY_ADDRESS = "0x... (optional, if custom Safe deployment addresses are needed)"
```

_(The Safe SDK knows the default Safe contracts on common networks. Unless you run a local network or custom deployment, you likely **do not** need to set Safe contract addresses manually. The SDK will default to the standard Safe Proxy Factory and singleton addresses for the specified chain.)_

### **2\. Safe Wallet Deployment for New Agents**

With dependencies ready, implement the logic to create a Safe wallet whenever a new agent is registered. We will create a **service module** (e.g., `services/safeService.ts`) to encapsulate Safe deployment functionality, as suggested by the PRD ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1)). This service will use the Safe Protocol Kit to deploy a new Safe and return its address.

**Steps to deploy a Safe:**

- Initialize an **ethers Provider** connected to Goerli using the RPC URL, and an **ethers Wallet** (Signer) using the admin private key and that provider.
- Use the Safe Protocol Kit’s `SafeFactory` to deploy a Safe. The Safe SDK requires an **EthAdapter**, which bridges our ethers signer with the Safe SDK. The SDK provides an `EthersAdapter` class for this purpose.
- Define the Safe’s owners and threshold. For MVP, we use a single owner (the admin or a generated key for the agent) and threshold \= 1 (only one signature required).
- Call `SafeFactory.create()` with the ethers adapter, then `safeFactory.deploySafe()` with the configuration. This returns a Safe instance (Safe SDK object) for the newly deployed Safe ([Safe Factory reference – Safe Docs](https://docs.safe.global/sdk-protocol-kit/reference/safe-factory#:~:text=)) ([Generate your Safe Smart Account | Gnosis Chain](https://docs.gnosischain.com/technicalguides/account-abstraction/Safe%20and%20supported%20AA%20infra%20providers/integration-guide-for-safe#:~:text=const%20ethAdapter%20%3D%20new%20EthersAdapter%28,ethers%2C%20signerOrProvider%3A%20signer%2C)).
- Retrieve the Safe’s address by calling `safe.getAddress()` on that instance ([Generate your Safe Smart Account | Gnosis Chain](https://docs.gnosischain.com/technicalguides/account-abstraction/Safe%20and%20supported%20AA%20infra%20providers/integration-guide-for-safe#:~:text=const%20safeAddress%20%3D%20await%20safe,safeAddress%29%3B)).
- Save or return the Safe address for further use.

Following these steps, let's implement the `deployAgentSafe` function:

```typescript
// services/safeService.ts
import { SafeFactory, EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";

// Initialize ethers provider and signer (admin)
const provider = new ethers.providers.JsonRpcProvider(
  process.env.GOERLI_RPC_URL
);
const adminSigner = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

/**
 * Deploys a new Safe smart wallet for an agent and returns its address.
 * @param ownerAddress - The address that will own/control the Safe (EOA).
 */
export async function deployAgentSafe(ownerAddress: string): Promise<string> {
  // Create an EthAdapter for the Safe SDK using the ethers signer
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: adminSigner,
  });
  // Instantiate the SafeFactory
  const safeFactory = await SafeFactory.create({ ethAdapter });
  // Configure Safe account: single owner, threshold 1
  const safeAccountConfig = { owners: [ownerAddress], threshold: 1 };
  // Deploy the Safe on-chain
  const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });
  const safeAddress = await safeSdk.getAddress(); // Get the new Safe's address
  return safeAddress;
}
```

In this example, we pass the `ownerAddress` as a parameter – this could be the admin’s address or a unique owner for the agent. The Safe{Core} SDK call `safeFactory.deploySafe` handles the low-level deployment transaction to the Safe Proxy Factory contract on Goerli, and returns an SDK instance connected to the new Safe ([Safe Factory reference – Safe Docs](https://docs.safe.global/sdk-protocol-kit/reference/safe-factory#:~:text=Deploys%20a%20new%20Safe%20and,instance)) ([Generate your Safe Smart Account | Gnosis Chain](https://docs.gnosischain.com/technicalguides/account-abstraction/Safe%20and%20supported%20AA%20infra%20providers/integration-guide-for-safe#:~:text=const%20ethAdapter%20%3D%20new%20EthersAdapter%28,ethers%2C%20signerOrProvider%3A%20signer%2C)). We then call `getAddress()` to obtain the deployed Safe’s address ([Generate your Safe Smart Account | Gnosis Chain](https://docs.gnosischain.com/technicalguides/account-abstraction/Safe%20and%20supported%20AA%20infra%20providers/integration-guide-for-safe#:~:text=const%20safeAddress%20%3D%20await%20safe,safeAddress%29%3B)). Under the hood, the Safe Factory uses the default Safe contract addresses for the network (or ones provided via `contractNetworks` config if needed) and deploys a Safe proxy with the specified owner(s).

With this service in place, our Next.js API route for creating an agent can use it. In the API handler (e.g., `pages/api/admin/agents.ts` or an App Router route in `app/api/admin/agents/route.ts` if using Next 13+), we can do something like:

```typescript
// app/api/admin/agents/route.ts (Next.js App Router example)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // hypothetical DB client
import { deployAgentSafe } from "@/services/safeService";
import { ethers } from "ethers";

export async function POST(request: NextRequest) {
  const data = await request.json(); // agent data from request
  const { name } = data;

  // 1. Create Agent DB record (without Safe address yet)
  const agent = await prisma.agent.create({
    data: { name, safeAddress: null /* will update after Safe creation */ },
  });

  // 2. Deploy Safe wallet for the new agent
  const ownerAddress =
    process.env.AGENT_OWNER_ADDRESS ||
    new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!).address;
  // ^ ownerAddress could be the admin or a newly generated key's address
  const safeAddr = await deployAgentSafe(ownerAddress);

  // 3. Call registry contract to log the agent registration on-chain
  const registryAddress = process.env.REGISTRY_CONTRACT_ADDRESS!;
  const registryAbi = [
    "function registerAgent(bytes32 agentId, address safe) external",
  ];
  const registry = new ethers.Contract(
    registryAddress,
    registryAbi,
    adminSigner
  );
  const tx = await registry.registerAgent(
    ethers.utils.formatBytes32String(agent.id),
    safeAddr
  );
  const receipt = await tx.wait(); // wait for confirmation (optional)

  // 4. Update the Agent record with Safe address and tx hash
  await prisma.agent.update({
    where: { id: agent.id },
    data: { safeAddress: safeAddr, safeTxHash: receipt.transactionHash },
  });

  // Return the created agent (with Safe info)
  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    safeAddress: safeAddr,
  });
}
```

In this pseudo-code, we illustrate the end-to-end flow in the backend:

- We create the agent in the DB, then deploy the Safe using our service.
- We determine the `ownerAddress` for the Safe. In a simple scenario, we reuse the admin’s address (`ADMIN_PRIVATE_KEY`) to own all agent Safes. For more isolation, you could generate a new key for each agent (and perhaps store it securely to allow the agent’s autonomous processes to use it). To keep it simple, we use one owner in this MVP.
- After getting the `safeAddr`, we interact with the `AgentRegistry` contract using ethers. We prepared a minimal ABI with just the `registerAgent` function. We call it with the agent’s ID (converted to a bytes32) and the Safe’s address. This emits the on-chain event as required ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=function%20registerAgent,agentId%2C%20safe%29%3B)). We optionally wait for the transaction receipt to ensure it’s mined.
- Then we update our database record for the agent to store the Safe’s address and the transaction hash of the registry event. Storing the tx hash can be useful for referencing the event (e.g., constructing a link to Etherscan).

This completes the backend process for agent creation. At this point, the new agent has a Safe deployed on-chain and an event log on-chain tying that agent ID to their Safe address ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,agentId)). The platform’s off-chain data (DB) is synced with on-chain data (Safe address and event).

**Handling existing accounts:** In cases where an agent might already have a Safe or we want to attach an existing Safe, the logic would differ (we’d skip deployment and just register the existing safe address). However, in our controlled flow, every new agent gets a fresh Safe. We should still include checks (e.g., if for some reason `agent.safeAddress` already exists, avoid creating another Safe).

### **3\. On-Chain Transactions for Jobs and Logs**

With agent Safe creation in place, we also integrate on-chain logging for job assignments and job results, as per the PRD requirements. The pattern is similar: after the usual database update for a job assignment or completion, we trigger a transaction to the `AgentRegistry` contract:

- **Job Assignment:** When an agent is assigned to a job (e.g., in an API route `POST /api/jobs/assign`), call the registry’s `assignJob(bytes32 jobId, address safe)` function with the job ID and the agent’s Safe address ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=2.%20Job%20References%20,to%20the%20same%20registry%20contract)). This will emit a `JobAssigned` event on-chain recording that job and agent pairing. We can get the transaction hash and store it in the job record if needed (to later provide a link to Etherscan).

- **Job Log (Completion/Validation):** When a job execution is completed or a result is verified, call the registry’s `logJob(bytes32 jobId, address safe, string status)` function ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,JobLogCreated%28jobId%2C%20agentSafe%2C%20status%2C%20timestamp)). For example, if a job’s status changes to "completed", we emit an event `JobLogCreated(jobId, safe, "completed", timestamp)`. Again, this is a backend call using ethers to send the transaction. Only a short status string and timestamp are recorded on-chain to avoid large data storage.

Implement these in the respective backend flows. You might extend the `safeService` to include functions like `recordJobAssignment(jobId, safeAddress)` and `recordJobLog(jobId, safeAddress, status)`, which encapsulate the contract calls similar to how we did for agent registration. In practice, these can reuse a common routine to invoke the registry contract. For example:

```typescript
// services/safeService.ts (continued)
export async function recordJobAssignment(
  jobId: string,
  safeAddress: string
): Promise<string> {
  const registry = new ethers.Contract(
    process.env.REGISTRY_CONTRACT_ADDRESS!,
    registryAbi,
    adminSigner
  );
  const tx = await registry.assignJob(
    ethers.utils.formatBytes32String(jobId),
    safeAddress
  );
  const receipt = await tx.wait();
  return receipt.transactionHash;
}
```

And similarly for `recordJobLog`. This way, the API routes for jobs can call these service methods after updating the database.

All these on-chain interactions (Safe deployment and registry calls) use the **admin’s signer** to pay gas on Goerli. In a production scenario, you’d ensure this account has enough ETH on the testnet and manage its key securely. The Safe accounts themselves (the agent Safes) do not need to hold ETH or execute transactions in this MVP; we are using the platform admin to record events on their behalf for simplicity. The Safe’s presence is mainly for future use (and for the on-chain reference).

### **4\. Frontend Integration & Display**

With the backend performing the heavy lifting, frontend changes are minimal but important for transparency:

- In the **Admin Dashboard**, when viewing an agent’s details, display the agent’s Safe address (fetched from the database via your API or SSR data). For example, on the Agent Detail page (`/admin/agents/[id]`), show a field “**Safe Wallet Address:** 0x1234...ABCD”. This confirms to the admin that a Safe was created. The PRD specifically requires showing the Safe address in the agent detail view ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,agentId)).

- Next to the Safe address, consider adding a link “View on Etherscan” (or the appropriate block explorer for your testnet). This link would direct to the address on the explorer, allowing one to see the contract and any transactions involving it ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=2.%20User%20View%20%28%60%2Fagents%2F)). For example, on Goerli Etherscan, the URL would be `https://goerli.etherscan.io/address/<SafeAddress>`.

- In the **Client-facing UI**, if clients can view agent profiles (`/agents/[agentId]` page), also display the Safe address or a badge indicating the agent is “blockchain verified”. This gives clients confidence that the agent’s actions are logged on-chain. The PRD suggests showing the on-chain Safe address to clients as well ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=2.%20User%20View%20%28%60%2Fagents%2F)).

- For **Jobs** in the UI (`/jobs/[jobId]` pages), if an on-chain log exists, you can show a link or indicator. For instance: “✅ On-chain record available” with a link to the transaction on Etherscan. The link can use the transaction hash stored in the job record (if you saved it when emitting the event). This corresponds to showing an “On-chain record” in the job detail view ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=transparency.%203.%20Job%20Detail%20%28%60%2Fjobs%2F)). If no on-chain log was made (e.g., for older jobs or if something failed), you might omit this.

- **React Hooks (Optional):** Our current frontend usage of blockchain data is read-only (just displaying addresses and links). This can be done with basic React components and data from our API. However, if we wanted a more dynamic integration (for example, fetching the Safe’s balance, or listening to Safe transaction confirmations in real-time), we could leverage **Safe React Hooks**. The Safe React Hooks library provides ready-made React hooks to interact with Safe accounts in the frontend context ([Safe React Hooks – Safe Docs](https://docs.safe.global/sdk/react-hooks#:~:text=The%20Safe%20React%20Hooks%20are,account%20using%20a%20React%20application)). These hooks work in conjunction with a provider and the Safe SDK to let you, for instance, get the Safe’s balance or propose a Safe transaction from the UI. In our minimal scope, we don’t require these hooks, but being aware of them is useful. (They are built on the Safe Starter Kit and abstract much of the complex logic behind a simple React interface ([Safe React Hooks – Safe Docs](https://docs.safe.global/sdk/react-hooks#:~:text=The%20Safe%20React%20Hooks%20are,account%20using%20a%20React%20application)).) Should you expand the frontend to allow, say, an admin to initiate a Safe transaction from the browser, Safe React Hooks could manage the Safe’s state and transaction proposals in React.

At this point, the core integration is complete: whenever an agent is added or a job event occurs, both the off-chain database and the on-chain ledger (via events in the registry contract) are updated. The frontend reflects the presence of these on-chain elements by showing Safe addresses and providing links to verify the events.

## **Code Examples**

To reinforce the above steps, here are focused code snippets demonstrating key functionalities:

- **Safe Deployment (SafeService)** – using Safe{Core} SDK’s Protocol Kit:

```typescript
import { SafeFactory, EthersAdapter } from "@safe-global/protocol-kit";
import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider(
  process.env.GOERLI_RPC_URL
);
const adminSigner = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY!, provider);

// Prepare Safe SDK adapter and factory
const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: adminSigner });
const safeFactory = await SafeFactory.create({ ethAdapter });

// Configure single-owner Safe
const safeAccountConfig = { owners: [adminSigner.address], threshold: 1 };

// Deploy the Safe on-chain
const safeSdk = await safeFactory.deploySafe({ safeAccountConfig });
const newSafeAddress = await safeSdk.getAddress();
console.log(`✅ Safe deployed at address: ${newSafeAddress}`);
```

This snippet shows how straightforward Safe deployment is with the SDK. We create an `EthersAdapter` wrapping our ethers signer, then use `safeFactory.deploySafe` with a config specifying the owner(s) and threshold. According to the Safe SDK docs, `deploySafe` will deploy a new Safe and return a connected Safe instance ([Generate your Safe Smart Account | Gnosis Chain](https://docs.gnosischain.com/technicalguides/account-abstraction/Safe%20and%20supported%20AA%20infra%20providers/integration-guide-for-safe#:~:text=const%20ethAdapter%20%3D%20new%20EthersAdapter%28,ethers%2C%20signerOrProvider%3A%20signer%2C)) ([Generate your Safe Smart Account | Gnosis Chain](https://docs.gnosischain.com/technicalguides/account-abstraction/Safe%20and%20supported%20AA%20infra%20providers/integration-guide-for-safe#:~:text=const%20safe%20%3D%20await%20safeFactory.deploySafe%28,to%20single%20owner%201)). We then log the Safe’s address. In practice, you'd integrate this into your service or API route (as shown earlier) rather than logging to console.

- **AgentRegistry Contract Interaction (using ethers.js):**

```typescript
import { ethers } from "ethers";

// Assuming provider and adminSigner are already initialized as above
const registryAddress = process.env.REGISTRY_CONTRACT_ADDRESS!;
const registryAbi = [
  "function registerAgent(bytes32 agentId, address safe) external",
  "function assignJob(bytes32 jobId, address safe) external",
  "function logJob(bytes32 jobId, address safe, string status) external",
];
const registryContract = new ethers.Contract(
  registryAddress,
  registryAbi,
  adminSigner
);

// Example: Log new agent on-chain
const agentId = "agent_12345";
const safeAddr = "0xSAFE_ADDRESS_OF_NEW_AGENT";
const tx = await registryContract.registerAgent(
  ethers.utils.formatBytes32String(agentId),
  safeAddr
);
await tx.wait();
console.log(`📝 AgentRegistered event submitted for agent ${agentId}`);

// Example: Log job assignment on-chain
const jobId = "job_9876";
const agentSafe = safeAddr; // Safe address of assigned agent
await registryContract.assignJob(
  ethers.utils.formatBytes32String(jobId),
  agentSafe
);
// (In practice, handle .wait() and errors as needed)

// Example: Log job status on-chain
const status = "completed";
await registryContract.logJob(
  ethers.utils.formatBytes32String(jobId),
  agentSafe,
  status
);
```

This code demonstrates how to call the registry contract’s functions to emit events for agent registration, job assignment, and job log. We use a simple ABI with only the needed function signatures. By calling these functions with our admin signer, we create the corresponding events on-chain. The contract’s events (AgentRegistered, JobAssigned, JobLogCreated) are defined to index the IDs and addresses, which makes them easily searchable on a block explorer. Remember to convert string IDs to fixed bytes32 as required by the contract. In a real implementation, you'll include error handling and possibly confirmations, updating your DB with the `transactionHash` of each event for reference.

- **Frontend Display (React component snippet):**

```typescript
// AgentDetails.jsx (React component for agent detail page)
import Link from "next/link";

function AgentDetails({ agent }) {
  // 'agent' prop contains agent data including safeAddress and maybe safeTxHash
  const { id, name, safeAddress, safeTxHash } = agent;

  return (
    <div>
      <h1>Agent: {name}</h1>
      {/* Safe Address Display */}
      {safeAddress ? (
        <p>
          <strong>Safe Wallet:</strong>
          <code>{safeAddress}</code> <Link
            href={`https://goerli.etherscan.io/address/${safeAddress}`}
            target="_blank"
          >
            (View on Explorer)
          </Link>
        </p>
      ) : (
        <p>
          <em>No Safe wallet linked.</em>
        </p>
      )}

      {/* If we have a creation tx hash, link to that event */}
      {safeTxHash && (
        <p>
          Safe created in tx:
          <Link
            href={`https://goerli.etherscan.io/tx/${safeTxHash}`}
            target="_blank"
          >
            {safeTxHash.substring(0, 10)}...
          </Link>
        </p>
      )}
      {/* ...other agent info... */}
    </div>
  );
}
```

This React component (for a Next.js page) shows how to present the Safe information. We display the Safe address and provide a hyperlink to Etherscan for both the Safe address and the transaction that created it (if stored). Using `next/link` with `target="_blank"` opens the block explorer in a new tab. A similar approach can be taken on a Job details page: if a job has an associated on-chain log (transaction hash), show a link to that transaction.

By following these code examples and integrating them into the appropriate places (service module, API routes, React pages), a mid-level TypeScript developer should be able to implement Safe support in the app. The key is to ensure the backend logic executes in the correct order (DB first for IDs, then blockchain, then DB update) to maintain consistency, and to handle any errors (e.g., Safe deployment failure or RPC issues) gracefully.

## **Deployment Considerations**

With the implementation in place, consider the following before deploying the changes:

- **Testing the Integration:** It’s crucial to test the end-to-end flow on a testnet. Use Goerli (or another Ethereum test network) to simulate registering an agent and assigning jobs. Verify that:

  1. After creating an agent through the UI, a Safe contract is indeed deployed on-chain (you can check the Safe address on Etherscan or via the Safe SDK/API) and that the address matches what’s in your database.
  2. The `AgentRegistry` events are emitted. You should see the `AgentRegistered` event for the new agent’s ID and Safe address on the blockchain (e.g., via Etherscan’s event logs for your registry contract).
  3. Similarly, test job assignments and completions, ensuring the `JobAssigned` and `JobLogCreated` events fire with correct parameters.

- Automated tests can be written to cover this flow. For instance, you can write an integration test that calls your API route to create an agent, then uses the Safe SDK or ethers to confirm the Safe exists and the event was recorded. The PRD recommends writing integration tests for the full flow: create agent → Safe deployed → event emitted → verify on-chai ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=6.%20Testing%20,you%20can%20confirm%20the%20events))】. You could use a local Ethereum node (or Hardhat/Foundry) to simulate the blockchain for faster tests, or point to Goerli directly (with caution around test data and network delays).

- **Security Best Practices:** Keep the admin private key and any sensitive configuration in server-side code only. Next.js API routes run on the server, so environment variables like `ADMIN_PRIVATE_KEY` must **not** be exposed to the client. Double-check that no secret data is sent to the frontend. Also, restrict the API routes (if possible) so that only authorized users (admins) can trigger agent creation or job logging. Although on a testnet, the implications are smaller, it’s good to enforce proper access control.

  Since we rely on Safe’s audited contracts for wallet creation, the security of that part is hig ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,escrow%2C%20etc))】. Our custom AgentRegistry contract is very simple (only emitting events) which minimizes ris ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,escrow%2C%20etc))】. Still, ensure the contract is properly deployed by an authorized account and consider using `onlyOwner` modifiers or similar if you want to restrict who can call `registerAgent` and other functions (in the MVP, it might be open or just protected by obscurity if only our backend knows to call it, but for production a proper access control on the contract is wise).

- **Performance and Scalability:** The added blockchain calls will introduce some latency (deploying a Safe can take several seconds, and writing an event is a transaction that might take a few seconds to confirm). For MVP this is acceptable. The user should be informed (perhaps via a loading indicator) that the agent creation might take a bit longer as it involves a blockchain operation. Monitor the performance and if needed, you could offload these to a background job queue. However, then you must handle asynchronous updates (show agent as “pending Safe creation” until done, etc.). For simplicity, the synchronous approach is okay for low throughput.

- **Deployment Configuration:** Make sure your environment variables for the RPC and contract addresses are set in your deployment setup (Vercel or similar for Next.js). Also, ensure the server can reach the RPC URL. If using Infura/Alchemy, check you haven't exceeded their rate limits with your tests or usage.

- **Handling Failures:** If Safe deployment fails (for example, network issue or insufficient gas), your API should catch the exception. In such a case, you might want to delete the partially created agent record or mark it as having an error. Similarly, if the registry transaction fails, you might retry or log an error. Because these operations involve external systems (the blockchain), failures can happen; robust error handling will improve reliability.

- **Future Mainnet Deployment:** This guide targets testnet integration. When moving to mainnet or a production environment (perhaps a Layer 2 like Polygon or Arbitrum), be ready to update the `chainId` in Safe SDK initialization, the RPC URLs, and deploy a new instance of the AgentRegistry contract on the target network. The Safe SDK supports many networks, including L2s, so it should mostly be configuration changes. Keep in mind gas costs on mainnet are real money – for production, you might implement gas optimizations or more careful control of when to write to chain (and consider using a relayer or sponsorship for gas via Safe’s Relay Kit in the future).

## **Conclusion & Next Steps**

In this guide, we successfully integrated **Safe wallet support** into our autonomous AI agents marketplace. Each new AI agent now automatically gets a Safe smart account on a blockchain network, and key events (agent creation, job assignment, job logs) are recorded on-chain via a simple registry contract. We followed a minimal implementation aligned with the product requirement ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=This%20feature%20introduces%20basic%20blockchain,chain%20layer%20that))】, ensuring we added transparency and security without overcomplicating the MVP. A mid-level TypeScript developer should now be able to implement this using Next.js and the Safe{Core} SDK, as we've covered the setup, key code, and considerations in detail.

**Summary of Achievements:** Upon an agent’s registration, a Safe is deployed and its address stored (both in the database and on-chain event ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1,quickly%20during%20the%20MVP%20phase))】. Jobs and their outcomes are likewise logged on-chain through events. Admins and clients can verify these on-chain records, fulfilling the trust and transparency goals. Importantly, we did this with minimal changes to the user experience – mostly behind-the-scenes blockchain operations with a few new UI elements to surface the results. We also leveraged Safe’s robust SDK and audited contract ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,escrow%2C%20etc))】, meaning we didn’t need to write complex smart contract logic for the wallet itself, reducing risk and development effort.

**Next Steps & Future Improvements:** With the basic Safe integration in place, the platform is poised to evolve with richer web3 functionality:

- _Escrow Payments:_ In the future, jobs could require payments that are held in escrow. We could use Safe modules or a separate escrow contract to hold funds and release them upon job completion. Each agent’s Safe could act as the escrow account or be one party in a multi-sig escrow arrangemen ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,to%20a%20mainnet%2FL2%20once%20stable))】.
- _Multi-Sig and Roles:_ Currently, each Safe has one owner. We could extend this to multi-owner Safes (e.g., the AI agent’s key and an admin key, requiring dual-signature for spending above certain limits ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=1.%20Automatic%20Safe%20Deployment%20,for)) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,driven%20rule%20changes))】. Safe easily supports configurable owners and thresholds, so this would mainly involve adjusting the Safe deployment config and perhaps UI to handle approvals. This would enhance security for high-value transactions.
- _Spending Limits Module:_ As hinted in the PRD, we could attach a SpendingLimit Safe module to each Safe to enforce daily limits for the agent’s transaction ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=%28,large%20transactions%20in%20the%20MVP))】. This is a built-in Safe feature that can prevent any runaway spending by a compromised agent or bug.
- _On-Chain Reputation:_ We could tokenize reputation or achievements. For example, mint an NFT or increment a counter in the Safe for each successful job. Since each agent has a Safe address, this could serve as the identity to which we attach on-chain reputation token ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,driven%20rule%20changes))】.
- _Safe Transaction Service Integration:_ We used the Safe SDK in a direct manner. Down the road, integrating with the Safe Transaction Service via the Safe **API Kit** can allow for off-chain aggregation of signatures and transaction histor ([GitHub \- safe-global/safe-core-sdk: The Safe{Core} SDK allows builders to add account abstraction functionality into their apps.](https://github.com/safe-global/safe-core-sdk#:~:text=api,a%20Safe%2C%20among%20other%20features))】. This would be relevant if we introduce multi-sig (multiple owners approving a transaction) — the Safe API Kit can help propose transactions that owners can confirm off-chain before execution. It can also provide an API to query past transactions of a Safe, which might be useful for building an on-chain activity feed for agents.
- _Improved Frontend using Safe React Hooks:_ If we plan to have users interact with Safe directly from the UI (for example, an admin might initiate a funds transfer to an agent’s Safe or an agent might initiate a transaction), the Safe React Hooks library will be valuable. It provides React contexts and hooks to manage Safe accounts easily in the fronten ([Safe React Hooks – Safe Docs](https://docs.safe.global/sdk/react-hooks#:~:text=The%20Safe%20React%20Hooks%20are,account%20using%20a%20React%20application))】. We could incorporate those to handle wallet connections (e.g., Safe Auth Kit for connecting an admin’s wallet) and Safe interactions in a user-friendly way.
- _Mainnet Deployment and Scalability:_ Once the concept is proven on testnet, we can deploy to a production network (mainnet or an L2 for lower fees ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,to%20a%20mainnet%2FL2%20once%20stable))】. For scaling, we might also explore batching transactions or using Safe’s Relay Kit (which leverages account abstraction via ERC-4337) to sponsor fees so that the agent Safes can perform actions without always needing the admin to pay ga ([GitHub \- safe-global/safe-core-sdk: The Safe{Core} SDK allows builders to add account abstraction functionality into their apps.](https://github.com/safe-global/safe-core-sdk#:~:text=information%20about%20a%20Safe%2C%20among,the%20Safe%20Core%20SDK%20packages))】.
- _Monitoring & Alerts:_ With on-chain events being emitted, we can set up a service to listen to these events (using web3 or a service like The Graph) to ensure everything is functioning. For example, alert if a Safe creation event doesn’t show up, or keep an index of on-chain events to cross-verify with the database periodically.

By implementing Safe now, we’ve upgraded the platform’s infrastructure to be web3-ready, unlocking a host of possibilities moving forward. The Safe integration is minimal yet powerful: it established a secure on-chain identity for AI agents and a reliable log of their critical actions. As we iterate, we can confidently build more features on this foundation, knowing that Safe (a proven smart wallet solution) is handling the heavy lifting of security and flexibility for on-chain account management.

**References:**

- Gige.co Marketplace PRD – \*Feature: Blockchain Integration with Safe (MVP) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=This%20feature%20introduces%20basic%20blockchain,chain%20layer%20that)) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,evident%20manner)) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,agentId)) ([gige.co/docs/artifacts/proto/prds/11-safe.md at safe · olegovsyannikov/gige.co · GitHub](https://github.com/olegovsyannikov/gige.co/blob/safe/docs/artifacts/proto/prds/11-safe.md#:~:text=,to%20the%20calling%20API%20route))】
- Safe Global – _Safe{Core} SDK Documentation_ (Safe Protocol Kit, API Kit, React Hooks ([GitHub \- safe-global/safe-core-sdk: The Safe{Core} SDK allows builders to add account abstraction functionality into their apps.](https://github.com/safe-global/safe-core-sdk#:~:text=api,a%20Safe%2C%20among%20other%20features)) ([Safe React Hooks – Safe Docs](https://docs.safe.global/sdk/react-hooks#:~:text=The%20Safe%20React%20Hooks%20are,account%20using%20a%20React%20application))】
- Safe Core SDK Demo – \*Code examples for SafeFactory and Safe deployment ([Generate your Safe Smart Account | Gnosis Chain](https://docs.gnosischain.com/technicalguides/account-abstraction/Safe%20and%20supported%20AA%20infra%20providers/integration-guide-for-safe#:~:text=const%20ethAdapter%20%3D%20new%20EthersAdapter%28,ethers%2C%20signerOrProvider%3A%20signer%2C)) ([Generate your Safe Smart Account | Gnosis Chain](https://docs.gnosischain.com/technicalguides/account-abstraction/Safe%20and%20supported%20AA%20infra%20providers/integration-guide-for-safe#:~:text=const%20safe%20%3D%20await%20safeFactory.deploySafe%28,to%20single%20owner%201))】.
