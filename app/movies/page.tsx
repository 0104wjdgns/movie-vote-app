"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Movie {
  id: string;
  title: string;
  director: string;
  poster_url: string | null;
  recommended_by: string;
  vote_count: number;
}

interface Status {
  voters: string[];
  notVoted: string[];
  recommenders: string[];
  totalVotes: number;
  totalMovies: number;
}

const ALL_USERS = ["A", "B", "C", "D", "E"];
const USER_EMOJI: Record<string, string> = { A: "🦁", B: "🐯", C: "🦊", D: "🐻", E: "🐺" };
const USER_COLOR: Record<string, string> = {
  A: "#EF4444", B: "#F59E0B", C: "#8B5CF6", D: "#22C55E", E: "#3B82F6",
};

type Tab = "movies" | "results" | "mine";

export default function MoviesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<Tab>("movies");
  const [toast, setToast] = useState("");
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  };

  const fetchAll = useCallback(async (uid: string) => {
    const [moviesRes, votesRes, statusRes] = await Promise.all([
      fetch("/api/movies"),
      fetch(`/api/votes?user_id=${uid}`),
      fetch("/api/status"),
    ]);
    const [moviesData, votesData, statusData] = await Promise.all([
      moviesRes.json(),
      votesRes.json(),
      statusRes.json(),
    ]);
    setMovies(moviesData.movies || []);
    setStatus(statusData);
    if (votesData.votes?.length > 0) {
      setSelected(new Set(votesData.votes));
      setHasVoted(true);
    }
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (!id) { router.push("/select-user"); return; }
    setUserId(id);
    fetchAll(id).finally(() => setLoading(false));
  }, [router, fetchAll]);

  const toggleSelect = (movieId: string) => {
    if (hasVoted) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) next.delete(movieId);
      else next.add(movieId);
      return next;
    });
  };

  const handleVote = async () => {
    if (selected.size === 0) { showToast("영화를 1편 이상 선택해주세요"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, movie_ids: Array.from(selected) }),
      });
      if (res.ok) {
        setHasVoted(true);
        await fetchAll(userId);
        setTab("results");
        showToast("🗳 투표 완료!");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevote = async () => {
    await fetch(`/api/votes?user_id=${userId}`, { method: "DELETE" });
    setHasVoted(false);
    setSelected(new Set());
    await fetchAll(userId);
    setTab("movies");
    showToast("재투표 모드로 전환됐어요");
  };

  const maxVotes = Math.max(...movies.map((m) => m.vote_count), 1);
  const sortedMovies = [...movies].sort((a, b) => b.vote_count - a.vote_count);
  const myMovies = movies.filter((m) => m.recommended_by === userId);
  const myVotedMovies = movies.filter((m) => selected.has(m.id));

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#07090F",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: 16,
      }}>
        <div style={{ fontSize: "2.5rem" }}>🎬</div>
        <p style={{ color: "#8896B8" }}>불러오는 중...</p>
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#7C3AED",
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100%{opacity:0.3}50%{opacity:1} }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#07090F", paddingBottom: 80 }}>

      {/* 토스트 */}
      {toast && <div className="toast">{toast}</div>}

      {/* 영화 상세 모달 */}
      {detailMovie && (
        <div className="modal-backdrop" onClick={() => setDetailMovie(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
              {detailMovie.poster_url ? (
                <Image
                  src={detailMovie.poster_url}
                  alt={detailMovie.title}
                  width={80}
                  height={120}
                  style={{ borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 80, height: 120, background: "var(--c-card)",
                  borderRadius: 10, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "2rem", flexShrink: 0,
                }}>🎬</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: 6 }}>
                  {detailMovie.title}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#8896B8", marginBottom: 8 }}>
                  🎬 {detailMovie.director}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span className="tag tag-primary">추천: {detailMovie.recommended_by}</span>
                  {detailMovie.vote_count > 0 && (
                    <span className="tag tag-accent">{detailMovie.vote_count}표</span>
                  )}
                </div>
              </div>
            </div>
            <button
              className="btn btn-ghost"
              style={{ width: "100%" }}
              onClick={() => setDetailMovie(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div style={{
        padding: "20px 20px 16px",
        background: "#0D1020",
        borderBottom: "1px solid #1F2B45",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>🎬 영화 선정</h1>
            <div style={{ fontSize: "0.78rem", color: "#8896B8", marginTop: 2 }}>
              참석자 {userId} {USER_EMOJI[userId]}
            </div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ padding: "8px 14px", fontSize: "0.85rem", borderRadius: 10 }}
            onClick={() => router.push("/recommend")}
          >
            + 추천
          </button>
        </div>

        {/* 참여자 투표 현황 */}
        {status && (
          <div style={{
            background: "var(--c-card)",
            borderRadius: 12, padding: "12px 14px",
            border: "1px solid #1F2B45",
          }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8896B8",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              투표 현황 — {status.voters.length}/5명 완료
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {ALL_USERS.map((u) => (
                <div key={u} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div
                    className={`participant-badge ${status.voters.includes(u) ? "voted" : "not-voted"}`}
                    style={u === userId ? { borderColor: USER_COLOR[u], color: USER_COLOR[u],
                      background: `${USER_COLOR[u]}20` } : {}}
                  >
                    {status.voters.includes(u) ? "✓" : u}
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "#8896B8" }}>{USER_EMOJI[u]}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 탭 */}
      <div style={{
        display: "flex",
        background: "#0D1020",
        borderBottom: "1px solid #1F2B45",
      }}>
        {[
          { key: "movies" as Tab, label: "영화 목록", icon: "🎞" },
          { key: "results" as Tab, label: "투표 결과", icon: "📊" },
          { key: "mine" as Tab, label: "내 활동", icon: "👤" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: "12px 0",
              background: "none", border: "none",
              borderBottom: tab === t.key ? "2px solid #F59E0B" : "2px solid transparent",
              color: tab === t.key ? "#F59E0B" : "#8896B8",
              fontWeight: tab === t.key ? 700 : 500,
              fontSize: "0.8rem", cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: 영화 목록 ── */}
      {tab === "movies" && (
        <div style={{ padding: "16px 16px 100px" }}>
          {movies.length === 0 ? (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "60px 20px", gap: 16,
            }}>
              <div style={{ fontSize: "3.5rem" }}>🎞️</div>
              <p style={{ fontWeight: 700, fontSize: "1.1rem", textAlign: "center" }}>
                아직 추천된 영화가 없어요
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/recommend")}
              >
                첫 번째로 추천하기
              </button>
            </div>
          ) : (
            <>
              {!hasVoted && (
                <div style={{
                  padding: "10px 14px", background: "rgba(124,58,237,0.1)",
                  border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10,
                  fontSize: "0.85rem", color: "#A78BFA", marginBottom: 14,
                }}>
                  {selected.size === 0
                    ? "👆 포스터를 눌러 투표할 영화를 선택하세요 (복수 선택 가능)"
                    : `✅ ${selected.size}편 선택됨 — 아래 투표하기 버튼을 눌러주세요`}
                </div>
              )}
              {hasVoted && (
                <div style={{
                  padding: "10px 14px", background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)", borderRadius: 10,
                  fontSize: "0.85rem", color: "#22C55E", marginBottom: 14,
                }}>
                  ✅ 투표 완료! 변경하려면 하단 재투표하기 버튼을 누르세요
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {movies.map((movie) => {
                  const isSelected = selected.has(movie.id);
                  return (
                    <div
                      key={movie.id}
                      className={`movie-card ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleSelect(movie.id)}
                      onContextMenu={(e) => { e.preventDefault(); setDetailMovie(movie); }}
                    >
                      <div style={{ position: "relative", paddingTop: "150%" }}>
                        {movie.poster_url ? (
                          <Image
                            src={movie.poster_url}
                            alt={movie.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div style={{
                            position: "absolute", inset: 0,
                            background: "var(--c-card)",
                            display: "flex", alignItems: "center",
                            justifyContent: "center", fontSize: "3rem",
                          }}>🎬</div>
                        )}
                        <div className="poster-overlay" />
                        {/* 정보 */}
                        <div className="poster-info">
                          <div style={{
                            fontWeight: 700, fontSize: "0.8rem",
                            color: "white", lineHeight: 1.3,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                          }}>
                            {movie.title}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                            {movie.director}
                          </div>
                        </div>
                        {/* 투표 수 */}
                        {movie.vote_count > 0 && (
                          <div className="vote-badge">{movie.vote_count}표</div>
                        )}
                        {/* 추천자 */}
                        <div style={{
                          position: "absolute", top: 6, right: 6,
                          background: `${USER_COLOR[movie.recommended_by]}CC`,
                          color: "white", fontSize: "0.65rem", fontWeight: 700,
                          padding: "2px 7px", borderRadius: 99,
                        }}>
                          {movie.recommended_by}
                        </div>
                        {/* 선택 오버레이 */}
                        {isSelected && (
                          <div className="check-badge">
                            <div style={{
                              fontSize: "2.5rem",
                              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                            }}>✓</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: "0.72rem", color: "#8896B8", textAlign: "center", marginTop: 14 }}>
                💡 길게 누르면 영화 상세 정보를 볼 수 있어요
              </p>
            </>
          )}
        </div>
      )}

      {/* ── TAB: 투표 결과 ── */}
      {tab === "results" && (
        <div style={{ padding: "20px 16px 100px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>
              실시간 투표 현황
            </div>
            <button
              className="btn btn-ghost"
              style={{ padding: "6px 12px", fontSize: "0.78rem", borderRadius: 8 }}
              onClick={() => fetchAll(userId)}
            >
              🔄 새로고침
            </button>
          </div>

          {sortedMovies.length === 0 ? (
            <p style={{ color: "#8896B8", textAlign: "center", padding: "40px 0" }}>
              아직 추천된 영화가 없어요
            </p>
          ) : (
            sortedMovies.map((movie, idx) => (
              <div key={movie.id} className="card" style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  {/* 순위 */}
                  <div style={{ fontSize: "1.4rem", width: 32, textAlign: "center", flexShrink: 0 }}>
                    {idx === 0 && movie.vote_count > 0 ? "🥇"
                      : idx === 1 && movie.vote_count > 0 ? "🥈"
                        : idx === 2 && movie.vote_count > 0 ? "🥉"
                          : `${idx + 1}`}
                  </div>
                  {/* 포스터 */}
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      width={40}
                      height={60}
                      style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: 40, height: 60, background: "#1F2B45",
                      borderRadius: 6, display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: "1.2rem", flexShrink: 0,
                    }}>🎬</div>
                  )}
                  {/* 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 700, fontSize: "0.95rem",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {movie.title}
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "#8896B8" }}>
                      {movie.director}
                    </div>
                  </div>
                  {/* 투표 수 */}
                  <div style={{
                    fontWeight: 800, fontSize: "1.1rem",
                    color: movie.vote_count > 0 ? "#F59E0B" : "#8896B8",
                    flexShrink: 0,
                  }}>
                    {movie.vote_count}<span style={{ fontSize: "0.7rem", fontWeight: 500 }}>표</span>
                  </div>
                </div>
                {/* 막대 그래프 */}
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(movie.vote_count / maxVotes) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}

          {/* 전체 통계 */}
          {status && (
            <div className="card" style={{ padding: "14px 16px", marginTop: 8 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>전체 통계</div>
              <div style={{ display: "flex", gap: 0 }}>
                {[
                  { label: "추천 영화", value: status.totalMovies },
                  { label: "총 투표 수", value: status.totalVotes },
                  { label: "참여자 수", value: `${status.voters.length}/5` },
                ].map((stat, i) => (
                  <div key={i} style={{
                    flex: 1, textAlign: "center",
                    borderRight: i < 2 ? "1px solid #1F2B45" : "none",
                  }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#F59E0B" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#8896B8" }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: 내 활동 ── */}
      {tab === "mine" && (
        <div style={{ padding: "20px 16px 100px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 내 추천 */}
          <div>
            <div className="section-label" style={{ marginBottom: 10 }}>내가 추천한 영화</div>
            {myMovies.length === 0 ? (
              <div className="card" style={{ padding: "20px", textAlign: "center" }}>
                <p style={{ color: "#8896B8", marginBottom: 12 }}>아직 추천한 영화가 없어요</p>
                <button className="btn btn-primary" onClick={() => router.push("/recommend")}>
                  영화 추천하기
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myMovies.map((movie) => (
                  <div key={movie.id} className="card" style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  }}>
                    {movie.poster_url ? (
                      <Image src={movie.poster_url} alt={movie.title} width={40} height={60}
                        style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 40, height: 60, background: "#1F2B45",
                        borderRadius: 6, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>🎬</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{movie.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "#8896B8" }}>{movie.director}</div>
                    </div>
                    {movie.vote_count > 0 && (
                      <span className="tag tag-accent">{movie.vote_count}표</span>
                    )}
                  </div>
                ))}
                {myMovies.length < 2 && (
                  <button className="btn btn-ghost" onClick={() => router.push("/recommend")}>
                    + 영화 추가 추천 ({2 - myMovies.length}편 남음)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 내 투표 */}
          <div>
            <div className="section-label" style={{ marginBottom: 10 }}>내가 투표한 영화</div>
            {!hasVoted ? (
              <div className="card" style={{ padding: "20px", textAlign: "center" }}>
                <p style={{ color: "#8896B8", marginBottom: 12 }}>아직 투표하지 않았어요</p>
                <button className="btn btn-accent" onClick={() => setTab("movies")}>
                  투표하러 가기
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {myVotedMovies.map((movie) => (
                  <div key={movie.id} className="card" style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                    borderColor: "rgba(245,158,11,0.3)",
                  }}>
                    {movie.poster_url ? (
                      <Image src={movie.poster_url} alt={movie.title} width={40} height={60}
                        style={{ borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 40, height: 60, background: "#1F2B45",
                        borderRadius: 6, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>🎬</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{movie.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "#8896B8" }}>{movie.director}</div>
                    </div>
                    <span style={{ fontSize: "1.2rem" }}>✓</span>
                  </div>
                ))}
                <button className="btn btn-danger" onClick={handleRevote}>
                  🔄 재투표하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 바텀 네비게이션 */}
      <div className="bottom-nav">
        {([
          { key: "movies" as Tab, label: "영화 목록", icon: "🎞" },
          { key: "results" as Tab, label: "투표 결과", icon: "📊" },
          { key: "mine" as Tab, label: "내 활동", icon: "👤" },
        ] as const).map((t) => (
          <button
            key={t.key}
            className={`bottom-nav-item ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            <span className="nav-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* 투표 하단 버튼 (영화목록 탭에서만) */}
      {tab === "movies" && movies.length > 0 && (
        <div style={{
          position: "fixed", bottom: 64, left: 0, right: 0,
          padding: "10px 16px",
          background: "rgba(8,12,22,0.85)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid #1F2B45",
        }}>
          {!hasVoted ? (
            <button
              className="btn btn-accent"
              style={{ width: "100%", padding: "14px", fontSize: "1rem" }}
              onClick={handleVote}
              disabled={submitting || selected.size === 0}
            >
              {submitting ? "투표 중..." : `🗳  투표하기${selected.size > 0 ? ` (${selected.size}편 선택)` : ""}`}
            </button>
          ) : (
            <button
              className="btn btn-ghost"
              style={{ width: "100%", padding: "12px" }}
              onClick={handleRevote}
            >
              🔄 재투표하기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
