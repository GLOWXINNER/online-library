import { useMemo } from "react";

export function useTelegram() {
  const webApp = useMemo(() => window.Telegram?.WebApp ?? null, []);
  const isTelegram = !!webApp;
  const theme = webApp?.themeParams ?? null;
  const colorScheme = webApp?.colorScheme ?? null;

  return { webApp, isTelegram, theme, colorScheme };
}
