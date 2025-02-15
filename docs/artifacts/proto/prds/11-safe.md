# 11. Feature: Blockchain Integration with Safe (MVP)

## 11.1 Purpose

This feature introduces **basic blockchain capabilities** into the existing AI gig marketplace (agents, jobs, job assignment, execution). The aim is to demonstrate a **minimal but functional** on-chain layer that:

1. **Automatically creates a Safe (modular smart account)** for each AI agent.
2. **Registers and logs essential data** (e.g., agent creation, job references, job logs) on a blockchain.
3. Uses **Safe** (a.k.a. Gnosis Safe) to leverage account abstraction features (e.g., spending limits, role-based controls).
4. Remains **simple enough to build, deploy, and test quickly** during the MVP phase.

This will **lay the groundwork** for future expansion into more advanced smart contract features (escrow, staking, governance) while keeping the initial scope minimal.

---

## 11.2 User Stories

- **As a Platform Admin**, when I register a new AI agent, the system automatically deploys a **Safe** wallet for that agent on a testnet (e.g., Goerli), then stores the agent’s Safe address in the local database.
- **As a Developer**, I want to record essential references (agent creation, job logs) on-chain for transparency. The system should write minimal data (e.g., job ID, timestamps) to a simple registry contract or directly as an event on the agent’s Safe.
- **As a Client**, I should see that each agent has an on-chain address (the Safe) and can trust that relevant job data is recorded on-chain in a tamper-evident manner.

---

## 11.3 Functional Requirements

### 11.3.1 Safe Wallet Creation for Agents

1. **Automatic Safe Deployment**
   - Upon agent registration, call a script or API using the **Safe{Core}** SDK or the Safe factory contract on a testnet (e.g., Goerli).
   - Generate a new Safe that has a single owner (e.g., the agent’s signer) or a multi-sig setup if desired (agent + admin oversight).
   - Store the resulting Safe address in the `Agent` record (`agent.safeAddress`) in the local database.
2. **Initialization/Configuration**
   - (Optional) Attach a **SpendingLimit** module with a small daily limit (for demonstration).
   - (Optional) Allow an admin signer to override or co-sign large transactions in the MVP.

### 11.3.2 On-Chain Registration of Agent, Jobs, and Logs

1. **Agent Registration**
   - **Minimal On-Chain Storage**: Could store an event log or a small record (like agent ID + Safe address) in a “Registry” contract or by emitting an event from a central `AgentRegistry` contract:
     ```solidity
     event AgentRegistered(bytes32 agentId, address safeAddress);
     ```
   - Alternatively, call the `Safe` itself to emit an event referencing the new agent, but a simple dedicated `AgentRegistry` contract is more straightforward for the MVP.
2. **Job References**
   - When a **new job** is created or assigned, the system writes a short reference on-chain (e.g., `jobId`, `assignedAgentSafe`) via a transaction to the same registry contract:
     ```solidity
     event JobAssigned(bytes32 jobId, address agentSafe, uint256 timestamp);
     ```
   - Keep it minimal to avoid high gas costs—just store essential references (no full job data).
3. **Job Logs**
   - Each time a job execution is triggered, or a result is validated, **emit an event** on the chain from the same registry (e.g., `JobLogCreated(jobId, agentSafe, status, timestamp)`).
   - The local DB remains the source of truth for detailed logs, but the on-chain event proves that a log entry existed at a certain time.

### 11.3.3 Frontend Integration

1. **Admin Panel** (`/admin/agents`)

   - When creating a new agent, the frontend calls an API route (e.g. `POST /api/admin/agents`) which:
     1. Creates a DB record.
     2. Deploys a Safe on testnet (server-side code using the Safe SDK).
     3. Calls the `AgentRegistry` contract to emit `AgentRegistered(agentId, safeAddress)`.
     4. Updates the DB with the resulting Safe address and transaction hash.
   - Display the agent’s Safe address on the Agent Detail page.

2. **User View** (`/agents/[agentId]`)

   - Show the **on-chain** Safe address.
   - Possibly link to a block explorer (e.g. “View on Etherscan”) for transparency.

3. **Job Detail** (`/jobs/[jobId]`)
   - If the job logs are recorded on-chain, show **“On-chain record”** with a link to the transaction or event in a block explorer.

### 11.3.4 Backend/Service Modules

1. **Safe Deployment Service**
   - A dedicated backend service (e.g., `services/safeService.ts`) that uses the Safe{Core} SDK or ethers.js:
     - Deploys a new Safe via the factory.
     - Optionally configures a **SpendingLimit** module with a daily cap.
     - Returns the Safe address to the calling API route.
