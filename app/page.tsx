"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [posters, setPosters] = useState<string[]>([]);

  useEffect(() => {
    setTimeout(() => setMounted(true), 80);
    fetch("/api/popular")
      .then((r) => r.json())
      .then((d) => setPosters(d.posters || []));
  }, []);

  // 포스터 40개로 채우기 (반복)
  const filled = posters.length > 0
    ? Array.from({ length: 40 }, (_, i) => posters[i % posters.length])
    : [];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#07090F",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2.5rem 1.5rem",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* 포스터 배경 그리드 */}
      {filled.length > 0 && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gridTemplateRows: "repeat(8, 1fr)",
          gap: 4,
          transform: "rotate(-4deg) scale(1.15)",
          pointerEvents: "none",
          zIndex: 0,
        }}>
          {filled.map((src, i) => (
            <div key={i} style={{ position: "relative", overflow: "hidden" }}>
              <Image
                src={src}
                alt=""
                fill
                sizes="20vw"
                style={{ objectFit: "cover", opacity: 0.65 }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 그라디언트 오버레이 */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(160deg, rgba(7,9,15,0.6) 0%, rgba(13,16,32,0.65) 50%, rgba(19,8,32,0.72) 100%)",
        zIndex: 1,
        pointerEvents: "none",
      }} />

      {/* 콘텐츠 */}
      <div style={{
        position: "relative",
        zIndex: 2,
        maxWidth: 420,
        width: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2.5rem",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}>

        {/* 로고 */}
        <div style={{
          width: 96, height: 96, borderRadius: 28,
          background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "3rem",
          boxShadow: "0 12px 48px rgba(124,58,237,0.6), 0 0 0 1px rgba(124,58,237,0.4)",
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
            textShadow: "0 4px 24px rgba(0,0,0,0.8)",
          }}>
            공동선을 주제로 한<br />영화 선정
          </h1>
          <p style={{
            color: "#C8D0E8", fontSize: "1.05rem", lineHeight: 1.7, margin: 0,
            textShadow: "0 2px 12px rgba(0,0,0,0.8)",
          }}>
            영화를 추천하고 투표해서<br />함께 볼 영화를 선정해요
          </p>
        </div>

        {/* 통계 칩 */}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { icon: "👥", text: "5명 참여" },
            { icon: "🎞️", text: "인당 최대 두 편 추천!" },
            { icon: "🗳️", text: "복수 후보 투표 가능" },
          ].map((chip) => (
            <div key={chip.text} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 99,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
              color: "#C8D0E8", fontSize: "0.85rem", fontWeight: 500,
            }}>
              {chip.icon} {chip.text}
            </div>
          ))}
        </div>

        {/* CTA */}
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
