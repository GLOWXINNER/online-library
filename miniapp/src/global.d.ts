export {};

type TgThemeParams = Record<string, string | undefined>;

type TgBackButton = {
  show(): void;
  hide(): void;
  onClick(cb: () => void): void;
  offClick(cb: () => void): void;
};

type TgWebApp = {
  ready(): void;
  expand(): void;
  BackButton: TgBackButton;
  colorScheme?: "light" | "dark";
  themeParams?: TgThemeParams;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp: TgWebApp;
    };
  }
}
