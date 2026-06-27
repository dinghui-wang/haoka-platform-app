import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import uni from "@dcloudio/vite-plugin-uni";
// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [uni()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/app": {
        target: "http://localhost:19999", // 改成 http，避免 SSL 错误
        changeOrigin: true,
        secure: false,
      },
    },
    host: "0.0.0.0",
    port: 8888,
  },
});
