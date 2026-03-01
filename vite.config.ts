import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  clearScreen: false,
  build: {
    target: "esnext",
  },
  worker: {
    format: "es",
  },
  plugins: [vue()],
});
