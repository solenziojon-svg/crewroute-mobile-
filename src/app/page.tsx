"use client";

import { useState, useRef, useCallback } from "react";

const T = {
  steel:  "#0A0C14",
  panel:  "#11151F",
  border: "#1F2635",
  accent: "#FF6B35",
  green:  "#00C853",
  blue:   "#60A5FA",
  text:   "#E8ECF1",
  muted:  "#8A95A8",
};

export default function Home() {
  const = useState<"estimate" | "audit">("estimate");
  const = useState<"upload" | "scanning" | "result">("upload");
  const = useState<string | null>(null);
  const = useState<any>(null);
  const = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setPhase("scanning");
    setStep("Sending to Claude Vision...");

    try {