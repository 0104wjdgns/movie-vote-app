import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: movies, error } = await supabase
    .from("movies")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 각 영화별 투표 수 집계
  const { data: voteCounts } = await supabase
    .from("votes")
    .select("movie_id");

  const countMap: Record<string, number> = {};
  for (const v of voteCounts ?? []) {
    countMap[v.movie_id] = (countMap[v.movie_id] ?? 0) + 1;
  }

  const moviesWithVotes = (movies ?? []).map((m) => ({
    ...m,
    vote_count: countMap[m.id] ?? 0,
  }));

  return NextResponse.json({ movies: moviesWithVotes });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, director, poster_url, tmdb_id, recommended_by } = body;

  if (!title || !director || !recommended_by) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  // 1인 2편 제한 확인
  const { count } = await supabase
    .from("movies")
    .select("*", { count: "exact", head: true })
    .eq("recommended_by", recommended_by);

  if ((count ?? 0) >= 2) {
    return NextResponse.json(
      { error: "이미 2편을 추천하셨습니다" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("movies")
    .insert({ title, director, poster_url, tmdb_id, recommended_by })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ movie: data });
}
