"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalyzeResult } from "@/lib/types";
import { NutrientBreakdownBar } from "./components/NutrientBreakdownBar";
import styles from "./page.module.css";

type Status = "idle" | "loading" | "done" | "error";

const GENERIC_ERROR =
  "No pudimos analizar la imagen. Probá de nuevo en unos segundos.";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);

    const selected = event.target.files?.[0] ?? null;
    const url = selected ? URL.createObjectURL(selected) : null;

    previewUrlRef.current = url;
    setFile(selected);
    setPreviewUrl(url);
    setResult(null);
    setErrorMessage(null);
    setStatus("idle");
  }

  async function handleAnalyze() {
    if (!file) return;

    setStatus("loading");
    setResult(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const message = await response
          .json()
          .then((body) =>
            typeof body?.error === "string" ? body.error : GENERIC_ERROR,
          )
          .catch(() => GENERIC_ERROR);
        setErrorMessage(message);
        setStatus("error");
        return;
      }

      const data: AnalyzeResult = await response.json();
      setResult(data);
      setStatus("done");
    } catch {
      setErrorMessage(GENERIC_ERROR);
      setStatus("error");
    }
  }

  const isLoading = status === "loading";

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Nuevo consumo</h1>
        <p>Elegí una foto del plato para analizarla.</p>

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
          className={styles.fileInput}
        />

        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Vista previa del plato"
            className={styles.preview}
          />
        )}

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!file || isLoading}
          className={styles.analyzeButton}
        >
          {isLoading ? "Analizando..." : "Analizar"}
        </button>

        {isLoading && (
          <div
            className={styles.spinner}
            role="status"
            aria-label="Analizando imagen"
          />
        )}

        {status === "done" && result && (
          <section className={styles.result} aria-label="Resultado del análisis">
            <p className={styles.description}>{result.description}</p>

            <p className={styles.calories}>
              <span className={styles.caloriesValue}>{result.calories}</span>
              <span className={styles.caloriesUnit}>kcal estimadas</span>
            </p>

            <NutrientBreakdownBar breakdown={result.breakdown} />

            <p className={styles.disclaimer}>
              Esta información es una estimación y puede ser inexacta.
            </p>
          </section>
        )}

        {status === "error" && (
          <p className={styles.errorText} role="alert">
            {errorMessage ?? GENERIC_ERROR}
          </p>
        )}
      </main>
    </div>
  );
}
