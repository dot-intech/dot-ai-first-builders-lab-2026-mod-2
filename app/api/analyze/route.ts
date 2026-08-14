import { NextResponse } from "next/server";
import { analyzeImage } from "@/lib/gemini";

// RNF-07: la imagen se procesa en memoria y nunca se persiste a disco ni a base de datos.
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Falta la imagen a analizar." },
      { status: 400 },
    );
  }

  const image = formData.get("image");

  if (!(image instanceof File) || !image.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "Falta la imagen a analizar." },
      { status: 400 },
    );
  }

  const imageBytes = Buffer.from(await image.arrayBuffer());

  try {
    const result = await analyzeImage(imageBytes, image.type);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al analizar la imagen con el modelo de visión:", error);
    return NextResponse.json(
      { error: "No pudimos analizar la imagen. Probá de nuevo en unos segundos." },
      { status: 502 },
    );
  }
}
