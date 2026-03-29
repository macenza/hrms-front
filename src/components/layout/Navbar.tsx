"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div style={{ padding: "20px", background: "#111", color: "#fff" }}>
      <h2>HRMS</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <Link href="/">Home</Link>
        <Link href="/login">Login</Link>
        <Link href="/signup">Signup</Link>
      </div>
    </div>
  );
}