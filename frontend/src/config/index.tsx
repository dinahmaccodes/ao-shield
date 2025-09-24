export const config = {
  // AO Network Configuration
  aoProcessId: import.meta.env.VITE_APUS_AO_PROCESS_ID || "3U6DE9lLfIzroUTwzgLd7Ukoc4NUGe5ozOz8cg15vvQ", // TODO: Replace with your AO process ID

  // APUS HyperBEAM Node Configuration
  apusHyperbeamNodeUrl: import.meta.env.VITE_APUS_HYPERBEAM_URL || "http://72.46.85.207:8734",

  // App Configuration
  appName: "Yao",
  appLogo: "https://arweave.net/tQUcL4wlNj_NED2VjUGUhfCTJ6pDN9P0e3CbnHo3vUE",

  // Attestation Configuration
  defaultAttestedBy: ["NVIDIA", "AMD"],

  // UI Configuration
  theme: {
    accent: { r: 9, g: 29, b: 255 },
  },

  // Wallet Configuration
  walletPermissions: [
    "ACCESS_ADDRESS",
    "SIGN_TRANSACTION",
    "DISPATCH",
  ] as const,
  ensurePermissions: true,
} as const;