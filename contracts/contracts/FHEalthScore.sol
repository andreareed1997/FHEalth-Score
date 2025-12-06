// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, ebool, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title FHEalthScore - Encrypted Health Risk Scoring
 * @notice 6 encrypted health factors computed entirely on-chain using FHE
 * @dev All risk calculations happen on ciphertexts - contract never sees plaintext
 * 
 * Factor encoding (each 0-3):
 *   - Age: 0=18-30, 1=31-45, 2=46-60, 3=61+
 *   - BMI: 0=Normal, 1=Overweight, 2=Obese Class I, 3=Obese Class II+
 *   - Blood Pressure: 0=Normal, 1=Elevated, 2=High Stage 1, 3=High Stage 2
 *   - Glucose: 0=Normal, 1=Prediabetes, 2=Diabetes
 *   - Activity: 0=Active(5+days), 1=Moderate(3-4), 2=Low(1-2), 3=Sedentary
 *   - Smoking: 0=Never, 1=Former, 2=Current
 * 
 * Risk Level:
 *   - Low (0): Total score < 5
 *   - Guarded (1): Total score 5-7
 *   - Medium (2): Total score 8-10
 *   - High (3): Total score 11-13
 *   - Critical (4): Total score 14+
 */
contract FHEalthScore is ZamaEthereumConfig {
    
    // ==================== State Variables ====================
    
    mapping(address => euint8) private ageGrade;
    mapping(address => euint8) private bmiGrade;
    mapping(address => euint8) private bpGrade;
    mapping(address => euint8) private glucoseGrade;
    mapping(address => euint8) private activityGrade;
    mapping(address => euint8) private smokingGrade;
    mapping(address => euint8) private totalScore;
    mapping(address => euint8) private riskLevel;
    mapping(address => uint256) private timestamps;
    mapping(address => uint256) public assessmentCount;
    
    // ==================== Events ====================
    
    event AssessmentSubmitted(address indexed user, uint256 timestamp);
    
    // ==================== Constructor ====================
    
    constructor() {}
    
    // ==================== Main Functions ====================
    
    /**
     * @notice Submit 6 encrypted health factors for on-chain FHE computation
     */
    function submitAssessment(
        externalEuint8 encAge,
        externalEuint8 encBmi,
        externalEuint8 encBp,
        externalEuint8 encGlucose,
        externalEuint8 encActivity,
        externalEuint8 encSmoking,
        bytes calldata inputProof
    ) external {
        // Convert and store each factor
        euint8 age = FHE.fromExternal(encAge, inputProof);
        euint8 bmi = FHE.fromExternal(encBmi, inputProof);
        euint8 bp = FHE.fromExternal(encBp, inputProof);
        euint8 glucose = FHE.fromExternal(encGlucose, inputProof);
        euint8 activity = FHE.fromExternal(encActivity, inputProof);
        euint8 smoking = FHE.fromExternal(encSmoking, inputProof);
        
        // Store factors
        ageGrade[msg.sender] = age;
        bmiGrade[msg.sender] = bmi;
        bpGrade[msg.sender] = bp;
        glucoseGrade[msg.sender] = glucose;
        activityGrade[msg.sender] = activity;
        smokingGrade[msg.sender] = smoking;
        timestamps[msg.sender] = block.timestamp;
        
        // Grant permissions
        _allowFactor(age);
        _allowFactor(bmi);
        _allowFactor(bp);
        _allowFactor(glucose);
        _allowFactor(activity);
        _allowFactor(smoking);
        
        // Calculate total score: sum of all 6 factors
        euint8 sum1 = FHE.add(age, bmi);
        euint8 sum2 = FHE.add(bp, glucose);
        euint8 sum3 = FHE.add(activity, smoking);
        euint8 sum12 = FHE.add(sum1, sum2);
        euint8 total = FHE.add(sum12, sum3);
        
        totalScore[msg.sender] = total;
        _allowFactor(total);
        
        // Calculate risk level
        euint8 level = _calculateRiskLevel(total);
        riskLevel[msg.sender] = level;
        _allowFactor(level);
        
        assessmentCount[msg.sender]++;
        
        emit AssessmentSubmitted(msg.sender, block.timestamp);
    }
    
    function _allowFactor(euint8 factor) internal {
        FHE.allowThis(factor);
        FHE.allow(factor, msg.sender);
    }
    
    function _calculateRiskLevel(euint8 total) internal returns (euint8) {
        // Constants
        euint8 t5 = FHE.asEuint8(5);
        euint8 t8 = FHE.asEuint8(8);
        euint8 t11 = FHE.asEuint8(11);
        euint8 t14 = FHE.asEuint8(14);
        
        euint8 l0 = FHE.asEuint8(0);
        euint8 l1 = FHE.asEuint8(1);
        euint8 l2 = FHE.asEuint8(2);
        euint8 l3 = FHE.asEuint8(3);
        euint8 l4 = FHE.asEuint8(4);
        
        // Conditions
        ebool isLow = FHE.lt(total, t5);
        ebool isGuarded = FHE.lt(total, t8);
        ebool isMedium = FHE.lt(total, t11);
        ebool isHigh = FHE.lt(total, t14);
        
        // Nested select: l4 -> l3 -> l2 -> l1 -> l0
        euint8 result = FHE.select(isLow, l0,
            FHE.select(isGuarded, l1,
                FHE.select(isMedium, l2,
                    FHE.select(isHigh, l3, l4))));
        
        return result;
    }
    
    // ==================== View Functions ====================
    
    function getAgeGrade() external view returns (euint8) {
        return ageGrade[msg.sender];
    }
    
    function getBmiGrade() external view returns (euint8) {
        return bmiGrade[msg.sender];
    }
    
    function getBpGrade() external view returns (euint8) {
        return bpGrade[msg.sender];
    }
    
    function getGlucoseGrade() external view returns (euint8) {
        return glucoseGrade[msg.sender];
    }
    
    function getActivityGrade() external view returns (euint8) {
        return activityGrade[msg.sender];
    }
    
    function getSmokingGrade() external view returns (euint8) {
        return smokingGrade[msg.sender];
    }
    
    function getTotalScore() external view returns (euint8) {
        require(timestamps[msg.sender] > 0, "No assessment");
        return totalScore[msg.sender];
    }
    
    function getRiskLevel() external view returns (euint8) {
        require(timestamps[msg.sender] > 0, "No assessment");
        return riskLevel[msg.sender];
    }
    
    function getAssessmentTimestamp() external view returns (uint256) {
        return timestamps[msg.sender];
    }
    
    function hasAssessment() external view returns (bool) {
        return timestamps[msg.sender] > 0;
    }
}
