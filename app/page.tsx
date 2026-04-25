import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { query } from "@/lib/db";

const palette = {
  sage: "#ACBDAA",
  navy: "#1E2D4C",
  grey: "#858585",
  blush: "#CEC0BB",
  cream: "#F7F2EE",
  white: "#FFFFFF",
};

const playStoreHref = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "/app";

const highlights = [
  {
    title: "Buy in seconds",
    body: "Choose a network, confirm your plan, and complete payment without unnecessary steps.",
  },
  {
    title: "Keep one wallet",
    body: "Fund once and use the same balance for data, airtime, cable TV, and electricity.",
  },
  {
    title: "Track every payment",
    body: "Your history, wallet funding, and transaction records stay available inside the same account.",
  },
];

const faqs = [
  {
    q: "What can I do on 2GO DATA?",
    a: "You can buy data, airtime, cable TV, and electricity, while also funding a wallet and reviewing your previous transactions.",
  },
  {
    q: "How do I fund my wallet?",
    a: "Each user gets a permanent account number for wallet funding, so repeat top-ups are straightforward.",
  },
  {
    q: "Do I need to install the app?",
    a: "Yes. The customer experience is designed around the app, while this page introduces the service and what it offers.",
  },
  {
    q: "Which networks are supported?",
    a: "2GO DATA supports the major Nigerian networks and keeps active plans available inside the app.",
  },
];

type LandingPlan = {
  id: string;
  networkName: string;
  sizeLabel: string;
  validity: string;
  price: number;
};

const normalizeValidityLabel = (value: string | null | undefined) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "Daily";
  if (raw === "daily" || raw.includes("day") || raw.includes("24hr")) return "Daily";
  if (raw === "weekly" || raw.includes("week") || raw.includes("7 days")) return "Weekly";
  if (raw === "monthly" || raw.includes("month") || raw.includes("30 days")) return "Monthly";
  return String(value || "");
};

const formatPrice = (amount: number) => `N${Number(amount || 0).toLocaleString()}`;

async function getLandingPlans(): Promise<LandingPlan[]> {
  try {
    return await query<LandingPlan>(
      `
        SELECT DISTINCT ON ("networkId", validity)
          id,
          "networkName",
          "sizeLabel",
          validity,
          price
        FROM "DataPlan"
        WHERE "isActive" = true
        ORDER BY "networkId", validity, price ASC
        LIMIT 6
      `
    );
  } catch (error) {
    console.error("Landing page plans query failed:", error);
    return [];
  }
}

