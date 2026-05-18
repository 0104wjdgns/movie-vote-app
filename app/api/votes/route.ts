import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "user_id 필요" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("votes")
    .select("movie_id")
    .eq("user_id", user_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ votes: data.map((v) => v.movie_id) });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user_id, movie_ids } = body;

  if (!user_id || !Array.isArray(movie_ids)) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  // 기존 투표 삭제 (재투표 지원)
  await supabase.from("votes").delete().eq("user_id", user_id);

  if (movie_ids.length === 0) {
    return NextResponse.json({ success: true });
  }

  const rows = movie_ids.map((movie_id: string) => ({ user_id, movie_id }));
  const { error } = await supabase.from("votes").insert(rows);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");

  if (!user_id) {
    return NextResponse.json({ error: "user_id 필요" }, { status: 400 });
  }

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("user_id", user_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
