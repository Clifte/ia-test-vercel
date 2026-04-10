import { NextResponse } from "next/server"
import { appendToSheet, getOficios } from "@/lib/google-sheets"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, motivo } = body

    if (!data || !motivo) {
      return NextResponse.json(
        { error: "Data e motivo são obrigatórios" },
        { status: 400 }
      )
    }

    const numeroOficio = await appendToSheet({ data, motivo })

    return NextResponse.json({
      success: true,
      numero: numeroOficio,
      message: "Ofício registrado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao salvar ofício:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor"

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const oficios = await getOficios()

    return NextResponse.json({
      success: true,
      oficios,
    })
  } catch (error) {
    console.error("Erro ao buscar ofícios:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro interno do servidor"

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
