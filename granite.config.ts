import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "roundapp",
  brand: {
    displayName: "Round",
    primaryColor: "#22d3ee",
    icon: "https://round-app-one.vercel.app/icon-192.png",
  },
  web: {
    // 실기기 테스트 시 host를 로컬 IP로 변경 (예: "192.168.0.10")
    host: "localhost",
    port: 3000,
    commands: {
      dev: "next dev",
      build: "node build-toss.mjs",
    },
  },
  webViewProps: {
    type: "partner",
    bounces: false,
    pullToRefreshEnabled: false,
    overScrollMode: "never",
    allowsBackForwardNavigationGestures: false,
  },
  outdir: "dist",
  permissions: [],
});
