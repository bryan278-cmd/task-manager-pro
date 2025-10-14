import { createContext, useEffect, useMemo, useState } from "react";

export const ThemeContext = createContext({
  theme: "light",
  toggle: () => {},
});

function MyApp({ Component, pageProps }) {
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
    <ThemeContext.Provider value={value}>
      <Component {...pageProps} />
    </ThemeContext.Provider>
  );
}

export default MyApp;
