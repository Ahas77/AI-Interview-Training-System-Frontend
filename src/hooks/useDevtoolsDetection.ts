import { useEffect, useRef } from "react";
import { defaultConfig } from "../app/configs/common";

function getAuthToken(): string | null {
  const keys = ["authToken", "token", "access_token", "sanctum_token", "user_token"];
  for (const key of keys) {
    const ls = localStorage.getItem(key);
    if (ls && ls !== "null" && ls !== "undefined") return ls;
    const ss = sessionStorage.getItem(key);
    if (ss && ss !== "null" && ss !== "undefined") return ss;
  }
  return null;
}

const lastLoggedTimes: Record<string, number> = {};

async function sendInspectLog(reason: string): Promise<void> {
  const now = Date.now();
  if (lastLoggedTimes[reason] && now - lastLoggedTimes[reason] < 10000) {
    return;
  }
  lastLoggedTimes[reason] = now;

  const token = getAuthToken();
  const rawApiBase = String(defaultConfig.BASE_API_URL || "").replace(/\/+$/, "");
  if (!rawApiBase) return;

  const candidates: Array<{ url: string; headers: Record<string, string> }> = [];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  candidates.push({ url: `${rawApiBase}/log-devtools`, headers });
  candidates.push({ url: `${rawApiBase}/devtools/log`, headers });

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate.url, {
        method: "POST",
        headers: candidate.headers,
        body: JSON.stringify({ reason }),
        keepalive: true,
      });

      if (res.ok || res.status === 201 || res.status === 204) {
        break;
      }
    } catch (_err) {
      // Ignore network errors silently
    }
  }
}

export function useDevtoolsDetection(): void {
  const isDetectedRef = useRef(false);

  useEffect(() => {
    if (!defaultConfig.ENABLE_INSPECT_BLOCK) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const isF12 = e.key === "F12" || e.keyCode === 123;
      const isCtrlShiftI = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.keyCode === 73);
      const isCtrlShiftJ = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "J" || e.key === "j" || e.keyCode === 74);
      const isCtrlShiftC = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.key === "c" || e.keyCode === 67);
      const isCtrlU = (e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u" || e.keyCode === 85);

      let reason = "";
      if (isF12) reason = "Keyboard Shortcut: F12";
      else if (isCtrlShiftI) reason = "Keyboard Shortcut: Ctrl+Shift+I (Inspect)";
      else if (isCtrlShiftJ) reason = "Keyboard Shortcut: Ctrl+Shift+J (Console)";
      else if (isCtrlShiftC) reason = "Keyboard Shortcut: Ctrl+Shift+C (Element Inspector)";
      else if (isCtrlU) reason = "Keyboard Shortcut: Ctrl+U (View Source)";

      if (reason) {
        e.preventDefault();
        sendInspectLog(reason);
      }
    };

    const handleContextMenu = (_e: MouseEvent) => {
      sendInspectLog("Right-click context menu opened");
    };

    const checkDevToolsDimensions = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;

      if (widthDiff || heightDiff) {
        if (!isDetectedRef.current) {
          isDetectedRef.current = true;
          sendInspectLog("DevTools Docked Window Detected");
        }
      } else {
        isDetectedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("contextmenu", handleContextMenu, true);
    window.addEventListener("resize", checkDevToolsDimensions);

    const intervalId = setInterval(checkDevToolsDimensions, 2000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      window.removeEventListener("resize", checkDevToolsDimensions);
      clearInterval(intervalId);
    };
  }, []);
}