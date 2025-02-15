import * as fs from "fs";
import { ethers, upgrades } from "hardhat";
import * as path from "path";

async function main() {
  try {
    console.log("Starting deployment process...");

    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    console.log("Deploying Registry contract...");
    const Registry = await ethers.getContractFactory("Registry");

    console.log("Deploying proxy...");
    const registry = await upgrades.deployProxy(Registry, [], {
      initializer: "initialize",
      kind: "uups",
    });

    console.log("Waiting for deployment transaction...");
    await registry.waitForDeployment();

    const address = await registry.getAddress();
    console.log("Registry proxy deployed to:", address);

    const implementationAddress =
      await upgrades.erc1967.getImplementationAddress(address);
    console.log("Registry implementation deployed to:", implementationAddress);

    // Update .env file in the parent directory
    const envPath = path.join(__dirname, "../../.env");
    let envContent = "";

    try {
      envContent = fs.readFileSync(envPath, "utf8");
    } catch (error: unknown) {
      console.log("No existing .env file found. Creating new one.");
    }

    const registryAddressLine = `REGISTRY_CONTRACT_ADDRESS=${address}`;
    const registryImplAddressLine = `REGISTRY_IMPLEMENTATION_ADDRESS=${implementationAddress}`;

    if (envContent.includes("REGISTRY_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /REGISTRY_CONTRACT_ADDRESS=.*/,
        registryAddressLine
      );
    } else {
      envContent = envContent + "\n" + registryAddressLine + "\n";
    }

    if (envContent.includes("REGISTRY_IMPLEMENTATION_ADDRESS=")) {
      envContent = envContent.replace(
        /REGISTRY_IMPLEMENTATION_ADDRESS=.*/,
        registryImplAddressLine
      );
    } else {
      envContent = envContent + registryImplAddressLine + "\n";
    }

    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env file with new contract addresses");
  } catch (error) {
    console.error("Deployment failed with error:", error);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
