import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";
import { APP_NAME, SEPOLIA_RPC } from "./constants";
import { http } from "wagmi";

export const wagmiConfig = getDefaultConfig({
  appName: APP_NAME,
  projectId: "fhealth-score-demo",
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(SEPOLIA_RPC),
  },
  ssr: false,
});

