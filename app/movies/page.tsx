"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function MoviesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab] = useState<"list" | "result">("list");

  const fetchMovies = useCallback(async () => {
    const res = await fetch("/api/movies");
    const data = await res.json();
    setMovies(data.movies || []);
  }, []);

  const fetchMyVotes = useCallback(async (uid: string) => {
    const res = await fetch(`/api/votes?user_id=${uid}`);
    const data = await res.json();
    if (data.votes && data.votes.length > 0) {
      setSelected(new Set(data.votes));
      setHasVoted(true);
    }
  }, []);

  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (!id) {
      router.push("/select-user");
      return;
    }
    setUserId(id);
    Promise.all([fetchMovies(), fetchMyVotes(id)]).finally(() =>
      setLoading(false)
    );
  }, [router, fetchMovies, fetchMyVotes]);

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
    setSubmitting(true);
    try {
      await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, movie_ids: Array.from(selected) }),
      });
      setHasVoted(true);
      await fetchMovies();
      setTab("result");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevote = async () => {
    await fetch(`/api/votes?user_id=${userId}`, { method: "DELETE" });
    setHasVoted(false);
    setSelected(new Set());
    setTab("list");
    await fetchMovies();
  };

  const sortedByVotes = [...movies].sort((a, b) => b.vote_count - a.vote_count);

  if (loading) {
    return (
      <div className="page-container">
        <p className="doodle-title">불러오는 중... 🎬</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* 헤더 */}
      <div
        className="sticky top-0 z-10 p-4 border-b-2 border-[#1a1a1a]"
        style={{ background: "var(--bg)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="doodle-title text-2xl">🎬 영화 선정</h1>
            <p className="doodle-subtitle text-sm">참석자 {userId}</p>
          </div>
          <button
            className="doodle-btn text-sm px-3 py-1"
            onClick={() => router.push("/recommend")}
          >
            + 추천
          </button>
        </div>
        {/* 탭 */}
        <div className="flex gap-2">
          <button
            className={`doodle-btn flex-1 py-2 text-base ${tab === "list" ? "doodle-btn-primary" : ""}`}
            onClick={() => setTab("list")}
          >
            전체 목록
          </button>
          <button
            className={`doodle-btn flex-1 py-2 text-base ${tab === "result" ? "doodle-btn-primary" : ""}`}
            onClick={() => setTab("result")}
          >
            📊 투표 현황
          </button>
        </div>
      </div>

      {/* 전체 목록 탭 */}
      {tab === "list" && (
        <div className="p-4 pb-36">
          {movies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <p className="text-6xl">🎞️</p>
              <p className="doodle-title text-xl text-center">
                아직 추천된 영화가 없어요
              </p>
              <button
                className="doodle-btn doodle-btn-primary px-6 py-2"
                onClick={() => router.push("/recommend")}
              >
                첫 번째로 추천하기!
              </button>
            </div>
          ) : (
            <>
              {!hasVoted && selected.size > 0 && (
                <p className="doodle-subtitle text-center mb-4">
                  {selected.size}편 선택 — 아래 투표하기 버튼을 눌러주세요 👇
                </p>
              )}
              {hasVoted && (
                <p className="text-green-700 doodle-subtitle text-center mb-4">
                  ✅ 투표 완료!
                </p>
              )}
              <div className="grid grid-cols-2 gap-4">
                {movies.map((movie) => {
                  const isSelected = selected.has(movie.id);
                  return (
                    <div
                      key={movie.id}
                      className={`doodle-card relative ${isSelected ? "selected" : ""} ${hasVoted ? "cursor-default" : ""}`}
                      onClick={() => toggleSelect(movie.id)}
                    >
                      <div className="relative aspect-[2/3] w-full">
                        {movie.poster_url ? (
                          <Image
                            src={movie.poster_url}
                            alt={movie.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-amber-100 flex items-center justify-center text-5xl">
                            🎬
                          </div>
                        )}
                        {isSelected && (
                          <div className="check-overlay">
                            <span className="check-mark">✓</span>
                          </div>
                        )}
                        {movie.vote_count > 0 && (
                          <div className="vote-badge">{movie.vote_count}</div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="font-bold text-base leading-tight line-clamp-2">
                          {movie.title}
                        </p>
                        <p className="text-gray-500 text-sm">{movie.director}</p>
                        <p className="text-gray-400 text-xs">추천: {movie.recommended_by}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* 투표 현황 탭 */}
      {tab === "result" && (
        <div className="p-4 pb-36 flex flex-col gap-3">
          <p className="doodle-subtitle text-center mb-2">
            현재 투표 현황 (실시간)
          </p>
          {sortedByVotes.map((movie, idx) => (
            <div key={movie.id} className="doodle-box flex items-center gap-4 p-3">
              {/* 순위 */}
              <div className="text-2xl font-bold w-8 text-center flex-shrink-0">
                {idx === 0 && movie.vote_count > 0 ? "🥇" : idx === 1 && movie.vote_count > 0 ? "🥈" : idx === 2 && movie.vote_count > 0 ? "🥉" : `${idx + 1}`}
              </div>
              {/* 포스터 */}
              {movie.poster_url ? (
                <Image
                  src={movie.poster_url}
                  alt={movie.title}
                  width={48}
                  height={72}
                  className="object-cover rounded flex-shrink-0 border border-[#1a1a1a]"
                />
              ) : (
                <div className="w-12 h-[72px] bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0 rounded border border-[#1a1a1a]">
                  🎬
                </div>
              )}
              {/* 정보 */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base leading-tight line-clamp-1">{movie.title}</p>
                <p className="text-gray-500 text-sm">{movie.director}</p>
              </div>
              {/* 투표 수 */}
              <div className="doodle-box px-3 py-1 text-xl font-bold flex-shrink-0">
                {movie.vote_count}표
              </div>
            </div>
          ))}
          {sortedByVotes.every((m) => m.vote_count === 0) && (
            <p className="text-center doodle-subtitle py-8">아직 투표가 없어요</p>
          )}
        </div>
      )}

      {/* 하단 버튼 */}
      {movies.length > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 p-4 border-t-2 border-[#1a1a1a]"
          style={{ background: "var(--bg)" }}
        >
          {!hasVoted ? (
            <button
              className="doodle-btn doodle-btn-primary w-full py-3 text-xl font-bold"
              onClick={handleVote}
              disabled={submitting || selected.size === 0}
              style={{ opacity: selected.size === 0 ? 0.5 : 1 }}
            >
              {submitting ? "투표 중..." : `🗳️ 투표하기 (${selected.size}편 선택)`}
            </button>
          ) : (
            <button
              className="doodle-btn w-full py-3 text-xl font-bold"
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
