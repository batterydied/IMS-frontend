"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`Logged in as ${data.email}`);
        // Optionally store token: localStorage.setItem("token", data.access_token);
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (error) {
      setMessage("Error connecting to backend");
    }
  };

  return (
    <div className="flex flex-col w-[80%] space-y-4 p-2">
      <input
        placeholder="Email"
        className="input input-no-focus w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        className="input input-no-focus w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-accent p-2 rounded-md hover:bg-accent/80 active:bg-accent/70 text-secondary"
        onClick={handleLogin}
      >
        Login
      </button>
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
