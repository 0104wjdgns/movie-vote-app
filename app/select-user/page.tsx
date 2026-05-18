"use client";

import { useRouter } from "next/navigation";

const USERS = ["A", "B", "C", "D", "E"];

export default function SelectUserPage() {
  const router = useRouter();

  const handleSelect = (user: string) => {
    localStorage.setItem("user_id", user);
    router.push("/movies");
  };

  return (
    <div className="page-container">
      <div className="doodle-box max-w-sm w-full p-8 text-center flex flex-col gap-8">
        <div className="text-4xl">👋</div>

        <h1 className="doodle-title">나는 누구인가요?</h1>

        <div className="flex flex-col gap-3">
          {USERS.map((user) => (
            <button
              key={user}
              className="doodle-btn text-2xl font-bold py-3"
              onClick={() => handleSelect(user)}
            >
              참석자 {user}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
