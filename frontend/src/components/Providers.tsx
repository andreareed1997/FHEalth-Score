"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useState, type ReactNode } from "react";

import { wagmiConfig } from "@/config/wagmi";
import { theme } from "@/styles/theme";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#2B8CFF",
            accentColorForeground: "white",
            borderRadius: "large",
            fontStack: "system",
          })}
          modalSize="compact"
          locale="en"
        >
          <ChakraProvider theme={theme}>
            {children}
          </ChakraProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

