"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchResult {
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  release_date: string;
  overview: string;
}

const STEPS = ["검색", "선택", "확인"];

export default function RecommendPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (!id) { router.push("/select-user"); return; }
    setUserId(id);
  }, [router]);

  const handleSearch = async () => {
    if (!title.trim()) { setError("영화 제목을 입력해주세요"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/search?title=${encodeURIComponent(title)}`);
      const data = await res.json();
      if (data.results?.length > 0) {
        setResults(data.results);
        setStep(1);
      } else {
        setError("검색 결과가 없어요. 다른 제목으로 검색해보세요.");
      }
    } catch {
      setError("검색 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (movie: SearchResult) => {
    setSelected(movie);
    setStep(2);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selected.title,
          director: director.trim() || "감독 미상",
          poster_url: selected.poster_url,
          tmdb_id: selected.tmdb_id,
          recommended_by: userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "등록 실패"); return; }
      router.push("/movies");
    } catch {
      setError("등록 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  const goBack = () => {
    if (step === 0) router.push("/movies");
    else if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#07090F", display: "flex", flexDirection: "column" }}>
      {/* 헤더 */}
      <div style={{
        padding: "16px 20px",
        background: "#0D1020",
        borderBottom: "1px solid #1F2B45",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <button
          className="btn btn-ghost"
          style={{ padding: "10px 16px", fontSize: "0.95rem", borderRadius: 12, flexShrink: 0 }}
          onClick={goBack}
        >
          ← 뒤로
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#F0F4FF" }}>영화 추천</div>
          <div style={{ fontSize: "0.78rem", color: "#8896B8" }}>참석자 {userId}</div>
        </div>
        {/* 스텝 인디케이터 */}
        <div style={{ display: "flex", gap: 6 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 22 : 8, height: 8, borderRadius: 99,
              background: i <= step ? "#7C3AED" : "#1F2B45",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>
      </div>

      {/* 본문 */}
      <div style={{ flex: 1, padding: "28px 20px", maxWidth: 480, margin: "0 auto", width: "100%" }}>

        {/* STEP 0: 검색 */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <h2 style={{ fontSize: "1.7rem", fontWeight: 800, margin: "0 0 8px", color: "#F0F4FF" }}>
                어떤 영화를 추천하시나요?
              </h2>
              <p style={{ color: "#8896B8", fontSize: "1rem", margin: 0, lineHeight: 1.6 }}>
                제목으로 검색하면 포스터를 자동으로 가져와요
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8896B8",
                  textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>
                  영화 제목 *
                </label>
                <input
                  className="input"
                  placeholder="예) 기생충, Parasite"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  autoFocus
                  style={{ fontSize: "1.05rem" }}
                />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#8896B8",
                  textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 10 }}>
                  감독명 (선택)
                </label>
                <input
                  className="input"
                  placeholder="예) 봉준호. 모르시면 생략해주세요!"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{ fontSize: "1.05rem" }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                padding: "14px 18px", background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12,
                color: "#FCA5A5", fontSize: "0.95rem",
              }}>
                {error}
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "18px", fontSize: "1.1rem" }}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? "검색 중..." : "🔍  영화 검색"}
            </button>
          </div>
        )}

        {/* STEP 1: 결과 선택 */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <h2 style={{ fontSize: "1.7rem", fontWeight: 800, margin: "0 0 8px", color: "#F0F4FF" }}>
                어떤 영화인가요?
              </h2>
              <p style={{ color: "#8896B8", fontSize: "1rem", margin: 0 }}>
                검색 결과 중 맞는 영화를 탭해주세요
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {results.map((movie) => (
                <button
                  key={movie.tmdb_id}
                  onClick={() => handleSelect(movie)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 18px",
                    background: "#111827",
                    border: "1px solid #1F2B45",
                    borderRadius: 16,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      width={44}
                      height={66}
                      style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 44, height: 66, borderRadius: 8,
                      background: "var(--c-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.5rem", flexShrink: 0,
                    }}>🎬</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#F0F4FF",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {movie.title}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "#8896B8", marginTop: 3 }}>
                      {movie.release_date?.slice(0, 4) || "연도 미상"}
                    </div>
                    {movie.overview && (
                      <div style={{
                        fontSize: "0.82rem", color: "#8896B8", marginTop: 5,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                        lineHeight: 1.5,
                      }}>
                        {movie.overview}
                      </div>
                    )}
                  </div>
                  <div style={{ color: "#4A5578", flexShrink: 0, fontSize: "1.2rem" }}>›</div>
                </button>
              ))}
            </div>

            <button
              className="btn btn-ghost"
              style={{ width: "100%" }}
              onClick={() => setStep(0)}
            >
              다시 검색하기
            </button>
          </div>
        )}

        {/* STEP 2: 확인 */}
        {step === 2 && selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: "1.7rem", fontWeight: 800, margin: "0 0 8px", color: "#F0F4FF" }}>
                이 영화로 추천할까요?
              </h2>
              <p style={{ color: "#8896B8", fontSize: "1rem", margin: 0 }}>
                확인 후 추천 목록에 등록됩니다
              </p>
            </div>

            {/* 포스터 */}
            <div style={{
              position: "relative", borderRadius: 16, overflow: "hidden",
              border: "1px solid var(--c-border)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
            }}>
              {selected.poster_url ? (
                <Image
                  src={selected.poster_url}
                  alt={selected.title}
                  width={180}
                  height={270}
                  style={{ objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{
                  width: 180, height: 270,
                  background: "var(--c-card)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "4rem",
                }}>🎬</div>
              )}
            </div>

            {/* 영화 정보 */}
            <div className="card" style={{ width: "100%", padding: "18px 20px" }}>
              <div style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: 8, color: "#F0F4FF" }}>
                {selected.title}
              </div>
              <div style={{ color: "#8896B8", fontSize: "0.95rem", display: "flex", gap: 14, flexWrap: "wrap" }}>
                <span>🎬 {director || "감독 미상"}</span>
                <span>📅 {selected.release_date?.slice(0, 4) || "?"}</span>
              </div>
              {selected.overview && (
                <div style={{
                  fontSize: "0.9rem", color: "#8896B8",
                  marginTop: 12, lineHeight: 1.65,
                  display: "-webkit-box", WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                }}>
                  {selected.overview}
                </div>
              )}
            </div>

            {error && (
              <div style={{
                width: "100%", padding: "14px 18px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 12, color: "#FCA5A5", fontSize: "0.95rem",
              }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
              <button
                className="btn btn-accent"
                style={{ width: "100%", padding: "18px", fontSize: "1.1rem" }}
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? "등록 중..." : "✅  이 영화로 추천하기"}
              </button>
              <button
                className="btn btn-ghost"
                style={{ width: "100%", padding: "16px" }}
                onClick={() => setStep(0)}
              >
                처음부터 다시 검색
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
