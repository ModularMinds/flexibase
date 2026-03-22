"use client";

import { authApi } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";

const LoginCard = () => {
  const router = useRouter();

  const [adminCredentials, setAdminCredentials] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAdminCredentials({
      ...adminCredentials,
      [e.target.name]: e.target.value,
    });
  };

  const onSignInClicked = async () => {
    const { username, password } = adminCredentials;

    try {
      // The auth service expects 'email' and 'password' for sign-in.
      // If the dashboard uses 'username' as email, mapping it here.
      const res = await authApi.post("/sign-in", {
        email: username,
        password: password,
      });

      if (res.status === 200) {
        const { accessToken, refreshToken, user } = res.data;
        // Check if user is admin
        if (user.role !== "ADMIN") {
          alert("Access Denied: Admin privileges required.");
          return;
        }

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));

        // Also set the username for legacy/display compatibility if needed
        localStorage.setItem("flexibase-admin-user", user.name || username);

        router.replace("/dashboard");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      alert(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  return (
    <Card className="w-[350px] bg-white">
      <CardHeader>
        <CardTitle className="text-center pb-5">FlexiBase</CardTitle>
        <CardDescription>
          Manage all your self-hosted services at one place.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                value={adminCredentials.username}
                type="text"
                id="username"
                placeholder="Enter your Admin username"
                onChange={handleChange}
                name="username"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                value={adminCredentials.password}
                type="password"
                id="password"
                placeholder="Enter your Admin password"
                onChange={handleChange}
                name="password"
              />
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Button onClick={onSignInClicked}>Sign In</Button>
      </CardFooter>
    </Card>
  );
};

export default LoginCard;
