"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-gray-50">
      <h2 className="text-xl font-bold text-red-600 mb-4">React Render Crash</h2>
      <div className="bg-white p-6 rounded-lg shadow max-w-2xl w-full text-left overflow-auto border border-red-200">
        <p className="font-mono text-sm font-semibold text-red-800 mb-2">{error.message}</p>
        <pre className="font-mono text-xs text-gray-700 whitespace-pre-wrap">{error.stack}</pre>
      </div>
      <button onClick={() => reset()} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md">
        Try again
      </button>
    </div>
  );
}