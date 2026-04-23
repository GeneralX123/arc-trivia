import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.xUsername) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { questionId, options } = await req.json();

  const { data: question } = await supabaseAdmin
    .from("questions")
    .select("correct_answer")
    .eq("id", questionId)
    .single();

  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Return 2 wrong option texts to hide
  const wrong = (options as string[]).filter(o => o !== question.correct_answer);
  const toHide = wrong.sort(() => Math.random() - 0.5).slice(0, 2);

  return NextResponse.json({ hide: toHide });
}
