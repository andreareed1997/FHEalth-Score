"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Spacer,
  Text,
  VStack,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useWalletClient, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "wagmi/actions";
import abiJson from "@/abi/FHEalthScore.json";
import { ProcessSteps } from "@/components/ProcessSteps";
import type { StepState } from "@/components/ProcessSteps";
import { ResultCard } from "@/components/ResultCard";
import { RiskForm } from "@/components/RiskForm";
import { StatusBar } from "@/components/StatusBar";
import {
  APP_NAME,
  CHAIN_ID,
  CONTRACT_ADDRESS,
} from "@/config/constants";
import { wagmiConfig } from "@/config/wagmi";
import {
  decryptRiskLevel,
  encryptAssessment,
  checkFhevm,
  resetFhevm,
} from "@/lib/fhevm";
import type { AssessmentInput } from "@/lib/fhevm";
import { mapRisk } from "@/lib/risk";
import type { RiskLevel } from "@/lib/risk";

const abi = abiJson.abi;

export default function Home() {
  const toast = useToast({ position: "top" });
  const [fheStatus, setFheStatus] = useState<"checking" | "ready" | "error">(
    "checking"
  );
  const [inputs, setInputs] = useState<AssessmentInput>({
    age: 38,
    bmi: 22,
    systolic: 110,
    glucose: 90,
    activity: 4,
    smoking: 0,
  });
  const [steps, setSteps] = useState<{ label: string; state: StepState }[]>([
    { label: "Encrypt 6 factors", state: "idle" },
    { label: "FHE on-chain compute", state: "idle" },
    { label: "Decrypt result", state: "idle" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);

  const account = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { writeContractAsync } = useWriteContract();

  // Initialize FHEVM
  useEffect(() => {
    checkFhevm().then((ok) => setFheStatus(ok ? "ready" : "error"));
  }, []);

  // Reset FHEVM on wallet disconnect
  useEffect(() => {
    if (account.status === "disconnected") {
      resetFhevm();
      setScore(null);
      setRiskLevel(null);
      setSteps((prev) => prev.map((s) => ({ ...s, state: "idle" })));
    }
  }, [account.status]);

  // Auto switch to Sepolia
  useEffect(() => {
    if (account.status === "connected" && chainId !== CHAIN_ID) {
      try {
        switchChain({ chainId: CHAIN_ID });
      } catch {
        toast({
          status: "error",
          description: "Please switch to Sepolia network.",
        });
      }
    }
  }, [account.status, chainId, switchChain, toast]);

  const updateStep = (
    index: number,
    state: "idle" | "running" | "done" | "error"
  ) => setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, state } : s)));

  const handleSubmit = async () => {
    if (!account.address) {
      toast({
        status: "warning",
        description: "Please connect your wallet first.",
      });
      return;
    }
    const userAddress = account.address as `0x${string}`;
    setIsSubmitting(true);
    setScore(null);
    setRiskLevel(null);
    updateStep(0, "running");
    updateStep(1, "idle");
    updateStep(2, "idle");

    try {
      // Step 1: Encrypt 6 health factors
      const encrypted = await encryptAssessment(inputs, userAddress, CONTRACT_ADDRESS);
      updateStep(0, "done");
      updateStep(1, "running");

      // Step 2: Submit to chain
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "submitAssessment",
        args: [
          encrypted.handles[0], // age
          encrypted.handles[1], // bmi
          encrypted.handles[2], // bloodPressure
          encrypted.handles[3], // glucose
          encrypted.handles[4], // activity
          encrypted.handles[5], // smoking
          encrypted.inputProof,
        ],
        gas: 10_000_000n, // FHE operations need more gas
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      if (receipt.status === "reverted") {
        throw new Error("Transaction reverted on-chain");
      }
      updateStep(1, "done");
      updateStep(2, "running");

      // Step 3: Decrypt risk level
      const encryptedHandle = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "getRiskLevel",
        args: [],
        account: userAddress,
      });

      if (!walletClient) throw new Error("Wallet client missing");

      const clear = await decryptRiskLevel({
        handle: encryptedHandle as bigint | `0x${string}`,
        contractAddress: CONTRACT_ADDRESS,
        userAddress,
        walletClient,
      });

      const totalScoreHandle = await readContract(wagmiConfig, {
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "getTotalScore",
        args: [],
        account: userAddress,
      });

      const totalScore = await decryptRiskLevel({
        handle: totalScoreHandle as bigint | `0x${string}`,
        contractAddress: CONTRACT_ADDRESS,
        userAddress,
        walletClient,
      });

      setScore(totalScore);
      setRiskLevel(mapRisk(totalScore));
      updateStep(2, "done");
      
      toast({
        status: "success",
        description: `Assessment completed! Risk Level: ${clear}`,
      });
    } catch (err) {
      console.error(err);
      updateStep(0, "error");
      updateStep(1, "error");
      updateStep(2, "error");
      toast({
        status: "error",
        description: "Assessment failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg="bg.dark" color="white" position="relative" overflow="hidden">
      {/* Background decoration */}
      <Box
        position="absolute"
        top="-20%"
        right="-10%"
        w="800px"
        h="800px"
        bg="brand.500"
        filter="blur(180px)"
        opacity="0.1"
        borderRadius="full"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-10%"
        w="600px"
        h="600px"
        bg="accent.500"
        filter="blur(180px)"
        opacity="0.05"
        borderRadius="full"
        zIndex={0}
      />

      <Container maxW="container.xl" pt={6} pb={20} position="relative" zIndex={1}>
        {/* Header */}
        <Flex align="center" mb={12}>
          <HStack spacing={3}>
            <Box w={10} h={10} bg="brand.500" borderRadius="xl" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="xl" fontWeight="bold">F</Text>
            </Box>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
              {APP_NAME}
            </Text>
          </HStack>
          <Spacer />
          <HStack spacing={4}>
            <StatusBar
              fheStatus={fheStatus}
              contractAddress={CONTRACT_ADDRESS}
              walletAddress={account.address as `0x${string}` | undefined}
            />
            {/* RainbowKit Connect Button */}
            <ConnectButton.Custom>
              {({
                account: rkAccount,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted;
                const connected = ready && rkAccount && chain;

                return (
                  <Box
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <Button onClick={openConnectModal} size="md">
                            Connect Wallet
                          </Button>
                        );
                      }

                      if (chain.unsupported) {
                        return (
                          <Button onClick={openChainModal} colorScheme="red" size="md">
                            Wrong Network
                          </Button>
                        );
                      }

                      return (
                        <HStack spacing={2}>
                          <Button
                            onClick={openChainModal}
                            variant="outline"
                            size="sm"
                            leftIcon={
                              chain.hasIcon ? (
                                <Box
                                  w={4}
                                  h={4}
                                  borderRadius="full"
                                  overflow="hidden"
                                  bg={chain.iconBackground}
                                >
                                  {chain.iconUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      alt={chain.name ?? "Chain icon"}
                                      src={chain.iconUrl}
                                      style={{ width: "100%", height: "100%" }}
                                    />
                                  )}
                                </Box>
                              ) : undefined
                            }
                          >
                            {chain.name}
                          </Button>
                          <Button onClick={openAccountModal} variant="outline" size="sm">
                            {rkAccount.displayName}
                          </Button>
                        </HStack>
                      );
                    })()}
                  </Box>
                );
              }}
            </ConnectButton.Custom>
          </HStack>
        </Flex>

        {/* Main Content */}
        <Flex direction={{ base: "column", lg: "row" }} gap={12}>
          {/* Left Column */}
          <VStack align="flex-start" spacing={8} flex={1}>
            <Box>
              <Badge colorScheme="brand" mb={4} px={3} py={1} borderRadius="full">
                Privacy-First Health Analysis
              </Badge>
              <Heading size="3xl" lineHeight="1.2" mb={6}>
                Secure Health <br />
                <Text as="span" color="brand.400">
                  Risk Assessment
                </Text>
              </Heading>
              <Text fontSize="xl" color="whiteAlpha.700" maxW="lg">
                Your health data is encrypted locally and computed on-chain using FHE. 
                Only you can see the results.
              </Text>
            </Box>

            <RiskForm
              values={inputs}
              onChange={setInputs}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isDisabled={!account.address}
            />
          </VStack>

          {/* Right Column */}
          <VStack flex={0.8} spacing={6} pt={{ base: 0, lg: 8 }}>
            <Box w="full" bg="bg.card" p={8} borderRadius="3xl" border="1px solid" borderColor="whiteAlpha.100" position="relative">
              <Text fontSize="lg" fontWeight="bold" mb={6}>Processing Status</Text>
              <ProcessSteps steps={steps} />
            </Box>

            {(score !== null || isSubmitting) && (
              <Box w="full">
                 <ResultCard score={score} level={riskLevel} />
              </Box>
            )}
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}

