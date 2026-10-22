import { useLayoutEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

function savedTheme(): Theme {
  try {
    return localStorage.getItem("echopath:theme") === "light"
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(savedTheme);
  const label = `Switch to ${theme === "dark" ? "light" : "dark"} theme`;

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "light" ? "#f8f7fd" : "#050308");
    try {
      localStorage.setItem("echopath:theme", theme);
    } catch {
      // The switch still works when browser storage is unavailable.
    }
  }, [theme]);

  return (
    <button
      type="button"
      className="topbar__theme"
      aria-label={label}
      title={label}
      onClick={() =>
        setTheme((current) => (current === "dark" ? "light" : "dark"))
      }
    >
      {theme === "dark" ? (
        <Sun size={19} aria-hidden="true" />
      ) : (
        <Moon size={19} aria-hidden="true" />
      )}
    </button>
  );
}
