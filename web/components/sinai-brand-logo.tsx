"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { useTheme } from "fumadocs-ui/provider/base";

export function SinaiBrandLogo() {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Image
      src={isDark ? "/images/brand/sinai-white.png" : "/images/brand/sinai.png"}
      alt="SINAI · Base de conocimiento"
      width={850}
      height={394}
      priority
      className="sinai-sidebar-logo"
    />
  );
}
