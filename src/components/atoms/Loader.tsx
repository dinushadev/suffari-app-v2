import React from 'react';

// Modern circular spinner using Tailwind theme colors (orange and ash)
export default function Loader() {
  return (
    <div className="flex items-center justify-center">
      <span className="relative flex h-12 w-12">
      <div className="loader">  <span className="sr-only">Loading...</span></div>
      </span>
    </div>
  );
}