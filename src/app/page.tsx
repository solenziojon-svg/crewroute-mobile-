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
  const = useState<"upload" | "scanning" | "result" | "error">("upload");
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
      const form = new FormData();
      form.append("photo", file);
      form.append("mode", mode);

      const resp = await fetch("/api/analyze", { 
        method: "POST", 
        body: form 
      });

      if (!resp.ok) throw new Error("API request failed");

      const data = await resp.json();
      setResult(data);
      setPhase("result");
    } catch (err) {
      console.error(err);
      setStep("Error occurred");
      setPhase("error");
    }
  }, );

  const reset = () => {
    setPhase("upload");
    setPreview(null);
    setResult(null);
    setStep("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main style={{ background: T.steel, color: T.text, minHeight: "100vh", padding: "20px" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>CrewRoute Mobile</h1>

      {phase === "upload" && (
        <div 
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${T.border}`,
            borderRadius: 16,
            padding: "60px 20px",
            textAlign: "center",
            cursor: "pointer"
          }}
        >
          <div style={{ fontSize: 50, marginBottom: 12 }}>📸</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Tap to take a photo</div>
        </div>
      )}

      {phase === "scanning" && (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48 }}>🤖</div>
          <p>{step}</p>
        </div>
      )}

      {phase === "result" && result && (
        <div>
          {preview && <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 12, marginBottom: 16 }} />}
          <pre style={{ background: "#111", padding: 16, borderRadius: 8, fontSize: 12, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          <button onClick={reset} style={{ marginTop: 16, padding: "12px", background: T.accent, color: "black", border: "none", borderRadius: 8 }}>
            New Photo
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0 0])}
      />
    </main>
  );
}