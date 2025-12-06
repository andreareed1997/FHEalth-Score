"use client";

import { CheckCircleIcon } from "@chakra-ui/icons";
import { Box, HStack, Spinner, Text, VStack, Circle } from "@chakra-ui/react";

export type StepState = "idle" | "running" | "done" | "error";

type Props = {
  steps: { label: string; state: StepState }[];
};

export function ProcessSteps({ steps }: Props) {
  return (
    <VStack align="stretch" spacing={0} position="relative">
      {steps.map((step, index) => (
        <Box key={step.label} position="relative" pb={index === steps.length - 1 ? 0 : 8}>
          {/* Connecting Line */}
          {index !== steps.length - 1 && (
            <Box
              position="absolute"
              left="15px"
              top="32px"
              bottom="-4px"
              width="2px"
              bg={step.state === "done" ? "brand.500" : "whiteAlpha.100"}
              transition="background 0.3s"
            />
          )}
          
          <HStack spacing={4}>
            <StatusIcon state={step.state} stepNumber={index + 1} />
            <Text 
              fontWeight={step.state === "running" ? "bold" : "medium"}
              color={step.state === "idle" ? "whiteAlpha.500" : "white"}
              fontSize="lg"
            >
              {step.label}
            </Text>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
}

function StatusIcon({ state, stepNumber }: { state: StepState; stepNumber: number }) {
  if (state === "running") {
    return (
      <Circle size="32px" bg="brand.500" color="white">
        <Spinner size="xs" />
      </Circle>
    );
  }

  if (state === "done") {
    return (
      <Circle size="32px" bg="green.400" color="white">
        <CheckCircleIcon w={4} h={4} />
      </Circle>
    );
  }

  if (state === "error") {
    return (
      <Circle size="32px" bg="red.400" color="white">
        <Text fontSize="sm" fontWeight="bold">!</Text>
      </Circle>
    );
  }

  return (
    <Circle 
      size="32px" 
      border="2px solid" 
      borderColor="whiteAlpha.200" 
      color="whiteAlpha.400"
      fontSize="sm"
      fontWeight="bold"
    >
      {stepNumber}
    </Circle>
  );
}

