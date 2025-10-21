import { createContext, useEffect, useMemo, useState } from "react";
import { SessionProvider } from "next-auth/react";

export const ThemeContext = createContext({
  theme: "light",
  toggle: () => {},
});

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const [theme, setTheme] = useState("light");

  // Carga inicial: localStorage → `prefers-color-scheme`
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) {
        setTheme(saved);
      } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
      }
    } catch {}
  }, []);

  // Persistencia + atributo en <html>
  useEffect(() => {
    try {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const value = useMemo(
    () => ({ theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }),
    [theme]
  );

  return (
    <SessionProvider session={session}>
      <ThemeContext.Provider value={value}>
        <Component {...pageProps} />
      </ThemeContext.Provider>
    </SessionProvider>
  );
}