2. **RegistryContract Interaction**

   - A minimal `Registry` contract (Solidity) deployed on testnet with methods or just events:

     ```solidity
     // Pseudocode snippet
     contract AgentRegistry {
       event AgentRegistered(bytes32 indexed agentId, address indexed safe);
       event JobAssigned(bytes32 indexed jobId, address indexed safe, uint256 timestamp);
       event JobLogCreated(bytes32 indexed jobId, address indexed safe, string status, uint256 timestamp);

       // (Optional) if storing state:
       mapping(bytes32 => address) public agentToSafe;

       function registerAgent(bytes32 agentId, address safe) external {
         // optionally require msg.sender to be platform admin
         agentToSafe[agentId] = safe;
         emit AgentRegistered(agentId, safe);
       }

       function assignJob(bytes32 jobId, address safe) external {
         emit JobAssigned(jobId, safe, block.timestamp);
       }

       function logJob(bytes32 jobId, address safe, string calldata status) external {
         emit JobLogCreated(jobId, safe, status, block.timestamp);
       }
     }
     ```

   - The backend calls these methods whenever an agent is created, a job is assigned, or a job log is finalized.

---

## 11.4 Non-Functional Requirements

1. **Simplicity / MVP Scope**:
   - No complex escrow or multi-sig flows are required for this first on-chain integration—focus on quick deployment and a working prototype.
   - Avoid storing large data on-chain (keep it to IDs, statuses, timestamps).
2. **Fast Testing & Deployment**:
   - Use a testnet (Goerli or similar) and a minimal `Registry` contract.
   - Provide script(s) for rapid contract deployment (e.g., using Hardhat).
3. **Security**:
   - Rely on Safe’s audited core for wallet creation.
   - Keep the registry contract logic very simple to reduce attack surface.
4. **Scalability**:
   - The events approach is cost-effective and easily extended later if we move to more advanced features (escrow, etc.).

---

## 11.5 Technical Details & Implementation Steps

1. **Deploy a `Registry` Contract on Testnet**
   - Use Hardhat or Foundry to compile & deploy.
   - Store the deployed address in an environment variable (e.g. `REGISTRY_CONTRACT_ADDRESS`).
2. **Integrate Safe{Core}** for Agent Creation
   - Install Safe’s TypeScript SDK.
   - In `services/safeService.ts`, create a function `deployAgentSafe(ownerAddress: string)` that:
     1. Uses the `SafeFactory` from `@safe-global/protocol-kit` (or appropriate package).
     2. Creates a Safe with `ownerAddress` as the sole signer (for MVP).
     3. Returns the deployed Safe’s address.
3. **Backend Flow** for **POST /api/admin/agents**:
   1. Create the Agent record in the local DB (with a temporary “pending” state).
   2. Call `deployAgentSafe()` to get the Safe address.
   3. Use ethers.js (or the same Safe library) to call `agentRegistry.registerAgent(agentId, safeAddress)` (the contract function).
   4. Update the Agent record with `safeAddress` and the transaction hash.
4. **Recording Jobs and Logs**
   - For **job assignment**: in `POST /api/jobs/assign`, after updating the DB, call `agentRegistry.assignJob(jobId, agent.safeAddress)`.
   - For **job logs**: each time `execute` or `validate` is done, call `agentRegistry.logJob(jobId, agent.safeAddress, status)`.
5. **Frontend**
   - In the **Admin** panel for agents:
     - Display the “Safe Address” if present.
     - Optionally show a “View on Explorer” link if transactionHash is available.
   - In the **Job Detail** page:
     - Show if an on-chain reference exists (link to block explorer for the `JobAssigned` event).
6. **Testing**
   - Write **integration tests** covering the entire flow: create agent → Safe gets deployed → event is emitted → verify the transaction on testnet.
   - Mock out or run testnet/forked environment so you can confirm the events are stored properly.

---

## 11.6 Success Criteria

1. **Automatic Safe Setup**: New AI agents automatically receive a Safe on testnet, address stored in DB.
2. **Minimal On-Chain Logging**: The `Registry` contract successfully emits events for agent creation, job assignment, and job logs without blocking normal MVP functionality.
3. **Observable On Explorer**: Admin can click a link to a testnet explorer (e.g., Goerli Etherscan) to see the events.
4. **No Regressions**: The existing agent and job flows continue to function with no disruption.
5. **Deploy & Test Speed**: The entire setup (Registry contract + Safe creation) is straightforward enough to deploy and test quickly.

---

## 11.7 Future Considerations

- **Escrow & Payment**: Extend to a real on-chain escrow flow using Safe modules once basic logging is proven in production.
- **Multi-Sig**: Add multi-owner logic (agent + platform or agent + client) to enforce a secure spend limit or manual approval for large transactions.
- **On-Chain Reputation**: Use NFTs or other tokens in each agent’s Safe to track achievements.
- **DAO Governance**: Possibly incorporate SafeSnap or a governance module for community-driven rule changes.
- **Production Rollout**: Switch from testnet to a mainnet/L2 once stable.
