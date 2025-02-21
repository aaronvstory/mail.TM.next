"use client";

import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8">
        <svg viewBox="0 0 24 24" className="w-full h-full text-purple-600">
          <path
            fill="currentColor"
            d="M20,4H4C2.9,4,2,4.9,2,6l0,12c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V6C22,4.9,21.1,4,20,4z M20,8l-8,5L4,8V6l8,5l8-5V8z"
          />
        </svg>
      </div>
      <span className="font-bold text-lg">KoxMail</span>
    </div>
  );
}
