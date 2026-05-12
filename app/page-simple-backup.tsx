"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function HomePage() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    setMessage("Welcome to Mosam.ai - Weather Prediction Platform");
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-6">
          Mosam.ai
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          {message}
        </p>
        <div className="space-y-4">
          <Link 
            href="/signup" 
            className="inline-block bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Create Free Account
          </Link>
          <br />
          <Link 
            href="/login" 
            className="inline-block bg-gray-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Login to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
