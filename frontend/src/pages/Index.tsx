import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Shield as ShieldIcon,
  MessageSquare,
  FolderKanban,
  RefreshCw,
  Search,
  CheckCircle2,
  Twitter,
  Github,
  MessageCircle,
} from "lucide-react";

// --- Types ---
interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FEATURES: FeatureItem[] = [
  {
    id: "realtime",
    title: "Real-Time Protection",
    description:
      "Every transaction is scanned for scams, phishing patterns, and malicious approvals before they hit the chain.",
    icon: <Search className="feature-icon" aria-hidden />,
  },
  {
    id: "xai",
    title: "Explainable AI",
    description:
      "No black boxes. Get clear, human-readable reasons any warning is flagged so actions are safer.",
    icon: <MessageSquare className="feature-icon" aria-hidden />,
  },
  {
    id: "scammem",
    title: "Scam Memory",
    description:
      "Fraud data is stored on Arweave, creating a tamper-proof intelligence network that every user benefits from.",
    icon: <FolderKanban className="feature-icon" aria-hidden />,
  },
  {
    id: "uitl",
    title: "User-in-the-Loop",
    description:
      "You approve or reject transactions, while feedback strengthens the system for everyone.",
    icon: <CheckCircle2 className="feature-icon" aria-hidden />,
  },
  {
    id: "seamless",
    title: "Seamless Integration",
    description:
      "Works behind the scenes with wallets and dapps to block threats without slowing you down.",
    icon: <RefreshCw className="feature-icon" aria-hidden />,
  },
];

const TopNav: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src="/aoshieldname.svg" alt="aoshield-logo" />
        </div>

        <div className="flex items-center gap-8">
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="nav-link focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
            >
              Features
            </a>
            <a
              href="#how"
              className="nav-link focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
            >
              How it works
            </a>
            <a
              href="#security"
              className="nav-link focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
            >
              Benefits
            </a>
          </nav>
          <GetExtensionButton />
        </div>
      </div>
    </header>
  );
};

const GetExtensionButton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <button
      className={`get-extension-btn ${className ?? ""}`}
      aria-label="Get Extension"
    >
      Get Extension
    </button>
  );
};

const Hero: React.FC = () => {
  return (
    <section
      id="top"
      className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-20 text-center text-white"
    >
      {/* Subtle vignette corners */}
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/5 glow-frame-bg" />{" "}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-4xl"
      >
        <h1 className="hero-title mb-6 text-white">
          <span className="block">AI-Powered</span>
          <span className="block bg-gradient-to-b from-white to-white/80 bg-clip-text text-transparent">
            Blockchain Security
          </span>
        </h1>
        <p className="hero-subtitle mx-auto max-w-3xl text-balance text-white/70">
          Protect your transactions with permanent threats intelligence and
          real-time fraud detection
        </p>

        <div className="mt-8 flex items-center justify-center">
          <GetExtensionButton />
        </div>
      </motion.div>
      {/* Dust / stars */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(1000px_600px_at_50%_0%,rgba(0,229,255,0.08),transparent_60%),radial-gradient(500px_400px_at_10%_30%,rgba(255,255,255,0.06),transparent_60%),radial-gradient(500px_400px_at_90%_40%,rgba(255,255,255,0.06),transparent_60%)]" />
    </section>
  );
};

const LightBulbDivider: React.FC = () => {
  // This component becomes the hover source that brightens the next section
  return (
    <div className="group relative flex items-center justify-center py-8">
      {/* Main light orb - more oval shaped */}
      <div
        className="light-orb-main h-4 w-20 rounded-full bg-white/90 opacity-95 shadow-[0_0_40px_12px_rgba(255,255,255,0.4)] transition-all duration-500 ease-in-out hover:shadow-[0_0_100px_30px_rgba(255,255,255,0.6)] hover:h-5 hover:w-24"
        aria-hidden
      />

      {/* Inner bright core */}
      <div
        className="pointer-events-none absolute h-2 w-12 rounded-full bg-white opacity-100 transition-all duration-500 ease-in-out group-hover:h-3 group-hover:w-16"
        aria-hidden
      />

      {/* Downward light field - more realistic dimming */}
      <div
        className="light-field-down pointer-events-none absolute top-4 h-32 w-[40rem] -translate-y-2 rounded-full opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-80"
        aria-hidden
      />

      {/* Extended subtle glow field */}
      <div
        className="light-glow-extended pointer-events-none absolute top-6 h-48 w-[50rem] -translate-y-4 rounded-full opacity-0 transition-all duration-700 ease-in-out group-hover:opacity-40"
        aria-hidden
      />
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <section
      id="features"
      className="relative z-10 mx-auto max-w-7xl scroll-mt-24 px-4 py-16 text-white sm:py-24"
    >
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="features-title text-white">
          Always standing between you and attackers
        </h2>
        <p className="features-subtitle mt-6 text-white/70">
          Our AI security bot combines fraud detection, threat intelligence, and
          permanent storage to keep you safe across the blockchain.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <article key={f.id} className="feature-card">
            {f.icon}
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-description">{f.description}</p>
          </article>
        ))}
        {/* Empty cell to make 5 cards center on large screens */}
        <div className="hidden lg:block" />
      </div>
    </section>
  );
};

