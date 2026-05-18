import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");

  if (!title) {
    return NextResponse.json({ error: "제목을 입력해주세요" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&language=ko-KR&include_adult=false`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "TMDB 검색 실패" }, { status: 500 });
  }

  const data = await res.json();
  const results = data.results.slice(0, 5).map((movie: {
    id: number;
    title: string;
    original_title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
  }) => ({
    tmdb_id: movie.id,
    title: movie.title || movie.original_title,
    poster_url: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    release_date: movie.release_date,
    overview: movie.overview,
  }));

  return NextResponse.json({ results });
}
