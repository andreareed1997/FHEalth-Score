"use client";

import {
  Box,
  Heading,
  HStack,
  Tag,
  VStack,
  Text,
  Icon,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon, InfoIcon } from "@chakra-ui/icons";
import type { RiskLevel } from "@/lib/risk";

type Props = {
  score: number | null;
  level: RiskLevel | null;
};

const LEVEL_ICONS = {
  Low: CheckCircleIcon,
  Guarded: InfoIcon,
  Medium: InfoIcon,
  High: WarningIcon,
  Critical: WarningIcon,
};

export function ResultCard({ score, level }: Props) {
  if (score === null || level === null) return null;

  const IconComponent = LEVEL_ICONS[level.label];

  return (
    <Box
      bg="bg.card"
      borderRadius="3xl"
      p={8}
      border="2px solid"
      borderColor={level.color}
      boxShadow={`0 0 60px ${level.color}30`}
      position="relative"
      overflow="hidden"
    >
      {/* Top gradient bar */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="6px"
        bgGradient={level.bgGradient}
      />
      
      <VStack spacing={5} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Heading size="md" color="whiteAlpha.900">
            Assessment Result
          </Heading>
          <Tag 
            size="lg" 
            bgGradient={level.bgGradient}
            color="white" 
            px={4} 
            py={2} 
            borderRadius="full"
            fontWeight="bold"
          >
            <Icon as={IconComponent} mr={2} />
            {level.label} Risk
          </Tag>
        </HStack>

        {/* Score Display */}
        <HStack 
          spacing={4} 
          p={4} 
          bg="whiteAlpha.50" 
          borderRadius="xl"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Box
            w={16}
            h={16}
            borderRadius="full"
            bgGradient={level.bgGradient}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="2xl" fontWeight="bold" color="white">
              {score}
            </Text>
          </Box>
          <VStack align="start" spacing={0} flex={1}>
            <Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium" textTransform="uppercase">
              Risk Level
            </Text>
            <Text fontSize="xl" fontWeight="bold" color={level.color}>
              {level.label}
            </Text>
          </VStack>
        </HStack>

        {/* Health Advice */}
        <Box 
          p={4} 
          bg="whiteAlpha.50" 
          borderRadius="xl"
          borderLeft="4px solid"
          borderLeftColor={level.color}
        >
          <Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium" mb={2} textTransform="uppercase">
            Health Recommendation
          </Text>
          <Text fontSize="md" color="whiteAlpha.900" lineHeight="tall">
            {level.advice}
          </Text>
        </Box>

        {/* Footer */}
        <Text fontSize="xs" color="whiteAlpha.500" textAlign="center">
          🔒 Result decrypted locally using your private key
        </Text>
      </VStack>
    </Box>
  );
}