const HowWeProtect: React.FC = () => {
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-20 text-white">
      <h2 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
        How We Protect You
      </h2>

      <div className="relative max-w-6xl mx-auto">
        {/* Central 3D Platform */}
        <div className="flex justify-center items-center relative">
          <div className="platform-3d w-80 h-80 mx-auto relative">
            {/* Platform layers */}
            <div className="absolute inset-4 bg-gradient-to-b from-white/10 to-white/5 rounded-full"></div>
            <div className="absolute inset-8 bg-gradient-to-b from-white/8 to-transparent rounded-full"></div>
            <div className="absolute inset-12 bg-gradient-to-b from-cyan-400/10 to-transparent rounded-full"></div>
          </div>

          {/* Feature boxes positioned around the platform */}
          <div className="absolute inset-0">
            {/* Top left */}
            <div className="absolute top-8 left-8 bg-white/5 border border-white/10 rounded-lg p-4 max-w-xs backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-white mb-2">
                Scan Instantly
              </h3>
              <p className="text-xs text-white/70">
                Real-time scanning of all transactions and smart contracts for
                potential threats
              </p>
            </div>

            {/* Top right */}
            <div className="absolute top-8 right-8 bg-white/5 border border-white/10 rounded-lg p-4 max-w-xs backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-white mb-2">
                Compare with Permanent Records
              </h3>
              <p className="text-xs text-white/70">
                Cross-reference with our extensive database of known threats and
                scams
              </p>
            </div>

            {/* Bottom left */}
            <div className="absolute bottom-8 left-8 bg-white/5 border border-white/10 rounded-lg p-4 max-w-xs backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-white mb-2">
                Protect Your Assets
              </h3>
              <p className="text-xs text-white/70">
                Proactive protection of your digital assets from fraudulent
                activities
              </p>
            </div>

            {/* Bottom right */}
            <div className="absolute bottom-8 right-8 bg-white/5 border border-white/10 rounded-lg p-4 max-w-xs backdrop-blur-sm">
              <h3 className="text-sm font-semibold text-white mb-2">
                Explain in Plain Language
              </h3>
              <p className="text-xs text-white/70">
                Clear, understandable explanations of security decisions and
                threats
              </p>
            </div>

            {/* Connection lines */}
            <svg className="connection-lines-svg absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient
                  id="lineGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              {/* Lines connecting boxes to center */}
              <line
                x1="25%"
                y1="25%"
                x2="50%"
                y2="50%"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1="75%"
                y1="25%"
                x2="50%"
                y2="50%"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1="25%"
                y1="75%"
                x2="50%"
                y2="50%"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              <line
                x1="75%"
                y1="75%"
                x2="50%"
                y2="50%"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

const IntroProduct: React.FC = () => {
  return (
    <section id="security" className="mx-auto max-w-7xl px-4 py-20 text-white">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">
            Introducing AO Shield
          </h2>
          <p className="mt-3 text-sm text-white/70">
            AO Shield is an AI-powered fraud detection and protection system
            built on AO, Arweave's scalable compute layer. It identifies scams,
            flags malicious actors, and secures transactions in real time — with
            a permanent memory of threats stored on the permaweb.
          </p>
          <p className="mt-3 text-sm text-white/70">
            By combining adaptive AI defense with AO's decentralized
            architecture, AO Shield delivers trustless, transparent protection
            that can't be erased or manipulated — starting with Nigeria-first
            use cases and built to scale globally.
          </p>
        </div>
        <div className="mx-auto h-56 w-56 rounded-3xl bg-gradient-to-b from-white/10 to-transparent p-6 ring-1 ring-white/10 md:h-72 md:w-72">
          <div className="flex h-full w-full items-center justify-center rounded-2xl bg-black/60 shadow-[inset_0_0_30px_rgba(255,255,255,0.08),0_10px_60px_rgba(0,229,255,0.2)]">
            <ShieldIcon
              className="h-24 w-24 text-white/80 md:h-28 md:w-28"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer: React.FC = () => {
  const social = [
    {
      id: "tw",
      label: "Twitter",
      icon: <Twitter className="h-5 w-5" />,
      href: "#",
    },
    {
      id: "gh",
      label: "GitHub",
      icon: <Github className="h-5 w-5" />,
      href: "#",
    },
    {
      id: "dc",
      label: "Discord",
      icon: <MessageCircle className="h-5 w-5" />,
      href: "#",
    },
  ];
  return (
    <footer className="border-t border-white/10 bg-black/60 text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
            <span className="text-white/80 font-bold text-sm">a</span>
          </div>
          <div className="text-sm">
            <p className="font-semibold">Shield</p>
            <p className="text-white/60">
              © 2025 AO Shield. All rights reserved.
            </p>
          </div>
        </div>
        <nav className="justify-center gap-6 text-sm text-white/70 sm:flex">
          <a
            href="#features"
            className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
          >
            Features
          </a>
          <a
            href="#how"
            className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
          >
            How it works
          </a>
          <a
            href="#security"
            className="hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 rounded"
          >
            Security
          </a>
        </nav>
        <div className="flex items-center justify-start gap-3 sm:justify-end">
          {social.map((s) => (
            <a
              key={s.id}
              href={s.href}
              aria-label={s.label}
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition-all duration-300 ease-in-out hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
            >
              <span
                className="text-white/80 transition group-hover:text-white"
                aria-hidden
              >
                {s.icon}
              </span>
              {/* Inward glow */}
              <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition duration-300 ease-in-out group-hover:opacity-100 shadow-[inset_0_0_16px_4px_rgba(0,229,255,0.45)]" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

const Page: React.FC = () => {
  return (
    <div className="scroll-smooth bg-[#0a0a0a]">
      <TopNav />
      <Hero />
      {/* Light bulb divider that brightens the following section */}
      <div className="[&+section]:transition [&+section]:duration-300 [&+section]:ease-in-out [&:hover+section]:brightness-110 [&:hover+section]:contrast-110">
        <LightBulbDivider />
      </div>
      <Features />
      <HowWeProtect />
      <IntroProduct />
      <Footer />
    </div>
  );
};

export default Page;
