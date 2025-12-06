"use client";

import type { Hex, WalletClient, Account } from "viem";

export type AssessmentInput = {
  age: number;
  bmi: number;
  systolic: number;
  glucose: number;
  activity: number;
  smoking: number;
};

export type EncryptedAssessment = {
  handles: Hex[];
  inputProof: Hex;
};

// Convert health factors to 6 risk grades (0-3 each except smoking 0-2)
function categorizeRisks(values: AssessmentInput): number[] {
  // Age grade: 0=18-30, 1=31-45, 2=46-60, 3=61+
  const ageGrade = values.age < 31 ? 0 : values.age < 46 ? 1 : values.age < 61 ? 2 : 3;
  
  // BMI grade: 0=Normal(<25), 1=Overweight(25-30), 2=Obese I(30-35), 3=Obese II+(35+)
  const bmiGrade = values.bmi < 25 ? 0 : values.bmi < 30 ? 1 : values.bmi < 35 ? 2 : 3;
  
  // Blood pressure grade: 0=Normal(<120), 1=Elevated(120-140), 2=High I(140-160), 3=High II(160+)
  const bpGrade = values.systolic < 120 ? 0 : values.systolic < 140 ? 1 : values.systolic < 160 ? 2 : 3;
  
  // Glucose grade: 0=Normal(<100), 1=Prediabetes(100-126), 2=Diabetes(126+)
  const glucoseGrade = values.glucose < 100 ? 0 : values.glucose < 126 ? 1 : 2;
  
  // Activity grade: 0=Active(5+), 1=Moderate(3-4), 2=Low(1-2), 3=Sedentary(0)
  const activityGrade = values.activity >= 5 ? 0 : values.activity >= 3 ? 1 : values.activity >= 1 ? 2 : 3;
  
  // Smoking grade: 0=Never, 1=Former, 2=Current
  const smokingGrade = values.smoking;

  return [ageGrade, bmiGrade, bpGrade, glucoseGrade, activityGrade, smokingGrade];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let instance: any = null;
let sdkLoaded = false;

const toHex = (data: Uint8Array | bigint): Hex => {
  if (typeof data === "bigint") {
    // Convert BigInt to 32-byte hex string (padded)
    return `0x${data.toString(16).padStart(64, "0")}` as Hex;
  }
  return `0x${Array.from(data)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")}` as Hex;
};

// Load SDK from CDN
async function loadSDKFromCDN(): Promise<void> {
  if (sdkLoaded) return;
  if (typeof window === "undefined") {
    throw new Error("SDK can only be loaded in browser");
  }

  return new Promise((resolve, reject) => {
    // Check if already loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).RelayerSDK || (window as any).relayerSDK) {
      sdkLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs";
    script.async = true;
    script.onload = () => {
      sdkLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error("Failed to load RelayerSDK from CDN"));
    };
    document.head.appendChild(script);
  });
}

export async function initFhevm() {
  if (typeof window === "undefined") {
    throw new Error("FHEVM can only be initialized in browser");
  }
  
  if (instance) return instance;

  // Load SDK from CDN
  await loadSDKFromCDN();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sdk = (window as any).RelayerSDK || (window as any).relayerSDK;
  if (!sdk) {
    throw new Error("RelayerSDK not available after loading");
  }

  const { initSDK, createInstance, SepoliaConfig } = sdk;

  await initSDK();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const network = (window as any).ethereum ?? SepoliaConfig.network;

  instance = await createInstance({
    ...SepoliaConfig,
    network,
  });

  return instance;
}

export async function checkFhevm(): Promise<boolean> {
  try {
    await initFhevm();
    return true;
  } catch (err) {
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    } else if (typeof err === "object" && err !== null) {
      errorMessage = JSON.stringify(err, null, 2);
    } else {
      errorMessage = String(err);
    }
    console.error("FHEVM check failed:", errorMessage);
    instance = null;
    return false;
  }
}

export async function encryptAssessment(
  values: AssessmentInput,
  userAddress: `0x${string}`,
  contractAddress: `0x${string}`
): Promise<EncryptedAssessment> {
  const fhe = await initFhevm();
  const zk = fhe.createEncryptedInput(contractAddress, userAddress);

  const grades = categorizeRisks(values);
  grades.forEach((grade) => zk.add8(grade));

  const result = await zk.encrypt();

  return {
    handles: result.handles.map(toHex),
    inputProof: toHex(result.inputProof),
  };
}

export async function decryptRiskLevel({
  handle,
  contractAddress,
  userAddress,
  walletClient,
}: {
  handle: bigint | `0x${string}`;
  contractAddress: `0x${string}`;
  userAddress: `0x${string}`;
  walletClient: WalletClient;
}): Promise<number> {
  const fhe = await initFhevm();
  const { publicKey, privateKey } = fhe.generateKeypair();

  // Create EIP712 signature data
  const now = Math.floor(Date.now() / 1000);
  const durationDays = 1; // 1 day validity

  const eip712 = fhe.createEIP712(
    publicKey,
    [contractAddress],
    now,
    durationDays
  );

  const signerAccount: Account | `0x${string}` =
    walletClient.account ?? userAddress;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const signature = await walletClient.signTypedData({
    account: signerAccount,
    domain: eip712.domain as Parameters<typeof walletClient.signTypedData>[0]["domain"],
    primaryType: eip712.primaryType as string,
    types: eip712.types as Parameters<typeof walletClient.signTypedData>[0]["types"],
    message: eip712.message as Parameters<typeof walletClient.signTypedData>[0]["message"],
  });

  let handleHex: `0x${string}`;
  if (typeof handle === "string" && handle.startsWith("0x")) {
    handleHex = handle as `0x${string}`;
  } else {
    const hexStr = (typeof handle === "bigint" ? handle : BigInt(handle)).toString(16).padStart(64, "0");
    handleHex = `0x${hexStr}` as `0x${string}`;
  }

  const clearValues = await fhe.userDecrypt(
    [{ handle: handleHex, contractAddress }],
    privateKey,
    publicKey,
    signature,
    [contractAddress],
    userAddress,
    now,
    durationDays
  );

  // Get decrypted value
  const clearValue = clearValues[handleHex];
  if (clearValue === undefined) {
    throw new Error("Decryption failed: no clear value returned");
  }

  return Number(clearValue);
}

// Reset instance (for wallet disconnect)
export function resetFhevm() {
  instance = null;
}
