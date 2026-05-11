import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: false, // Menghindari injeksi script tag ke DOM yang memicu warning React 19
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // dihapus agar tidak menggunakan turbopack secara paksa yang bisa mematikan webpack plugin (next-pwa)
};

export default withPWA(nextConfig);
