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

const stats = [
  { value: "4 Networks", label: "Browse plans for MTN, Airtel, Glo, and 9mobile in one place" },
  { value: "24/7", label: "Buy data, airtime, cable, and electricity whenever you need it" },
  { value: "One Wallet", label: "Fund once and pay across everyday digital services" },
];

const features = [
  {
    title: "Buy fast without confusion",
    body: "The app keeps common tasks simple, from selecting a network to confirming payment and viewing the final result.",
  },
  {
    title: "See plans clearly",
    body: "Daily, weekly, and monthly bundles are easier to compare, so customers can find the right option quickly.",
  },
  {
    title: "Handle more than data",
    body: "Buy airtime, renew cable, pay electricity bills, and keep your transaction history inside the same account.",
  },
  {
    title: "Trust every step",
    body: "Wallet records, payment flows, and account details are presented in a way that feels dependable and easy to follow.",
  },
];

const valuePoints = [
  "Buy data and airtime in seconds",
  "Fund your wallet with a permanent account number",
  "Track completed transactions without guesswork",
  "Keep utilities and telecom purchases in one app",
];

const faqs = [
  {
    q: "What can I do on 2GO DATA?",
    a: "You can buy data, airtime, cable TV, and electricity, while also managing wallet funding and checking your transaction history.",
  },
  {
    q: "Do I need the app to use the service?",
    a: "Yes. The main customer experience lives inside the app, while this page helps new users understand the product before opening it.",
  },
  {
    q: "Can I fund my wallet easily?",
    a: "Yes. Users get a permanent virtual account for wallet funding, which makes repeat top-ups straightforward.",
  },
  {
    q: "Who is 2GO DATA built for?",
    a: "It is built for customers who buy data and other digital essentials regularly and want a cleaner, more reliable experience.",
  },
];

