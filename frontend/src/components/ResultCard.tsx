"use client";

import {
  Box,
  Heading,
  HStack,
  Tag,
  VStack,
  Text,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import type { RiskLevel } from "@/lib/risk";

type Props = {
  score: number | null;
  level: RiskLevel | null;
};

export function ResultCard({ score, level }: Props) {
  if (score === null || level === null) return null;

  // Max possible score is 17 (3+3+3+2+3+2+high activity penalty), show as percentage
  const percentage = Math.min(100, Math.max(0, (score / 17) * 100));

  return (
    <Box
      bg="bg.card"
      borderRadius="3xl"
      p={8}
      border="1px solid"
      borderColor={level.color}
      boxShadow={`0 0 40px ${level.color}20`}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="4px"
        bg={level.color}
      />
      
      <VStack spacing={6} align="start">
        <HStack justify="space-between" w="full">
          <Heading size="md" color="whiteAlpha.900">
            Assessment Result
          </Heading>
          <Tag 
            size="lg" 
            bg={`${level.color.split('.')[0]}.500`} 
            color="white" 
            px={4} 
            py={2} 
            borderRadius="full"
          >
            {level.label} Risk
          </Tag>
        </HStack>

        <HStack spacing={8} align="center" w="full">
          <CircularProgress 
            value={percentage} 
            size="120px" 
            thickness="8px" 
            color={level.color}
            trackColor="whiteAlpha.100"
          >
            <CircularProgressLabel fontSize="3xl" fontWeight="bold" color="white">
              {score}
            </CircularProgressLabel>
          </CircularProgress>

          <VStack align="start" flex={1} spacing={1}>
            <Text fontSize="sm" color="whiteAlpha.600" fontWeight="medium" letterSpacing="wide" textTransform="uppercase">
              Health Score
            </Text>
            <Text fontSize="lg" lineHeight="short">
              Based on your encrypted inputs, your calculated risk score is <b>{score}</b>.
            </Text>
            <Text fontSize="xs" color="whiteAlpha.500" mt={2}>
              🔒 Decrypted locally using your private key
            </Text>
          </VStack>
        </HStack>
      </VStack>
    </Box>
  );
}

