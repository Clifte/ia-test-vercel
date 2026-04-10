import { NextResponse } from "next/server"
import { getAuthUrl, extractSpreadsheetId } from "@/lib/google-sheets"

export async function POST(request: Request) {
  try {
    const { spreadsheetUrl } = await request.json()

    if (!spreadsheetUrl) {
      return NextResponse.json(
        { error: "URL da planilha é obrigatória" },
        { status: 400 }
      )
    }

    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "URL da planilha inválida. Use o formato: https://docs.google.com/spreadsheets/d/{ID}/edit" },
        { status: 400 }
      )
    }

    const authUrl = getAuthUrl(spreadsheetUrl)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error("Erro ao gerar URL de autenticação:", error)
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    )
  }
}
