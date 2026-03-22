"use client";

import LoginCard from "@/components/custom/LoginCard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("flexibase-admin-user");
    if (user) router.replace("/dashboard");
  });

  return (
    <div className="flex items-center justify-center h-screen">
      <LoginCard />
    </div>
  );
};

export default Home;