const playStoreHref = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "/app";

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
          `radial-gradient(circle at top left, rgba(172,189,170,0.55), transparent 28%), ` +
          `radial-gradient(circle at top right, rgba(30,45,76,0.12), transparent 32%), ` +
          `linear-gradient(180deg, ${palette.cream} 0%, ${palette.blush} 54%, #f6f1ed 100%)`,
        color: palette.navy,
      }}
    >
      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "24px 20px 56px" }}>
        <header
          style={{
            position: "sticky",
            top: 16,
            zIndex: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 18,
            padding: "16px 18px",
            borderRadius: 28,
            border: "1px solid rgba(30,45,76,0.08)",
            background: "rgba(255,255,255,0.66)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 18px 40px rgba(30,45,76,0.08)",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: palette.navy }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 18,
                overflow: "hidden",
                background: palette.white,
                boxShadow: "0 10px 24px rgba(30,45,76,0.12)",
                flexShrink: 0,
              }}
            >
              <Image src="/logo.jpeg" alt="2GO DATA logo" width={52} height={52} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: palette.grey, fontWeight: 700 }}>
                2GO DATA
              </div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Data, airtime, bills, and wallet funding in one app</div>
            </div>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="#features" style={navLink}>Features</a>
            <a href="#plans" style={navLink}>Plans</a>
            <a href="#faq" style={navLink}>FAQ</a>
            <Link href="/app" style={primaryButton}>Open App</Link>
          </nav>
        </header>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 28,
            alignItems: "stretch",
            paddingTop: 40,
          }}
        >
          <div
            style={{
              padding: "26px 4px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                width: "fit-content",
                padding: "10px 14px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(30,45,76,0.08)",
                boxShadow: "0 10px 24px rgba(30,45,76,0.06)",
                color: palette.grey,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Fast access to everyday digital essentials
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(3rem, 7vw, 5.6rem)",
                  lineHeight: 0.95,
                  letterSpacing: "-0.05em",
                  fontWeight: 800,
                }}
              >
                Buy data, airtime, and bills from one clean wallet experience.
              </h1>
              <p
                style={{
                  margin: 0,
                  maxWidth: 680,
                  fontSize: "clamp(1.05rem, 2.2vw, 1.3rem)",
                  lineHeight: 1.75,
                  color: "#4f596b",
                }}
              >
                2GO DATA gives customers a straightforward way to fund a wallet, pick a service, complete payment, and move on without unnecessary friction.
              </p>
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
              <Link href="/app" style={primaryButton}>
                Open 2GO DATA
              </Link>
              <a href="#plans" style={secondaryButton}>
                View live plans
              </a>
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
                marginTop: 10,
              }}
            >
              {stats.map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "20px 18px",
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.72)",
                    border: "1px solid rgba(30,45,76,0.08)",
                    boxShadow: "0 16px 32px rgba(30,45,76,0.06)",
                  }}
                >
                  <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>{item.value}</div>
                  <div style={{ marginTop: 8, color: "#5f6878", lineHeight: 1.6, fontSize: 14 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              position: "relative",
              minHeight: 620,
              padding: 18,
              borderRadius: 34,
              background:
                "linear-gradient(180deg, rgba(30,45,76,0.98) 0%, rgba(30,45,76,0.92) 44%, rgba(68,83,112,0.92) 100%)",
              boxShadow: "0 36px 80px rgba(30,45,76,0.20)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "auto -70px 52% auto",
                width: 240,
                height: 240,
                borderRadius: "50%",
                background: "rgba(172,189,170,0.30)",
                filter: "blur(10px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: "52% auto auto -84px",
                width: 260,
                height: 260,
                borderRadius: "50%",
                background: "rgba(206,192,187,0.26)",
                filter: "blur(16px)",
              }}
            />

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                height: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 22px",
                  borderRadius: 26,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: palette.white,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.12em", opacity: 0.74 }}>
                    2GO DATA APP
                  </div>
                  <div style={{ marginTop: 8, fontSize: 28, fontWeight: 800 }}>Simple actions. Clear results.</div>
                </div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 20,
                    background: "rgba(172,189,170,0.18)",
                    color: palette.sage,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Customer-first
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 14,
                  flex: 1,
                }}
              >
                <div
                  style={{
                    borderRadius: 28,
                    padding: 22,
                    background: "linear-gradient(180deg, rgba(255,255,255,0.93), rgba(244,239,235,0.92))",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      borderRadius: 22,
                      padding: "18px 18px 20px",
                      background: palette.navy,
                      color: palette.white,
                    }}
                  >
                    <div style={{ fontSize: 13, opacity: 0.76 }}>Available balance</div>
                    <div style={{ marginTop: 8, fontSize: 34, fontWeight: 800, letterSpacing: "-0.04em" }}>N12,840</div>
                    <div style={{ marginTop: 8, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                      One wallet for data, airtime, cable, and electricity payments.
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 12 }}>
                    {[
                      { label: "Buy Data", tone: palette.navy },
                      { label: "Buy Airtime", tone: palette.sage },
                      { label: "Cable TV", tone: "#a98a6b" },
                      { label: "Electricity", tone: palette.grey },
                    ].map((action) => (
                      <div
                        key={action.label}
                        style={{
                          padding: "16px 14px",
                          borderRadius: 20,
                          background: palette.white,
                          border: "1px solid rgba(30,45,76,0.08)",
                          boxShadow: "0 12px 24px rgba(30,45,76,0.05)",
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 14,
                            background: `${action.tone}18`,
                            marginBottom: 12,
                          }}
                        />
                        <div style={{ fontWeight: 700 }}>{action.label}</div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      padding: "16px 18px",
                      borderRadius: 22,
                      background: "rgba(172,189,170,0.20)",
                      border: "1px solid rgba(30,45,76,0.06)",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "#5f6878", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                      What customers get
                    </div>
                    <div style={{ marginTop: 8, fontSize: 18, fontWeight: 700, lineHeight: 1.4 }}>
                      Faster purchases, cleaner screens, and fewer steps between intention and completion.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {valuePoints.map((item, index) => (
                    <div
                      key={item}
                      style={{
                        padding: "18px 18px 20px",
                        borderRadius: 24,
                        background: "rgba(255,255,255,0.10)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        color: palette.white,
                      }}
                    >
                      <div style={{ color: palette.sage, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em" }}>
                        0{index + 1}
                      </div>
                      <div style={{ marginTop: 12, fontWeight: 700, lineHeight: 1.6 }}>{item}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          style={{
            marginTop: 52,
            padding: "34px 0 10px",
          }}
        >
          <div style={{ maxWidth: 760, marginBottom: 22 }}>
            <div style={sectionEyebrow}>Why customers use 2GO DATA</div>
            <h2 style={sectionTitle}>Everyday digital services without clutter or guesswork.</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {features.map((feature, index) => (
              <article
                key={feature.title}
                style={{
                  padding: "22px 20px 24px",
                  borderRadius: 28,
                  background: index === 0 ? palette.navy : "rgba(255,255,255,0.72)",
                  color: index === 0 ? palette.white : palette.navy,
                  border: index === 0 ? "none" : "1px solid rgba(30,45,76,0.08)",
                  boxShadow: index === 0 ? "0 24px 48px rgba(30,45,76,0.16)" : "0 16px 34px rgba(30,45,76,0.06)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 16,
                    background: index === 0 ? "rgba(255,255,255,0.14)" : "rgba(172,189,170,0.22)",
                    marginBottom: 16,
                  }}
                />
                <h3 style={{ margin: 0, fontSize: 22, lineHeight: 1.2 }}>{feature.title}</h3>
                <p style={{ margin: "12px 0 0", lineHeight: 1.72, color: index === 0 ? "rgba(255,255,255,0.76)" : "#5f6878" }}>
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: 52,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 18,
          }}
        >
          <div
            style={{
              padding: "28px 24px",
              borderRadius: 32,
              background: "rgba(255,255,255,0.76)",
              border: "1px solid rgba(30,45,76,0.08)",
              boxShadow: "0 18px 40px rgba(30,45,76,0.06)",
            }}
          >
            <div style={sectionEyebrow}>Why this works</div>
            <h2 style={{ ...sectionTitle, marginBottom: 14 }}>A simpler path from wallet funding to completed purchase.</h2>
            <p style={bodyText}>
              2GO DATA is designed to help customers open the app, pick a service, pay, and leave with confidence that the transaction is recorded and easy to confirm later.
            </p>
            <Link href="/app" style={{ ...primaryButton, marginTop: 18, display: "inline-flex" }}>
              Enter the app
            </Link>
          </div>

          <div
            id="plans"
            style={{
              padding: "28px 24px",
              borderRadius: 32,
              background: palette.navy,
              color: palette.white,
              boxShadow: "0 30px 60px rgba(30,45,76,0.16)",
            }}
          >
            <div style={{ ...sectionEyebrow, color: "rgba(255,255,255,0.66)" }}>Live plan preview</div>
            <h2 style={{ ...sectionTitle, color: palette.white, maxWidth: 540 }}>Current active plans pulled directly from the app database.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 14, marginTop: 20 }}>
              {livePlans.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "18px 18px 20px",
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ color: palette.sage, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em" }}>{item.networkName}</div>
                  <div style={{ marginTop: 10, fontSize: 24, fontWeight: 800 }}>{item.sizeLabel}</div>
                  <div style={{ marginTop: 6, color: "rgba(255,255,255,0.72)" }}>{normalizeValidityLabel(item.validity)}</div>
                  <div style={{ marginTop: 16, fontSize: 18, fontWeight: 700 }}>{formatPrice(item.price)}</div>
                </div>
              ))}
              {livePlans.length === 0 && (
                <div
                  style={{
                    padding: "20px 18px",
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.08)",
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

        <section
          id="faq"
          style={{
            marginTop: 54,
            padding: "4px 0 30px",
          }}
        >
          <div style={{ maxWidth: 760, marginBottom: 20 }}>
            <div style={sectionEyebrow}>Questions</div>
            <h2 style={sectionTitle}>Common questions about 2GO DATA.</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16 }}>
            {faqs.map((item) => (
              <div
                key={item.q}
                style={{
                  padding: "22px 20px 24px",
                  borderRadius: 28,
                  background: "rgba(255,255,255,0.74)",
                  border: "1px solid rgba(30,45,76,0.08)",
                  boxShadow: "0 16px 30px rgba(30,45,76,0.05)",
                }}
              >
                <h3 style={{ margin: 0, fontSize: 21, lineHeight: 1.3 }}>{item.q}</h3>
                <p style={{ margin: "12px 0 0", lineHeight: 1.72, color: "#5f6878" }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            marginTop: 16,
            padding: "34px 26px",
            borderRadius: 34,
            background: "linear-gradient(135deg, rgba(30,45,76,0.98), rgba(70,84,112,0.95))",
            color: palette.white,
            boxShadow: "0 28px 64px rgba(30,45,76,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 640 }}>
              <div style={{ color: "rgba(255,255,255,0.66)", textTransform: "uppercase", letterSpacing: "0.16em", fontWeight: 800, fontSize: 12 }}>
                Get started
              </div>
              <h2 style={{ margin: "10px 0 0", fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.02 }}>
                Open 2GO DATA and handle everyday digital payments from one place.
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
            marginTop: 36,
            padding: "10px 4px 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
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
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 14px",
              borderRadius: 999,
              textDecoration: "none",
              color: palette.navy,
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(30,45,76,0.08)",
              boxShadow: "0 12px 28px rgba(30,45,76,0.05)",
            }}
          >
            <Image src="/anjal-ventures-logo.png" alt="Anjal Ventures logo" width={42} height={42} style={{ width: 42, height: 42, objectFit: "contain" }} />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3 }}>
              <span style={{ fontSize: 12, color: palette.grey, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 800 }}>
                Built by
              </span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Anjal Ventures</span>
            </span>
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
  boxShadow: "0 18px 40px rgba(30,45,76,0.14)",
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
  fontSize: "clamp(2rem, 4vw, 3.4rem)",
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
