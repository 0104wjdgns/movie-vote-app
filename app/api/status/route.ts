import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ALL_USERS = ["김태상님", "김가람님", "이환규님", "서재은님", "송정훈님"];

export async function GET() {
  const { data: votes } = await supabase
    .from("votes")
    .select("user_id");

  const voters = [...new Set((votes ?? []).map((v) => v.user_id))];
  const notVoted = ALL_USERS.filter((u) => !voters.includes(u));

  const { data: movies } = await supabase
    .from("movies")
    .select("recommended_by");

  const recommenders = [...new Set((movies ?? []).map((m) => m.recommended_by))];

  return NextResponse.json({
    voters,
    notVoted,
    recommenders,
    totalVotes: votes?.length ?? 0,
    totalMovies: movies?.length ?? 0,
  });
}
