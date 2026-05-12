"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { registerUser } from "@/services/authService";



export default function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    team: '',

    profile: {
      phone: "",
      address: "",
    },
  });
  // Handlers for top-level and nested state updates
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: value,
      },
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    setIsLoading(true);

    setError(null);

    try {

      await registerUser(formData);

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
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
      </form>
    </div>
  );
}