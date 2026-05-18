"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="page-container">
      <div className="doodle-box max-w-md w-full p-8 text-center flex flex-col gap-8">
        {/* 장식 요소 */}
        <div className="text-4xl">🎬</div>

        <div className="flex flex-col gap-4">
          <h1 className="doodle-title">
            안녕하세요!
          </h1>
          <p className="doodle-subtitle leading-relaxed">
            타우마제인 리더스클럽<br />
            <span className="doodle-underline font-bold">공동선</span>을 주제로 한<br />
            영화 선정 페이지입니다!
          </p>
        </div>

        <div className="text-3xl">✏️ 📽️ 🍿</div>

        <button
          className="doodle-btn doodle-btn-primary w-full py-3 text-xl font-bold"
          onClick={() => router.push("/select-user")}
        >
          계속 →
        </button>
      </div>
    </div>
  );
}
