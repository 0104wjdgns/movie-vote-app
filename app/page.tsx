"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #07090F 0%, #0D1020 40%, #130820 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2.5rem 1.5rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* 배경 글로우 */}
      <div style={{
        position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "15%", right: "-10%",
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{
        maxWidth: 420, width: "100%", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        {/* 로고 아이콘 */}
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "3rem",
          boxShadow: "0 12px 40px rgba(124,58,237,0.5), 0 0 0 1px rgba(124,58,237,0.3)",
        }}>
          🎬
        </div>

        {/* 텍스트 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{
            fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "#F59E0B",
          }}>
            THAUMAZEIN READERS CLUB
          </div>
          <h1 style={{
            fontSize: "2.2rem", fontWeight: 800, lineHeight: 1.15,
            color: "#F0F4FF", margin: 0,
            textShadow: "0 2px 20px rgba(124,58,237,0.3)",
          }}>
            공동선을 주제로 한<br />영화 선정
          </h1>
          <p style={{
            color: "#8896B8", fontSize: "1.05rem", lineHeight: 1.7, margin: 0,
          }}>
            영화를 추천하고 투표해서<br />함께 볼 영화를 선정해요
          </p>
        </div>

        {/* 통계 칩 */}
        <div style={{
          display: "flex", gap: "0.75rem",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {[
            { icon: "👥", text: "5명 참여" },
            { icon: "🎞️", text: "최대 10편" },
            { icon: "🗳️", text: "실시간 투표" },
          ].map((chip) => (
            <div key={chip.text} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 99,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#8896B8", fontSize: "0.85rem", fontWeight: 500,
            }}>
              {chip.icon} {chip.text}
            </div>
          ))}
        </div>

        {/* CTA 버튼 */}
        <button
          className="btn btn-accent"
          style={{ width: "100%", padding: "20px", fontSize: "1.15rem", borderRadius: 16 }}
          onClick={() => router.push("/select-user")}
        >
          시작하기  →
        </button>
      </div>
    </div>
  );
}
