"use client";

import { useState } from "react";

export default function SignupForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = () => {
    console.log(form);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Signup</h2>

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
      /><br /><br />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      /><br /><br />

      <input
        name="password"
        placeholder="Password"
        type="password"
        onChange={handleChange}
      /><br /><br />

      <button onClick={handleSignup}>Register</button>
    </div>
  );
}