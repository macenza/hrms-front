"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { registerUser } from "@/services/authService";

export default function SignupForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    team: "",
    profile: {
      phone: "",
      address: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // handle change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // profile change
  const handleProfileChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      profile: { ...prev.profile, [name]: value },
    }));
  };

  // submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        team: formData.team,
        profile: {
          phone: formData.profile.phone,
          address: formData.profile.address,
        },
      });

      alert("Signup successful ✅");
      router.push("/dashboard");

    } catch (err: any) {
      setError(err.message || "Signup failed ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl border border-gray-100">
      
      {/* Heading */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">Get Started</h1>
        <p className="text-sm text-gray-500 mt-2">
          Create your HRMS account
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Name */}
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
        />

        {/* Email */}
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />

        {/* Phone */}
        <Input
          name="phone"
          value={formData.profile.phone}
          onChange={handleProfileChange}
          placeholder="Phone"
        />

        {/* Role */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border"
        >
          <option value="Employee">Employee</option>
          <option value="HR">HR</option>
          <option value="Admin">Admin</option>
        </select>

        {/* Team */}
        <Input
          name="team"
          value={formData.team}
          onChange={handleChange}
          placeholder="Team"
        />

        {/* Address */}
        <Input
          name="address"
          value={formData.profile.address}
          onChange={handleProfileChange}
          placeholder="Address"
        />

        {/* Password */}
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />

        {/* Button */}
        <Button className="w-full py-3" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Account"}
        </Button>
      </form>

      {/* Link */}
      <p className="text-center text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 font-bold">
          Sign In
        </Link>
      </p>
    </div>
  );
}