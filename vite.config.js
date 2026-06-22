import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import uni from "@dcloudio/vite-plugin-uni";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080", // 改成 http，避免 SSL 错误
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