export default async function HomePage() {
  const livePlans = await getLandingPlans();

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          `radial-gradient(circle at top left, rgba(172,189,170,0.18), transparent 28%), ` +
          `radial-gradient(circle at top right, rgba(30,45,76,0.10), transparent 30%), ` +
          `linear-gradient(180deg, ${palette.cream} 0%, #f4efeb 48%, #f7f2ee 100%)`,
        color: palette.navy,
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "22px 20px 56px" }}>
        <header
          style={{
            position: "sticky",
            top: 16,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            padding: "14px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.78)",
            border: "1px solid rgba(30,45,76,0.08)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 14px 34px rgba(30,45,76,0.06)",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: palette.navy }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                overflow: "hidden",
                background: palette.white,
                boxShadow: "0 10px 22px rgba(30,45,76,0.10)",
                flexShrink: 0,
              }}
            >
              <Image src="/logo.jpeg" alt="2GO DATA logo" width={50} height={50} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: palette.grey }}>
                2GO DATA
              </span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Data, airtime, wallet funding, and bill payments</span>
            </div>
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <a href="#plans" style={navLink}>Plans</a>
            <a href="#features" style={navLink}>Why 2GO DATA</a>
            <a href="#faq" style={navLink}>FAQ</a>
            <Link href="/app" style={primaryButton}>Open App</Link>
          </div>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
            alignItems: "center",
            paddingTop: 48,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={eyebrowPill}>Reliable everyday digital payments</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(3rem, 7vw, 5.4rem)",
                  lineHeight: 0.94,
                  letterSpacing: "-0.055em",
                  fontWeight: 800,
                  maxWidth: 760,
                }}
              >
                Buy data, airtime, and utilities from one account.
              </h1>
              <p style={{ ...bodyText, maxWidth: 680, fontSize: "clamp(1.05rem, 2.1vw, 1.22rem)" }}>
                2GO DATA helps you fund once, pay quickly, and keep your records organised. It is built for customers who want straightforward service every time they open the app.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/app" style={primaryButton}>Open 2GO DATA</Link>
              <a href="#plans" style={secondaryButton}>View live plans</a>
              <a href={playStoreHref} style={{ display: "inline-flex", textDecoration: "none" }}>
                <Image
                  src="/google-play-badge.svg"
                  alt="Get it on Google Play"
                  width={196}
                  height={58}
                  style={{ width: 196, height: 58 }}
                />
              </a>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              {[
                { value: "4 major networks", label: "Find active bundles from MTN, Airtel, Glo, and 9mobile." },
                { value: "Permanent funding", label: "Use your dedicated wallet account number whenever you need to top up." },
                { value: "One payment flow", label: "Manage data, airtime, cable TV, and electricity in one place." },
              ].map((item) => (
                <div key={item.value} style={metricCard}>
                  <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.04em" }}>{item.value}</div>
                  <div style={{ marginTop: 8, color: "#5f6878", lineHeight: 1.65, fontSize: 14 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              padding: 18,
              borderRadius: 36,
              background: "linear-gradient(180deg, rgba(30,45,76,0.98) 0%, rgba(39,58,92,0.96) 100%)",
              boxShadow: "0 34px 72px rgba(30,45,76,0.18)",
              minHeight: 640,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -70,
                right: -50,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background: "rgba(172,189,170,0.24)",
                filter: "blur(8px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -90,
                left: -80,
                width: 240,
                height: 240,
                borderRadius: "50%",
                background: "rgba(206,192,187,0.22)",
                filter: "blur(12px)",
              }}
            />

            <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 14, height: "100%" }}>
              <div
                style={{
                  padding: "22px 22px 24px",
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  color: palette.white,
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.68)" }}>
                  Wallet funding
                </div>
                <div style={{ marginTop: 12, fontSize: 34, fontWeight: 800, letterSpacing: "-0.05em" }}>One account number for top-ups.</div>
                <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.78)", lineHeight: 1.72, fontSize: 15 }}>
                  Fund your wallet, confirm your balance, and use the same account across everyday purchases.
                </p>
              </div>

              <div
                style={{
                  borderRadius: 30,
                  padding: 22,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(246,241,238,0.93))",
                  display: "grid",
                  gap: 16,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.70)",
                }}
              >
                <div
                  style={{
                    borderRadius: 24,
                    padding: "18px 18px 20px",
                    background: palette.navy,
                    color: palette.white,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.68)" }}>
                    Wallet summary
                  </div>
                  <div style={{ marginTop: 10, fontSize: 36, fontWeight: 800, letterSpacing: "-0.05em" }}>N12,840</div>
                  <div style={{ marginTop: 10, color: "rgba(255,255,255,0.78)", lineHeight: 1.65 }}>
                    Fund, buy, and review your activity from the same account.
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                  {[
                    { title: "Buy Data", desc: "Choose a bundle and complete payment quickly." },
                    { title: "Buy Airtime", desc: "Top up the networks you use every day." },
                    { title: "Cable TV", desc: "Renew subscriptions without leaving the app." },
                    { title: "Electricity", desc: "Handle bill payments from the same wallet." },
                  ].map((item) => (
                    <div key={item.title} style={miniCard}>
                      <div style={{ width: 38, height: 38, borderRadius: 14, background: "rgba(30,45,76,0.08)", marginBottom: 12 }} />
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</div>
                      <div style={{ marginTop: 8, color: "#5f6878", lineHeight: 1.58, fontSize: 13 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    padding: "16px 18px",
                    borderRadius: 22,
                    background: "rgba(172,189,170,0.18)",
                    border: "1px solid rgba(30,45,76,0.07)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#667385" }}>
                    Built for everyday use
                  </div>
                  <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, lineHeight: 1.45 }}>
                    A calmer, more reliable way to handle your routine digital payments.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" style={{ marginTop: 56 }}>
          <div style={{ maxWidth: 780, marginBottom: 22 }}>
            <div style={sectionEyebrow}>Why 2GO DATA</div>
            <h2 style={sectionTitle}>Built to make routine payments easier to complete and easier to trust.</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {highlights.map((item, index) => (
              <article
                key={item.title}
                style={{
                  padding: "24px 22px 26px",
                  borderRadius: 30,
                  background: index === 0 ? palette.navy : "rgba(255,255,255,0.74)",
                  color: index === 0 ? palette.white : palette.navy,
                  border: index === 0 ? "none" : "1px solid rgba(30,45,76,0.08)",
                  boxShadow: index === 0 ? "0 22px 48px rgba(30,45,76,0.16)" : "0 18px 36px rgba(30,45,76,0.05)",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    background: index === 0 ? "rgba(255,255,255,0.14)" : "rgba(172,189,170,0.24)",
                    marginBottom: 16,
                  }}
                />
                <h3 style={{ margin: 0, fontSize: 24, lineHeight: 1.18 }}>{item.title}</h3>
                <p style={{ margin: "12px 0 0", lineHeight: 1.72, color: index === 0 ? "rgba(255,255,255,0.76)" : "#5f6878" }}>
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="plans"
          style={{
            marginTop: 56,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 18,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              padding: "30px 26px",
              borderRadius: 34,
              background: "rgba(255,255,255,0.76)",
              border: "1px solid rgba(30,45,76,0.08)",
              boxShadow: "0 18px 40px rgba(30,45,76,0.05)",
            }}
          >
            <div style={sectionEyebrow}>What customers can expect</div>
            <h2 style={{ ...sectionTitle, marginBottom: 14 }}>One account for the services people use most often.</h2>
            <p style={bodyText}>
              From mobile data and airtime to cable TV and electricity, 2GO DATA keeps the essentials in one app so customers do not need to jump between different payment tools.
            </p>
            <div style={{ display: "grid", gap: 12, marginTop: 22 }}>
              {[
                "Wallet funding with a permanent account number",
                "Active plans grouped clearly inside the app",
                "Transaction history for completed purchases",
                "Support for recurring digital needs in one place",
              ].map((item) => (
                <div key={item} style={listRow}>
                  <span style={listDot} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "30px 26px",
              borderRadius: 34,
              background: palette.navy,
              color: palette.white,
              boxShadow: "0 28px 62px rgba(30,45,76,0.18)",
            }}
          >
            <div style={{ ...sectionEyebrow, color: "rgba(255,255,255,0.68)" }}>Live plan preview</div>
            <h2 style={{ ...sectionTitle, color: palette.white, maxWidth: 560 }}>
              Active plans pulled directly from the app database.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 20 }}>
              {livePlans.length > 0 ? (
                livePlans.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "18px 18px 20px",
                      borderRadius: 24,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <div style={{ color: palette.sage, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em" }}>{item.networkName}</div>
                    <div style={{ marginTop: 10, fontSize: 24, fontWeight: 800 }}>{item.sizeLabel}</div>
                    <div style={{ marginTop: 6, color: "rgba(255,255,255,0.72)" }}>{normalizeValidityLabel(item.validity)}</div>
                    <div style={{ marginTop: 16, fontSize: 18, fontWeight: 700 }}>{formatPrice(item.price)}</div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    padding: "20px 18px",
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(255,255,255,0.78)",
                    lineHeight: 1.7,
                  }}
                >
                  Active plans will appear here automatically once plans are available in the database.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="faq" style={{ marginTop: 58 }}>
          <div style={{ maxWidth: 760, marginBottom: 20 }}>
            <div style={sectionEyebrow}>Frequently asked questions</div>
            <h2 style={sectionTitle}>Answers to common questions before customers enter the app.</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {faqs.map((item) => (
              <article
                key={item.q}
                style={{
                  padding: "24px 22px 26px",
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.76)",
                  border: "1px solid rgba(30,45,76,0.08)",
                  boxShadow: "0 16px 30px rgba(30,45,76,0.05)",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.26 }}>{item.q}</h3>
                <p style={{ margin: "12px 0 0", lineHeight: 1.72, color: "#5f6878" }}>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: 36,
            padding: "34px 28px",
            borderRadius: 36,
            background: "linear-gradient(135deg, rgba(30,45,76,0.98), rgba(72,87,116,0.96))",
            color: palette.white,
            boxShadow: "0 30px 64px rgba(30,45,76,0.18)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div style={{ maxWidth: 680 }}>
              <div style={{ color: "rgba(255,255,255,0.66)", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 800, fontSize: 12 }}>
                Get started
              </div>
              <h2 style={{ margin: "10px 0 0", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.02 }}>
                Open 2GO DATA and manage routine digital payments from one place.
              </h2>
            </div>

            <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/app" style={{ ...primaryButton, background: palette.white, color: palette.navy }}>
                Open App
              </Link>
              <a href={playStoreHref} style={{ display: "inline-flex", textDecoration: "none" }}>
                <Image
                  src="/google-play-badge.svg"
                  alt="Get it on Google Play"
                  width={196}
                  height={58}
                  style={{ width: 196, height: 58 }}
                />
              </a>
            </div>
          </div>
        </section>

        <footer
          style={{
            marginTop: 34,
            padding: "18px 0 28px",
            display: "grid",
            gap: 20,
          }}
        >
          <div style={{ color: "#5f6878", lineHeight: 1.7 }}>
            <div style={{ fontWeight: 700, color: palette.navy }}>2GO DATA</div>
            <div>Affordable, always connected.</div>
          </div>

          <a
            href="https://anjalventures.com"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 18,
              padding: "22px 24px",
              borderRadius: 32,
              textDecoration: "none",
              color: palette.navy,
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(30,45,76,0.08)",
              boxShadow: "0 18px 38px rgba(30,45,76,0.06)",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <Image
                src="/anjal-ventures-logo.png"
                alt="Anjal Ventures logo"
                width={84}
                height={84}
                style={{ width: 84, height: 84, objectFit: "contain", background: palette.white, borderRadius: 22, padding: 8 }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 13, color: palette.grey, textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 800 }}>
                  Built by
                </span>
                <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>Anjal Ventures</span>
                <span style={{ color: "#5f6878", lineHeight: 1.65, maxWidth: 620 }}>
                  Product strategy, design, and engineering support for digital products built to launch with clarity and scale.
                </span>
              </div>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Visit anjalventures.com</span>
          </a>
        </footer>
      </div>
    </main>
  );
}

const navLink: CSSProperties = {
  color: "#4f596b",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 700,
  padding: "10px 12px",
  borderRadius: 999,
};

const primaryButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "16px 22px",
  borderRadius: 999,
  background: palette.navy,
  color: palette.white,
  fontWeight: 800,
  boxShadow: "0 18px 38px rgba(30,45,76,0.14)",
};

const secondaryButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  padding: "16px 22px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.76)",
  color: palette.navy,
  border: "1px solid rgba(30,45,76,0.08)",
  fontWeight: 800,
};

const sectionEyebrow: CSSProperties = {
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  fontWeight: 800,
  color: palette.grey,
};

const sectionTitle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: "clamp(2rem, 4vw, 3.2rem)",
  lineHeight: 1.04,
  letterSpacing: "-0.04em",
  fontWeight: 800,
  color: palette.navy,
};

const bodyText: CSSProperties = {
  margin: 0,
  lineHeight: 1.8,
  color: "#5f6878",
  fontSize: 16,
};

const eyebrowPill: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  width: "fit-content",
  padding: "10px 14px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.76)",
  border: "1px solid rgba(30,45,76,0.08)",
  boxShadow: "0 10px 24px rgba(30,45,76,0.05)",
  color: palette.grey,
  fontWeight: 700,
  fontSize: 13,
};

const metricCard: CSSProperties = {
  padding: "20px 18px",
  borderRadius: 24,
  background: "rgba(255,255,255,0.74)",
  border: "1px solid rgba(30,45,76,0.08)",
  boxShadow: "0 16px 30px rgba(30,45,76,0.05)",
};

const miniCard: CSSProperties = {
  padding: "16px 14px",
  borderRadius: 22,
  background: palette.white,
  border: "1px solid rgba(30,45,76,0.08)",
  boxShadow: "0 12px 24px rgba(30,45,76,0.05)",
};

const listRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: palette.navy,
  lineHeight: 1.6,
  fontWeight: 600,
};

const listDot: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: palette.sage,
  flexShrink: 0,
};
