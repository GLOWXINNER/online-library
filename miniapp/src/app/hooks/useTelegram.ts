import { useMemo } from "react";

export function useTelegram() {
  const webApp = useMemo(() => window.Telegram?.WebApp ?? null, []);
  return {
    webApp,
    isTelegram: !!webApp,
    theme: webApp?.themeParams ?? null,
    colorScheme: webApp?.colorScheme ?? null,
  };
}
