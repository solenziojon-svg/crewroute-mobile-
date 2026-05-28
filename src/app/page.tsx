"use client";

import { useState } from "react";

export default function Home() {
  const = useState<"estimate" | "audit">("estimate");
  const = useState<"upload" | "loading" | "result" | "error">("upload");
  const = useState<string>("");
  const = useState<any>(null);
  const = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setPhase("loading");

    const form = new FormData();
    form.append("photo", file);
    form.append("mode", mode);

    try {
      const res = await fetch("/api/analyze", { 
        method: "POST", 
        body: form 
      });
      const data = await res.json();
      setResult(data);
      setPhase("result");
    } catch (err) {
      setErrorMsg("Failed to analyze photo");
      setPhase("error");
    }
  };

  return (
    <main style={{ background: "#0A0C14", color: "white", minHeight: "100vh", padding: "20px" }}>
      <h1>CrewRoute Mobile v3</h1>
      
      {phase === "upload" && (
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
        />
      )}

      {phase === "loading" && <p>Analyzing photo...</p>}
      
      {phase === "result" && result && (
        <div>
          {preview && <img src={preview} alt="preview" style={{ width: "100%", borderRadius: "12px" }} />}
          <pre style={{ background: "#111", padding: "15px", marginTop: "10px" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {phase === "error" && <p>Error: {errorMsg}</p>}
    </main>
  );
}