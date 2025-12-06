export const APP_NAME = "F HEalth Score";
export const CHAIN_ID = 11155111;
export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ??
  "0xf93A43a306bcF410050DC584E4ccF3fB6f07e2f2") as `0x${string}`;
export const SEPOLIA_RPC =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC ??
  "https://eth-sepolia.g.alchemy.com/v2/rsJU039kYSI7E7jCHUCni";
export const RELAYER_URL =
  process.env.NEXT_PUBLIC_RELAYER_URL ?? "https://relayer.testnet.zama.cloud";
export const GATEWAY_URL =
  process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://relayer.testnet.zama.cloud";
export const ACL_ADDRESS =
  (process.env.NEXT_PUBLIC_ACL_ADDRESS ??
    "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D") as `0x${string}`;
export const KMS_ADDRESS =
  (process.env.NEXT_PUBLIC_KMS_ADDRESS ??
    "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A") as `0x${string}`;
export const EXPLORER_BASE = "https://sepolia.etherscan.io/address/";

