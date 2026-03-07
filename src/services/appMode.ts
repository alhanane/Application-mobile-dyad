export const USE_PHP_API = (import.meta.env.VITE_USE_PHP_API ?? (import.meta.env.PROD ? "1" : "0")) === "1";
