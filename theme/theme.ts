import { createTheme, MantineColorsTuple } from "@mantine/core";

// Define our brand colors
const brandBlue = "#3498db";
const brandTeal = "#39c0ba";

// Create a custom teal color tuple
const teal: MantineColorsTuple = [
  "#e6fcfa",
  "#ccf9f6",
  "#99f3ed",
  "#66ede4",
  "#33e7db",
  "#1ae3d5",
  "#00dfcf",
  "#00b2a6",
  "#00867d",
  "#005953",
];

export const theme = createTheme({
  primaryColor: "teal",
  colors: {
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
          '&[data-variant="gradient"]': {
            background: "linear-gradient(45deg, #3498db, #39c0ba)",
            color: "white",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.2)",
            },
          },
          '&[data-variant="outline-brand"]': {
            border: `1px solid ${brandTeal}`,
            color: brandTeal,
            fontWeight: 600,
            transition:
              "transform 0.2s, box-shadow 0.2s, background-color 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 18px rgba(0, 0, 0, 0.1)",
              backgroundColor: "rgba(57, 192, 186, 0.1)",
              borderColor: brandTeal,
            },
          },
        },
      },
    },
    Text: {
      styles: {
        root: {
          '&[data-variant="gradient"]': {
            background: "linear-gradient(45deg, #3498db, #39c0ba)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            transition: "transform 0.2s",
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
        },
      },
    },
    Anchor: {
      defaultProps: {
        color: brandBlue,
      },
      styles: {
        root: {
          background: "linear-gradient(45deg, #3498db, #39c0ba)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          transition: "transform 0.2s",
          "&:hover": {
            textDecoration: "none",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    NavLink: {
      defaultProps: {
        color: brandTeal,
      },
      styles: {
        root: {
          "&[data-active]": {
            background: "linear-gradient(45deg, #3498db, #39c0ba)",
            color: "white",
          },
          "&:hover": {
            background: "linear-gradient(45deg, #3498db, #39c0ba)",
            color: "white",
          },
          transition: "all 0.2s",
        },
        label: {
          fontWeight: 500,
        },
      },
    },
    ThemeIcon: {
      defaultProps: {
        variant: "light",
        color: "teal",
      },
    },
  },
});
