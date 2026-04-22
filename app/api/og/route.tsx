import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tierName = searchParams.get("tierName") ?? "Arc Wanderer";
  const score = searchParams.get("score") ?? "0";
  const user = searchParams.get("user") ?? "";

  const imageFile = join(process.cwd(), "public", "sbt-images", `${tierName}.png`);
  let sbtSrc = "";
  try {
    const buf = readFileSync(imageFile);
    sbtSrc = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {}

  const logoFile = join(process.cwd(), "public", "logo.png");
  let logoSrc = "";
  try {
    const buf = readFileSync(logoFile);
    logoSrc = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {}

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #020818 0%, #0d0d2b 50%, #060820 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow orbs */}
        <div style={{
          position: "absolute", width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,70,229,0.25), transparent)",
          top: "-150px", left: "-150px",
        }} />
        <div style={{
          position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.15), transparent)",
          bottom: "-100px", right: "-100px",
        }} />

        {/* Left — SBT image */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "380px", flexShrink: 0 }}>
          {sbtSrc && (
            <img src={sbtSrc} width={280} height={280} style={{ objectFit: "contain", filter: "drop-shadow(0 0 40px rgba(99,102,241,0.6))" }} />
          )}
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "320px", background: "rgba(99,102,241,0.3)", flexShrink: 0 }} />

        {/* Right — Info */}
        <div style={{ display: "flex", flexDirection: "column", padding: "0 60px", flex: 1 }}>
          {/* Logo + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            {logoSrc && <img src={logoSrc} width={40} height={40} style={{ borderRadius: "8px" }} />}
            <span style={{ color: "rgba(165,180,252,0.7)", fontSize: "18px", fontWeight: 700, letterSpacing: "0.1em" }}>
              ARC TRIVIA 1.0
            </span>
          </div>

          {/* Username */}
          {user && (
            <p style={{ color: "rgba(165,180,252,0.6)", fontSize: "20px", margin: "0 0 8px 0" }}>@{user}</p>
          )}

          {/* Tier name */}
          <p style={{ color: "#a5b4fc", fontSize: "36px", fontWeight: 800, margin: "0 0 12px 0", lineHeight: 1.1 }}>
            {tierName}
          </p>

          {/* Score */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "28px" }}>
            <span style={{ color: "white", fontSize: "80px", fontWeight: 900, lineHeight: 1 }}>{score}</span>
            <span style={{ color: "#6366f1", fontSize: "36px", fontWeight: 700 }}>/20</span>
          </div>

          {/* Tag */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "999px", padding: "8px 20px", alignSelf: "flex-start",
          }}>
            <span style={{ color: "#a5b4fc", fontSize: "16px" }}>Powered by Arc Testnet</span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
