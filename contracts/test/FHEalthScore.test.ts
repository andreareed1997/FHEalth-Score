import { expect } from "chai";
import { ethers } from "hardhat";

describe("FHEalthScore", function () {
  let contract: any;
  let owner: any;
  let user1: any;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    const FHEalthScore = await ethers.getContractFactory("FHEalthScore");
    contract = await FHEalthScore.deploy();
    await contract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      expect(await contract.getAddress()).to.be.properAddress;
    });

    it("Should have no assessment initially", async function () {
      expect(await contract.hasAssessment()).to.equal(false);
    });

    it("Should return 0 for assessment count initially", async function () {
      expect(await contract.assessmentCount(owner.address)).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("Should revert getRiskLevel when no assessment exists", async function () {
      await expect(contract.getRiskLevel()).to.be.revertedWith("No assessment");
    });

    it("Should revert getTotalScore when no assessment exists", async function () {
      await expect(contract.getTotalScore()).to.be.revertedWith("No assessment");
    });

    it("Should return 0 timestamp when no assessment exists", async function () {
      expect(await contract.getAssessmentTimestamp()).to.equal(0);
    });
  });

  describe("View Functions", function () {
    it("Should return encrypted handles for factor getters (zero handles before assessment)", async function () {
      // Before any assessment, getters return zero handles
      // These are euint8 types, so they return bytes32
      const ageGrade = await contract.getAgeGrade();
      const bmiGrade = await contract.getBmiGrade();
      const bpGrade = await contract.getBpGrade();
      const glucoseGrade = await contract.getGlucoseGrade();
      const activityGrade = await contract.getActivityGrade();
      const smokingGrade = await contract.getSmokingGrade();

      // All should be zero handles (no assessment yet)
      expect(ageGrade).to.equal(0n);
      expect(bmiGrade).to.equal(0n);
      expect(bpGrade).to.equal(0n);
      expect(glucoseGrade).to.equal(0n);
      expect(activityGrade).to.equal(0n);
      expect(smokingGrade).to.equal(0n);
    });
  });

  describe("Contract Interface", function () {
    it("Should have correct function signatures", async function () {
      // Check that submitAssessment exists with correct parameter count
      const fragment = contract.interface.getFunction("submitAssessment");
      expect(fragment).to.not.be.null;
      expect(fragment?.inputs.length).to.equal(7); // 6 encrypted inputs + 1 proof
    });

    it("Should have all getter functions", async function () {
      expect(contract.interface.getFunction("getAgeGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getBmiGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getBpGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getGlucoseGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getActivityGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getSmokingGrade")).to.not.be.null;
      expect(contract.interface.getFunction("getTotalScore")).to.not.be.null;
      expect(contract.interface.getFunction("getRiskLevel")).to.not.be.null;
    });

    it("Should emit AssessmentSubmitted event on interface", async function () {
      const event = contract.interface.getEvent("AssessmentSubmitted");
      expect(event).to.not.be.null;
      expect(event?.inputs.length).to.equal(2); // user, timestamp
    });
  });

  describe("State Isolation", function () {
    it("Should isolate state between users", async function () {
      // User 1 has no assessment
      expect(await contract.connect(user1).hasAssessment()).to.equal(false);
      expect(await contract.connect(user1).assessmentCount(user1.address)).to.equal(0);

      // Owner also has no assessment
      expect(await contract.hasAssessment()).to.equal(false);
      expect(await contract.assessmentCount(owner.address)).to.equal(0);
    });
  });
});

