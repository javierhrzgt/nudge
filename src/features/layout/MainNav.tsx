import type { NavItemsParams } from "./navItems";
import { NavLink } from "@mantine/core";
import { NavLink as RouterNavLink } from "react-router";

type Placement = "header" | "footer";

interface MainNavProps {
  items: NavItemsParams[];
  placement?: Placement;
}

export default function MainNav({ items, placement }: Readonly<MainNavProps>) {
  const isFooter = placement === "footer";
  return items.map((item) => (
    <NavLink
      flex={isFooter ? 1 : undefined}
      w="auto"
      py={isFooter ? undefined : 6}
      px={isFooter ? undefined : "md"}
      variant={isFooter ? "filled" : "light"}
      style={
        isFooter
          ? { borderRadius: "var(--mantine-radius-xl)" }
          : { borderRadius: "var(--mantine-radius-lg)" }
      }
      styles={isFooter ? { body: { textAlign: "center" } } : undefined}
      key={item.label}
      label={item.label}
      renderRoot={({ className, ...others }) => (
        <RouterNavLink to={item.to} className={className} {...others} />
      )}
    />
  ));
}
