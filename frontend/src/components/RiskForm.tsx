"use client";

import {
  Box,
  Button,
  HStack,
  Select,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import type { AssessmentInput } from "@/lib/fhevm";

type Props = {
  values: AssessmentInput;
  onChange: (values: AssessmentInput) => void;
  onSubmit: () => Promise<void>;
  onReset: () => void;
  isSubmitting: boolean;
  isDisabled?: boolean;
};

const AGE_OPTIONS = [
  { label: "18 - 30", value: 24 },
  { label: "31 - 45", value: 38 },
  { label: "46 - 60", value: 53 },
  { label: "61 - 75", value: 68 },
  { label: "76+", value: 80 },
];

const BMI_OPTIONS = [
  { label: "< 18.5 (Underweight)", value: 17 },
  { label: "18.5 - 24.9 (Normal)", value: 22 },
  { label: "25 - 29.9 (Overweight)", value: 27 },
  { label: "30+ (Obese)", value: 33 },
];

const SYSTOLIC_OPTIONS = [
  { label: "< 120 (Normal)", value: 110 },
  { label: "120 - 139 (Elevated)", value: 130 },
  { label: "140 - 159 (High Stage 1)", value: 150 },
  { label: "160+ (High Stage 2)", value: 170 },
];

const GLUCOSE_OPTIONS = [
  { label: "< 100 (Normal)", value: 90 },
  { label: "100 - 125 (Prediabetes)", value: 112 },
  { label: "126+ (Diabetes)", value: 140 },
];

const ACTIVITY_OPTIONS = [
  { label: "0 days", value: 0 },
  { label: "1 - 2 days", value: 2 },
  { label: "3 - 4 days", value: 4 },
  { label: "5 - 7 days", value: 6 },
];

const SMOKING_OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Former", value: 1 },
  { label: "Current", value: 2 },
];

export function RiskForm({ values, onChange, onSubmit, onReset, isSubmitting, isDisabled }: Props) {
  const update = (key: keyof AssessmentInput, value: number) => {
    onChange({ ...values, [key]: value });
  };

  const allSelected = 
    values.age !== -1 && 
    values.bmi !== -1 && 
    values.systolic !== -1 && 
    values.glucose !== -1 && 
    values.activity !== -1 && 
    values.smoking !== -1;

  return (
    <Box 
      bg="bg.card" 
      p={8} 
      borderRadius="3xl" 
      border="1px solid" 
      borderColor="whiteAlpha.100"
      boxShadow="xl"
    >
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
        <RangeSelect
          label="Age Group"
          placeholder="Select age"
          options={AGE_OPTIONS}
          value={values.age}
          onChange={(val) => update("age", val)}
        />
        <RangeSelect
          label="BMI Category"
          placeholder="Select BMI"
          options={BMI_OPTIONS}
          value={values.bmi}
          onChange={(val) => update("bmi", val)}
        />
        <RangeSelect
          label="Blood Pressure"
          placeholder="Select BP"
          options={SYSTOLIC_OPTIONS}
          value={values.systolic}
          onChange={(val) => update("systolic", val)}
        />
        <RangeSelect
          label="Glucose Level"
          placeholder="Select glucose"
          options={GLUCOSE_OPTIONS}
          value={values.glucose}
          onChange={(val) => update("glucose", val)}
        />
        <RangeSelect
          label="Weekly Activity"
          placeholder="Select activity"
          options={ACTIVITY_OPTIONS}
          value={values.activity}
          onChange={(val) => update("activity", val)}
        />
        <RangeSelect
          label="Smoking History"
          placeholder="Select smoking"
          options={SMOKING_OPTIONS}
          value={values.smoking}
          onChange={(val) => update("smoking", val)}
        />
      </SimpleGrid>

      <HStack spacing={4}>
        <Button
          flex={1}
          size="lg"
          h={14}
          fontSize="lg"
          onClick={onSubmit}
          isLoading={isSubmitting}
          isDisabled={isDisabled || !allSelected}
          loadingText="Processing..."
          variant="solid"
          _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
        >
          {isDisabled ? "Connect Wallet" : !allSelected ? "Select All Fields" : "Submit Assessment"}
        </Button>
        <Button
          size="lg"
          h={14}
          variant="outline"
          onClick={onReset}
          isDisabled={isSubmitting}
        >
          <RepeatIcon />
        </Button>
      </HStack>
    </Box>
  );
}

function RangeSelect({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  options: { label: string; value: number }[];
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <VStack align="start" spacing={2}>
      <Text fontSize="sm" fontWeight="medium" color="whiteAlpha.700">
        {label}
      </Text>
      <Select
        value={value === -1 ? "" : value}
        onChange={(e) => onChange(Number(e.target.value))}
        height={12}
        iconColor="brand.500"
        variant="filled"
        placeholder={placeholder}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "#1C2029" }}>
            {opt.label}
          </option>
        ))}
      </Select>
    </VStack>
  );
}

