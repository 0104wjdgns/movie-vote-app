"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const USERS = [
  { id: "A", emoji: "🦁", color: "#EF4444", label: "참석자 A" },
  { id: "B", emoji: "🐯", color: "#F59E0B", label: "참석자 B" },
  { id: "C", emoji: "🦊", color: "#8B5CF6", label: "참석자 C" },
  { id: "D", emoji: "🐻", color: "#22C55E", label: "참석자 D" },
  { id: "E", emoji: "🐺", color: "#3B82F6", label: "참석자 E" },
];

export default function SelectUserPage() {
  const router = useRouter();
  const [selecting, setSelecting] = useState<string | null>(null);

  const handleSelect = (userId: string) => {
    setSelecting(userId);
    localStorage.setItem("user_id", userId);
    setTimeout(() => router.push("/recommend"), 150);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #07090F 0%, #0D1020 60%, #07090F 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2.5rem 1.5rem",
    }}>
      <div style={{ maxWidth: 420, width: "100%" }}>

        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#F59E0B", marginBottom: 14,
          }}>
            참여자 선택
          </div>
          <h1 style={{
            fontSize: "2rem", fontWeight: 800, color: "#F0F4FF", lineHeight: 1.2,
          }}>
            나는 누구인가요?
          </h1>
          <p style={{ color: "#8896B8", fontSize: "1rem", marginTop: 10, lineHeight: 1.6 }}>
            본인의 참여자 번호를 선택해주세요
          </p>
        </div>

        {/* 유저 카드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {USERS.map((user) => {
            const isSelecting = selecting === user.id;
            return (
              <button
                key={user.id}
                onClick={() => handleSelect(user.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "20px 22px",
                  background: isSelecting ? `${user.color}18` : "rgba(255,255,255,0.04)",
                  border: `1.5px solid ${isSelecting ? user.color : "rgba(255,255,255,0.09)"}`,
                  borderRadius: 18,
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  textAlign: "left",
                  width: "100%",
                  boxShadow: isSelecting ? `0 6px 24px ${user.color}30` : "none",
                }}
              >
                {/* 이모지 아이콘 */}
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: `${user.color}18`,
                  border: `1.5px solid ${user.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.8rem", flexShrink: 0,
                  transition: "transform 0.18s",
                  transform: isSelecting ? "scale(1.1)" : "scale(1)",
                }}>
                  {user.emoji}
                </div>

                {/* 텍스트 */}
                <div>
                  <div style={{
                    fontWeight: 700, fontSize: "1.15rem",
                    color: isSelecting ? user.color : "#F0F4FF",
                    transition: "color 0.18s",
                  }}>
                    {user.label}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#8896B8", marginTop: 3 }}>
                    탭하여 선택
                  </div>
                </div>

                {/* 화살표 */}
                <div style={{
                  marginLeft: "auto",
                  color: isSelecting ? user.color : "#4A5578",
                  fontSize: "1.4rem", flexShrink: 0,
                  transition: "color 0.18s",
                }}>
                  {isSelecting ? "✓" : "→"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
