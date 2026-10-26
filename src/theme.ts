// src/theme.ts
import {
  createTheme,
  TextInput,
  PasswordInput,
  NumberInput,
  Button,
} from "@mantine/core";

export const theme = createTheme({
  defaultRadius: "md",
  components: {
    TextInput: TextInput.extend({ defaultProps: { size: "md" } }),
    PasswordInput: PasswordInput.extend({ defaultProps: { size: "md" } }),
    NumberInput: NumberInput.extend({ defaultProps: { size: "md" } }),
    Button: Button.extend({ defaultProps: { size: "md" } }),
  },
});
