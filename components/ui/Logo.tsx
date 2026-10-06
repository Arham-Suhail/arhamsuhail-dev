"use client";


export default function Logo() {
  return (
    <video
      src="/arham-wordmark.mp4"
      poster="/arham-wordmark.png"
      autoPlay
      loop
      muted
      playsInline
      className="h-12 w-auto object-contain mix-blend-screen"
    />
  );
}
