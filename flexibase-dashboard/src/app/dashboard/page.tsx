"use client";

import { authApi, dbApi } from "@/api";

import { useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import authimage from "@/assets/auth.png";
import sqlimage from "@/assets/sql.png";
import bucketimage from "@/assets/bucket.png";
import backendimage from "@/assets/backend.png";

import Image from "next/image";

import { Button } from "@/components/ui/button";

const Page = () => {
  const router = useRouter();

  const [usersCount, setUsersCount] = useState(0);
  const [tablesCount, setTablesCount] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem("flexibase-admin-user");
    if (!user) router.replace("/");
  });

  useEffect(() => {
    authApi
      .get("/admin/get-users")
      .then((res) => {
        setUsersCount(res.data.users.length);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    dbApi
      .get("/admin/get-tables")
      .then((res) => {
        setTablesCount(res.data.tables.length);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-center border p-3">
        <span className="font-semibold text-lg">
          Welcome to FlexiBase Dashboard,{" "}
          {process.env.NEXT_PUBLIC_FLEXIBASE_ADMIN_USER} 👋
        </span>
      </div>

      <div className="flex items-center justify-center px-10 space-x-7">
        <p className="w-[550px] font-medium text-lg">
          Flexibase is a Backend-as-a-Service (BaaS) platform designed to
          provide a modular, resource-efficient, and developer-controlled
          alternative to existing solutions like Firebase, Supabase, and
          Appwrite. The primary goal of Flexibase is to give developers full
          control over their backend services while offering a lightweight and
          customizable solution.
        </p>
        <Image src={backendimage} width={400} height={400} alt="" />
      </div>

      <div className="flex items-center justify-center space-x-5 py-10">
        <div className="flex flex-col items-center justify-center border shadow-md rounded-md pt-2 ">
          <div className="flex items-center justify-between w-full px-4">
            <span className="border rounded-md p-2">FlexiBase Auth</span>
            <Button onClick={() => router.push("/dashboard/authentication")}>
              &gt;
            </Button>
          </div>
          <div className="px-10 flex items-center justify-center flex-col pb-4">
            <Image src={authimage} width={200} height={200} alt="" />
            <span className="text-lg font-normal">
              Total Authenticated Users
            </span>
            <p className="text-3xl pt-4 font-medium">{usersCount}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border shadow-md rounded-md pt-2 ">
          <div className="flex items-center justify-between w-full px-4">
            <span className="border rounded-md p-2">FlexiBase DB</span>
            <Button onClick={() => router.push("/dashboard/database")}>
              &gt;
            </Button>
          </div>
          <div className="px-10 flex items-center justify-center flex-col pb-4">
            <Image src={sqlimage} width={200} height={200} alt="" />
            <span className="text-lg font-normal">Total SQL Tables</span>
            <p className="text-3xl pt-4 font-medium">{tablesCount}</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border shadow-md rounded-md pt-2 ">
          <div className="flex items-center justify-between w-full px-4">
            <span className="border rounded-md p-2">FlexiBase Storage</span>
            <Button onClick={() => router.push("/dashboard/storage")}>
              &gt;
            </Button>
          </div>
          <div className="px-10 flex items-center justify-center flex-col pb-4">
            <Image src={bucketimage} width={200} height={200} alt="" />
            <span className="text-lg font-normal">Total Storage Buckets</span>
            <p className="text-3xl pt-4 font-medium">{0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
