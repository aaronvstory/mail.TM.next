"use client";

import Image from "next/image";

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Image
        src="/icon.svg"
        alt="Logo"
        width={32}
        height={32}
        className="dark:invert"
      />
      <span className="font-bold">TempMail</span>
    </div>
  );
}
