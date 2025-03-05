import { createTheme, MantineColorsTuple } from "@mantine/core";

// Light, modern color palette
const lightBlue = "#66abdb"; // Light blue from our gradient
const lightTeal = "#66c0bd"; // Light teal from our gradient

const teal: MantineColorsTuple = [
  "#f0fdfa",
  "#ccfbf1",
  "#99f6e4",
  "#66c0bd", // Our light teal
  "#2dd4bf",
  "#14b8a6",
  "#0d9488",
  "#0f766e",
  "#115e59",
  "#134e4a",
];

const blue: MantineColorsTuple = [
  "#f0f9ff",
  "#e0f2fe",
  "#bae6fd",
  "#66abdb", // Our light blue
  "#38bdf8",
  "#0ea5e9",
  "#0284c7",
  "#0369a1",
  "#075985",
  "#0c4a6e",
];

export const theme = createTheme({
  primaryColor: "blue",
  colors: {
    blue,
    teal,
  },
  defaultRadius: "md",

  components: {
    Button: {
      defaultProps: {
        size: "md",
        radius: "md",
      },
      styles: {
        root: {
          '&[data-variant="filled"]': {
            background: lightBlue,
            color: "white",
            fontWeight: 500,
            boxShadow: "0 2px 10px rgba(102, 171, 219, 0.3)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "#5499c9",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 20px rgba(102, 171, 219, 0.4)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          '&[data-variant="light"]': {
            background: "#f0f9ff",
            color: lightBlue,
            fontWeight: 500,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "#e0f2fe",
            },
          },
          '&[data-variant="gradient"]': {
            background: `linear-gradient(135deg, ${lightBlue} 0%, ${lightTeal} 100%)`,
            color: "white",
            fontWeight: 500,
            boxShadow: "0 2px 10px rgba(102, 171, 219, 0.2)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 4px 20px rgba(102, 171, 219, 0.3)",
              filter: "brightness(105%)",
            },
          },
          '&[data-variant="outline"]': {
            border: `2px solid ${lightBlue}`,
            color: lightBlue,
            fontWeight: 500,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "#f0f9ff",
            },
          },
        },
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        p: "xl",
      },
      styles: {
        root: {
          backgroundColor: "white",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 30px rgba(102, 171, 219, 0.1)",
          },
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: "md",
          fontWeight: 500,
          color: lightBlue,
          "&[data-active]": {
            background: "#f0f9ff",
            color: lightBlue,
            "&:hover": {
              background: "#e0f2fe",
            },
          },
          "&:hover": {
            background: "#f0f9ff",
          },
          transition: "all 0.2s ease",
        },
      },
    },
    Text: {
      styles: {
        root: {
          '&[data-variant="gradient"]': {
            background: `linear-gradient(135deg, ${lightBlue} 0%, ${lightTeal} 100%)`,
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          },
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: "lg",
        p: "xl",
        withBorder: true,
      },
      styles: {
        root: {
          border: "1px solid #e0f2fe",
          backgroundColor: "white",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 30px rgba(102, 171, 219, 0.1)",
          },
        },
      },
    },
    Input: {
      defaultProps: {
        radius: "xl",
      },
      styles: {
        input: {
          border: "2px solid #e0f2fe",
          transition: "all 0.2s ease",
          "&:focus": {
            borderColor: lightBlue,
            boxShadow: "0 0 0 3px #e0f2fe",
          },
        },
      },
    },
    Select: {
      defaultProps: {
        radius: "xl",
      },
      styles: {
        input: {
          border: "2px solid #e0f2fe",
          transition: "all 0.2s ease",
          "&:focus": {
            borderColor: lightBlue,
            boxShadow: "0 0 0 3px #e0f2fe",
          },
        },
      },
    },
    Anchor: {
      styles: {
        root: {
          color: lightBlue,
          fontWeight: 500,
          transition: "all 0.2s ease",
          "&:hover": {
            color: "#5499c9",
            textDecoration: "none",
          },
        },
      },
    },
  },
});
