import { extendTheme } from "@chakra-ui/react";

export const theme = extendTheme({
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  colors: {
    brand: {
      50: "#F0F7FF",
      100: "#E0EFFF",
      200: "#B8DAFF",
      300: "#8AC2FF",
      400: "#5BA8FF",
      500: "#2B8CFF", // Primary Blue
      600: "#0066CC",
      700: "#004D99",
      800: "#003366",
      900: "#001A33",
    },
    accent: {
      500: "#00D4FF", // Cyan accent
    },
    bg: {
      light: "#FFFFFF",
      dark: "#0F1115",
      card: "#161920",
      surface: "#1C2029",
    },
  },
  styles: {
    global: {
      body: {
        bg: "bg.dark",
        color: "white",
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "600",
        borderRadius: "full",
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.400",
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(43, 140, 255, 0.3)",
          },
          _active: {
            bg: "brand.600",
          },
        },
        outline: {
          border: "2px solid",
          borderColor: "whiteAlpha.300",
          color: "white",
          _hover: {
            bg: "whiteAlpha.100",
            borderColor: "white",
          },
        },
        ghost: {
          color: "whiteAlpha.700",
          _hover: {
            bg: "whiteAlpha.100",
            color: "white",
          },
        },
      },
    },
    Select: {
      variants: {
        filled: {
          field: {
            bg: "bg.surface",
            border: "1px solid",
            borderColor: "whiteAlpha.100",
            borderRadius: "xl",
            _hover: {
              borderColor: "brand.400",
              bg: "bg.surface",
            },
            _focus: {
              borderColor: "brand.500",
              bg: "bg.surface",
            },
          },
        },
      },
      defaultProps: {
        variant: "filled",
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "bg.card",
          borderRadius: "3xl",
          border: "1px solid",
          borderColor: "whiteAlpha.100",
          p: 8,
        },
      },
    },
  },
});

