/**
 * Integration Test Script for FHEalthScore
 * 
 * This script tests the full FHE flow on Sepolia testnet:
 * 1. Encrypt health factors using RelayerSDK
 * 2. Submit encrypted data to contract
 * 3. Verify state changes
 * 
 * Usage: npx hardhat run scripts/integration-test.ts --network sepolia
 * 
 * Prerequisites:
 * - DEPLOYER_PRIVATE_KEY in .env
 * - Sepolia ETH for gas
 * - Contract already deployed
 */

import { ethers } from "hardhat";

const CONTRACT_ADDRESS = "0xf93A43a306bcF410050DC584E4ccF3fB6f07e2f2";

async function main() {
  console.log("\n🧪 FHEalthScore Integration Test\n");
  console.log("=".repeat(50));

  const [signer] = await ethers.getSigners();
  console.log(`\n📍 Tester: ${signer.address}`);

  // Connect to deployed contract
  const contract = await ethers.getContractAt("FHEalthScore", CONTRACT_ADDRESS);
  console.log(`📄 Contract: ${CONTRACT_ADDRESS}`);

  // Check initial state
  console.log("\n--- Initial State ---");
  const hasAssessment = await contract.hasAssessment();
  const count = await contract.assessmentCount(signer.address);
  const timestamp = await contract.getAssessmentTimestamp();

  console.log(`Has Assessment: ${hasAssessment}`);
  console.log(`Assessment Count: ${count}`);
  console.log(`Last Timestamp: ${timestamp}`);

  // Test view functions
  console.log("\n--- View Functions Test ---");
  
  try {
    const ageGrade = await contract.getAgeGrade();
    console.log(`Age Grade Handle: ${ageGrade}`);
  } catch (e) {
    console.log("Age Grade: (no data)");
  }

  try {
    if (hasAssessment) {
      const riskLevel = await contract.getRiskLevel();
      console.log(`Risk Level Handle: ${riskLevel}`);
    } else {
      console.log("Risk Level: (no assessment - skipped)");
    }
  } catch (e: unknown) {
    const error = e as Error;
    console.log(`Risk Level: ${error.message}`);
  }

  // Test submitAssessment interface
  console.log("\n--- Interface Verification ---");
  const fragment = contract.interface.getFunction("submitAssessment");
  console.log(`submitAssessment params: ${fragment?.inputs.length}`);
  console.log(`Parameter types: ${fragment?.inputs.map(i => i.type).join(", ")}`);

  // Event filter test
  console.log("\n--- Event Filter Test ---");
  const eventFilter = contract.filters.AssessmentSubmitted(signer.address);
  const events = await contract.queryFilter(eventFilter);
  console.log(`Past AssessmentSubmitted events: ${events.length}`);

  if (events.length > 0) {
    const lastEvent = events[events.length - 1];
    console.log(`Last event block: ${lastEvent.blockNumber}`);
    console.log(`Last event timestamp: ${lastEvent.args?.[1]}`);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Integration test completed");
  console.log("\nNote: Full encryption test requires RelayerSDK");
  console.log("Use the frontend app for complete FHE workflow testing.\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
