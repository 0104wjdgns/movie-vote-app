"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SearchResult {
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  release_date: string;
}

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
  const [step, setStep] = useState<"input" | "results" | "confirm">("input");

  useEffect(() => {
    const id = localStorage.getItem("user_id");
    if (!id) {
      router.push("/select-user");
      return;
    }
    setUserId(id);
  }, [router]);

  const handleSearch = async () => {
    if (!title.trim()) {
      setError("영화 제목을 입력해주세요");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/search?title=${encodeURIComponent(title)}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setStep("results");
      } else {
        setError("검색 결과가 없습니다. 다른 제목으로 검색해보세요.");
      }
    } catch {
      setError("검색 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (movie: SearchResult) => {
    setSelected(movie);
    setStep("confirm");
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
          director: director.trim() || "미상",
          poster_url: selected.poster_url,
          tmdb_id: selected.tmdb_id,
          recommended_by: userId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "등록 실패");
        return;
      }
      router.push("/movies");
    } catch {
      setError("등록 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="doodle-box max-w-md w-full p-6 flex flex-col gap-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <button
            className="doodle-btn text-sm px-3 py-1"
            onClick={() => {
              if (step === "input") router.push("/movies");
              else if (step === "results") setStep("input");
              else if (step === "confirm") setStep("results");
            }}
          >
            ← 뒤로
          </button>
          <span className="doodle-subtitle text-sm">참석자 {userId}</span>
        </div>

        {/* 입력 단계 */}
        {step === "input" && (
          <>
            <h1 className="doodle-title text-center">🎬 영화 추천</h1>
            <p className="doodle-subtitle text-center text-lg">
              영화 제목과 감독명을 입력해주세요!
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="doodle-subtitle text-base">영화 제목 *</label>
                <input
                  className="doodle-input"
                  placeholder="예) 기생충"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="doodle-subtitle text-base">감독명</label>
                <input
                  className="doodle-input"
                  placeholder="예) 봉준호"
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              {error && <p className="text-red-600 text-center">{error}</p>}
              <button
                className="doodle-btn doodle-btn-primary py-3 text-xl font-bold"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? "검색 중..." : "🔍 검색"}
              </button>
            </div>
          </>
        )}

        {/* 검색 결과 단계 */}
        {step === "results" && (
          <>
            <h1 className="doodle-title text-center">검색 결과</h1>
            <p className="doodle-subtitle text-center">맞는 영화를 선택해주세요!</p>
            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
              {results.map((movie) => (
                <button
                  key={movie.tmdb_id}
                  className="doodle-box flex items-center gap-4 p-3 text-left hover:bg-amber-50 transition-colors"
                  onClick={() => handleSelect(movie)}
                >
                  {movie.poster_url ? (
                    <Image
                      src={movie.poster_url}
                      alt={movie.title}
                      width={50}
                      height={75}
                      className="rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-[50px] h-[75px] bg-gray-200 flex items-center justify-center text-2xl flex-shrink-0 rounded">
                      🎬
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-lg leading-tight">{movie.title}</p>
                    <p className="text-gray-500 text-base">{movie.release_date?.slice(0, 4)}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* 확인 단계 */}
        {step === "confirm" && selected && (
          <>
            <h1 className="doodle-title text-center">이 영화가 맞나요?</h1>
            <div className="flex flex-col items-center gap-4">
              {selected.poster_url ? (
                <Image
                  src={selected.poster_url}
                  alt={selected.title}
                  width={160}
                  height={240}
                  className="doodle-box object-cover"
                />
              ) : (
                <div className="doodle-box w-40 h-60 flex items-center justify-center text-5xl">
                  🎬
                </div>
              )}
              <div className="text-center">
                <p className="font-bold text-2xl">{selected.title}</p>
                <p className="doodle-subtitle">{director || "감독 미입력"}</p>
                <p className="text-gray-400 text-base">{selected.release_date?.slice(0, 4)}</p>
              </div>
            </div>
            {error && <p className="text-red-600 text-center">{error}</p>}
            <div className="flex flex-col gap-3">
              <button
                className="doodle-btn doodle-btn-primary py-3 text-xl font-bold"
                onClick={handleConfirm}
                disabled={submitting}
              >
                {submitting ? "등록 중..." : "✅ 이 영화로 추천!"}
              </button>
              <button
                className="doodle-btn py-2 text-lg"
                onClick={() => setStep("input")}
              >
                🔄 다시 검색
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
