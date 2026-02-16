import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTelegram } from "./useTelegram";

export function useTelegramBackButton() {
  const { webApp } = useTelegram();
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    if (!webApp) return;

    const show = !["/books", "/login", "/register"].includes(loc.pathname);
    const handler = () => nav(-1);

    if (show) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(handler);
    } else {
      webApp.BackButton.hide();
    }

    return () => {
      webApp.BackButton.offClick(handler);
    };
  }, [webApp, loc.pathname, nav]);
}
