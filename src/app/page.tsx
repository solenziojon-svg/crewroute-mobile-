"use client";

import { useState } from "react";

type Phase = "upload" | "loading" | "result" | "error";
type Mode = "estimate" | "audit";

export default function Home() {
  const = useState<Mode>("estimate");
  const = useState<Phase>("upload");
  const = useState<string>("");
  const = useState<Record<string, unknown>>({});
  const = useState<string>("");

  function handleModeSwitch(newMode: Mode) {
    setMode(newMode);
    setPhase("upload");
    setPreview("");
    setResult({});
    setErrorMsg("");
  }

  function handleReset() {
    setPhase("upload");
    setPreview("");
    setResult({});
    setErrorMsg("");
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setPhase("loading");
    setErrorMsg("");

    const form = new FormData();
    form.append("photo", file);
    form.append("mode", mode);

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? `Server error ${res.status}`);
        setPhase("error");
        return;
      }

      setResult(data);
      setPhase("result");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Request failed");
      setPhase("error");
    }
  }

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0A0C14",
      color: "#E8ECF1",
      fontFamily: "system-ui, sans-serif",
    }}>
      <header style={{
        background: "#11151F",
        padding: "14px 18px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid #1F2635",
      }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>🌿 CrewRoute OS</div>
        <div style={{
          display: "flex",
          background: "#1F2635",
          borderRadius: 8,
          padding: 3,
          gap: 2,
        }}>
          <button
            onClick={() => handleModeSwitch("estimate")}
            style={{
              padding: "7px 14px",
              borderRadius: 6,
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              background: mode === "estimate" ? "#FF6B35" : "transparent",
              color: mode === "estimate" ? "#000" : "#8A95A8",
            }}
          >
            💰 Estimate
          </button>
          <button
            onClick={() => handleModeSwitch("audit")}
            style={{
              padding: "7px 14px",
              borderRadius: 6,
              border: "none",
              fontSize: 12,
              fontWeight: 600,
              background: mode === "audit" ? "#FF6B35" : "transparent",
              color: mode === "audit" ? "#000" : "#8A95A8",
            }}
          >
            ✓ Audit
          </button>
        </div>
      </header>

      <div style={{ padding: "20px 18px", maxWidth: 480, margin: "0 auto" }}>
        {phase === "upload" && (
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
              {mode === "estimate" ? "Yard Estimate" : "Job Audit"}
            </h1>
            <label htmlFor="photo-input">
              <div style={{
                background: "#11151F",
                border: "2px dashed #1F2635",
                borderRadius: 14,
                padding: "52px 20px",
                textAlign: "center",
                cursor: "pointer",
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>Tap to open camera</div>
              </div>
            </label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        )}

        {phase === "loading" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48 }}>🤖</div>
            <p>Analyzing photo...</p>
          </div>
        )}

        {phase === "result" && (
          <div>
            {preview && <img src={preview} alt="preview" style={{ width: "100%", borderRadius: 12, marginBottom: 16 }} />}
            <pre style={{ background: "#111", padding: 16, borderRadius: 12, fontSize: 12, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(result, null, 2)}
            </pre>
            <button onClick={handleReset} style={{
              width: "100%",
              padding: 16,
              background: "#FF6B35",
              color: "black",
              border: "none",
              borderRadius: 12,
              fontWeight: 800,
              marginTop: 12,
            }}>
              New Photo
            </button>
          </div>
        )}

        {phase === "error" && (
          <div>
            <div style={{ color: "#F87171", marginBottom: 12 }}>Error: {errorMsg}</div>
            <button onClick={handleReset} style={{
              width: "100%",
              padding: 16,
              background: "#FF6B35",
              color: "black",
              border: "none",
              borderRadius: 12,
              fontWeight: 800,
            }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}