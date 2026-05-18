import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const res = await fetch(
    `https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}&language=ko-KR`,
    { next: { revalidate: 3600 } }
  );
  const data = await res.json();
  const posters = data.results
    .filter((m: { poster_path: string | null }) => m.poster_path)
    .slice(0, 20)
    .map((m: { poster_path: string }) => `https://image.tmdb.org/t/p/w342${m.poster_path}`);

  return NextResponse.json({ posters });
}
