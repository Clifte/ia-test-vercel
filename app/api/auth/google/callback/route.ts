import { NextResponse } from "next/server"
import { getTokensFromCode, extractSpreadsheetId } from "@/lib/google-sheets"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  if (error) {
    return NextResponse.redirect(`${baseUrl}?error=auth_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}?error=missing_params`)
  }

  try {
    // Decodifica o state para obter a URL da planilha
    const stateData = JSON.parse(Buffer.from(state, "base64").toString())
    const spreadsheetUrl = stateData.spreadsheetUrl
    const spreadsheetId = extractSpreadsheetId(spreadsheetUrl)

    if (!spreadsheetId) {
      return NextResponse.redirect(`${baseUrl}?error=invalid_spreadsheet`)
    }

    // Troca o código por tokens
    const tokens = await getTokensFromCode(code)

    // Salva os tokens e o ID da planilha em cookies HTTP-only
    const cookieStore = await cookies()

    cookieStore.set("google_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
    })

    cookieStore.set("spreadsheet_id", spreadsheetId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      path: "/",
    })

    return NextResponse.redirect(`${baseUrl}?success=connected`)
  } catch (error) {
    console.error("Erro no callback OAuth:", error)
    return NextResponse.redirect(`${baseUrl}?error=auth_failed`)
  }
}
