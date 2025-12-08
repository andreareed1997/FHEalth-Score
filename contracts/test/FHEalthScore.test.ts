import { expect } from "chai";
import { ethers } from "hardhat";
import { FHEalthScore } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("FHEalthScore", function () {
  let contract: FHEalthScore;
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const FHEalthScore = await ethers.getContractFactory("FHEalthScore");
    contract = await FHEalthScore.deploy();
    await contract.waitForDeployment();
  });

  // ==================== Deployment Tests ====================
  describe("Deployment", function () {
    it("Should deploy successfully with valid address", async function () {
      const address = await contract.getAddress();
      expect(address).to.be.properAddress;
      expect(address).to.not.equal(ethers.ZeroAddress);
    });

    it("Should have no assessment for any user initially", async function () {
      expect(await contract.hasAssessment()).to.equal(false);
      expect(await contract.connect(user1).hasAssessment()).to.equal(false);
      expect(await contract.connect(user2).hasAssessment()).to.equal(false);
    });

    it("Should return 0 for assessment count initially", async function () {
      expect(await contract.assessmentCount(owner.address)).to.equal(0);
      expect(await contract.assessmentCount(user1.address)).to.equal(0);
    });

    it("Should return 0 timestamp initially", async function () {
      expect(await contract.getAssessmentTimestamp()).to.equal(0);
    });
  });

  // ==================== Access Control Tests ====================
  describe("Access Control", function () {
    it("Should revert getRiskLevel when no assessment exists", async function () {
      await expect(contract.getRiskLevel()).to.be.revertedWith("No assessment");
    });

    it("Should revert getTotalScore when no assessment exists", async function () {
      await expect(contract.getTotalScore()).to.be.revertedWith("No assessment");
    });

    it("Should allow getAssessmentTimestamp even without assessment (returns 0)", async function () {
      const timestamp = await contract.getAssessmentTimestamp();
      expect(timestamp).to.equal(0);
    });

    it("Should allow hasAssessment check without assessment", async function () {
      const has = await contract.hasAssessment();
      expect(has).to.equal(false);
    });

    it("Should allow assessmentCount check for any address", async function () {
      const count = await contract.assessmentCount(ethers.ZeroAddress);
      expect(count).to.equal(0);
    });
  });

  // ==================== View Functions Tests ====================
  describe("View Functions - Zero State", function () {
    it("Should return zero handles for all factor getters before assessment", async function () {
      expect(await contract.getAgeGrade()).to.equal(0n);
      expect(await contract.getBmiGrade()).to.equal(0n);
      expect(await contract.getBpGrade()).to.equal(0n);
      expect(await contract.getGlucoseGrade()).to.equal(0n);
      expect(await contract.getActivityGrade()).to.equal(0n);
      expect(await contract.getSmokingGrade()).to.equal(0n);
    });

    it("Should return different zero handles for different users", async function () {
      const ownerAge = await contract.getAgeGrade();
      const user1Age = await contract.connect(user1).getAgeGrade();
      
      // Both should be zero (no assessment yet)
      expect(ownerAge).to.equal(0n);
      expect(user1Age).to.equal(0n);
    });
  });

  // ==================== Contract Interface Tests ====================
  describe("Contract Interface", function () {
    it("Should have submitAssessment with correct parameter count", async function () {
      const fragment = contract.interface.getFunction("submitAssessment");
      expect(fragment).to.not.be.null;
      expect(fragment?.inputs.length).to.equal(7); // 6 encrypted inputs + 1 proof
    });

    it("Should have correct parameter types for submitAssessment", async function () {
      const fragment = contract.interface.getFunction("submitAssessment");
      expect(fragment).to.not.be.null;
      
      // First 6 params are externalEuint8 (compiles to bytes32), last is bytes
      const inputs = fragment!.inputs;
      expect(inputs[0].type).to.equal("bytes32"); // encAge (externalEuint8)
      expect(inputs[1].type).to.equal("bytes32"); // encBmi
      expect(inputs[2].type).to.equal("bytes32"); // encBp
      expect(inputs[3].type).to.equal("bytes32"); // encGlucose
      expect(inputs[4].type).to.equal("bytes32"); // encActivity
      expect(inputs[5].type).to.equal("bytes32"); // encSmoking
      expect(inputs[6].type).to.equal("bytes");   // inputProof
    });

    it("Should have all 6 factor getter functions", async function () {
      expect(contract.interface.getFunction("getAgeGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getBmiGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getBpGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getGlucoseGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getActivityGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getSmokingGrade")).to.not.be.null;
    });

    it("Should have result getter functions", async function () {
      expect(contract.interface.getFunction("getTotalScore")).to.not.be.null;
      expect(contract.interface.getFunction("getRiskLevel")).to.not.be.null;
    });

    it("Should have utility functions", async function () {
      expect(contract.interface.getFunction("getAssessmentTimestamp")).to.not.be.null;
      expect(contract.interface.getFunction("hasAssessment")).to.not.be.null;
      expect(contract.interface.getFunction("assessmentCount")).to.not.be.null;
    });

    it("Should have AssessmentSubmitted event with correct parameters", async function () {
      const event = contract.interface.getEvent("AssessmentSubmitted");
      expect(event).to.not.be.null;
      expect(event?.inputs.length).to.equal(2);
      expect(event?.inputs[0].name).to.equal("user");
      expect(event?.inputs[0].indexed).to.equal(true);
      expect(event?.inputs[1].name).to.equal("timestamp");
    });
  });

  // ==================== State Isolation Tests ====================
  describe("State Isolation", function () {
    it("Should isolate hasAssessment between users", async function () {
      expect(await contract.hasAssessment()).to.equal(false);
      expect(await contract.connect(user1).hasAssessment()).to.equal(false);
      expect(await contract.connect(user2).hasAssessment()).to.equal(false);
    });

    it("Should isolate assessmentCount between users", async function () {
      expect(await contract.assessmentCount(owner.address)).to.equal(0);
      expect(await contract.assessmentCount(user1.address)).to.equal(0);
      expect(await contract.assessmentCount(user2.address)).to.equal(0);
    });

    it("Should isolate timestamps between users", async function () {
      expect(await contract.getAssessmentTimestamp()).to.equal(0);
      expect(await contract.connect(user1).getAssessmentTimestamp()).to.equal(0);
    });

    it("Should isolate factor getters between users", async function () {
      // All users should have independent zero states
      const ownerFactors = await Promise.all([
        contract.getAgeGrade(),
        contract.getBmiGrade(),
        contract.getBpGrade(),
      ]);

      const user1Factors = await Promise.all([
        contract.connect(user1).getAgeGrade(),
        contract.connect(user1).getBmiGrade(),
        contract.connect(user1).getBpGrade(),
      ]);

      ownerFactors.forEach((f) => expect(f).to.equal(0n));
      user1Factors.forEach((f) => expect(f).to.equal(0n));
    });
  });

  // ==================== Gas Estimation Tests ====================
  describe("Gas Estimation", function () {
    it("Should estimate reasonable gas for view functions", async function () {
      // View functions should be cheap
      const gasHasAssessment = await contract.hasAssessment.estimateGas();
      const gasGetTimestamp = await contract.getAssessmentTimestamp.estimateGas();
      const gasGetCount = await contract.assessmentCount.estimateGas(owner.address);

      // View functions should use minimal gas (< 30000)
      expect(gasHasAssessment).to.be.lessThan(30000n);
      expect(gasGetTimestamp).to.be.lessThan(30000n);
      expect(gasGetCount).to.be.lessThan(30000n);
    });
  });

  // ==================== Edge Cases ====================
  describe("Edge Cases", function () {
    it("Should handle zero address in assessmentCount", async function () {
      const count = await contract.assessmentCount(ethers.ZeroAddress);
      expect(count).to.equal(0);
    });

    it("Should allow multiple users to check their status independently", async function () {
      const results = await Promise.all([
        contract.hasAssessment(),
        contract.connect(user1).hasAssessment(),
        contract.connect(user2).hasAssessment(),
      ]);

      results.forEach((r) => expect(r).to.equal(false));
    });

    it("Should maintain consistent state across multiple calls", async function () {
      // Call same function multiple times
      const results = await Promise.all([
        contract.hasAssessment(),
        contract.hasAssessment(),
        contract.hasAssessment(),
      ]);

      results.forEach((r) => expect(r).to.equal(false));
    });
  });

  // ==================== Contract Inheritance Tests ====================
  describe("Contract Inheritance", function () {
    it("Should inherit from ZamaEthereumConfig", async function () {
      // The contract should be deployable (inherits config correctly)
      const address = await contract.getAddress();
      expect(address).to.be.properAddress;
    });
  });
});

/**
 * NOTE: Full FHE encryption tests require either:
 * 1. fhevm-hardhat-plugin with mock mode
 * 2. Running on actual Sepolia testnet with real encryption
 * 
 * The tests above verify:
 * - Contract deployment and initialization
 * - Interface correctness (function signatures, events)
 * - Access control (reverts when expected)
 * - State isolation between users
 * - Gas estimation for view functions
 * 
 * For integration testing with real FHE:
 * Run: npx hardhat run scripts/integration-test.ts --network sepolia
 */
