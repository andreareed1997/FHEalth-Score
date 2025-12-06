"use client";

import {
  Box,
  HStack,
  Link,
  Text,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { EXPLORER_BASE } from "@/config/constants";

type Props = {
  fheStatus: "checking" | "ready" | "error";
  contractAddress: `0x${string}`;
  walletAddress?: `0x${string}`;
};

export function StatusBar({ fheStatus, contractAddress }: Props) {
  const status = {
    checking: { label: "Checking FHEVM", color: "yellow" },
    ready: { label: "System Ready", color: "green" },
    error: { label: "System Error", color: "red" },
  }[fheStatus];

  return (
    <HStack 
      bg="bg.surface" 
      px={4} 
      py={2} 
      borderRadius="full" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      spacing={4}
    >
      <HStack spacing={2}>
        <Box w={2} h={2} borderRadius="full" bg={`${status.color}.400`} />
        <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.800">
          {status.label}
        </Text>
      </HStack>

      <Box w="1px" h="16px" bg="whiteAlpha.200" />

      <Link
        href={`${EXPLORER_BASE}${contractAddress}`}
        isExternal
        display="flex"
        alignItems="center"
        _hover={{ textDecoration: "none", color: "brand.400" }}
      >
        <Text fontSize="sm" color="whiteAlpha.600" mr={1}>Contract</Text>
        <ExternalLinkIcon w={3} h={3} color="whiteAlpha.400" />
      </Link>
    </HStack>
  );
}

