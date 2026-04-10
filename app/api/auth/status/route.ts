import { NextResponse } from "next/server"
import { isAuthenticated, getSpreadsheetInfo } from "@/lib/google-sheets"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const authenticated = await isAuthenticated()

    if (!authenticated) {
      return NextResponse.json({
        authenticated: false,
        spreadsheet: null,
      })
    }

    const spreadsheetInfo = await getSpreadsheetInfo()

    return NextResponse.json({
      authenticated: true,
      spreadsheet: spreadsheetInfo,
    })
  } catch (error) {
    console.error("Erro ao verificar status:", error)
    return NextResponse.json({
      authenticated: false,
      spreadsheet: null,
    })
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies()
    
    cookieStore.delete("google_tokens")
    cookieStore.delete("spreadsheet_id")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao desconectar:", error)
    return NextResponse.json(
      { error: "Erro ao desconectar" },
      { status: 500 }
    )
  }
}
