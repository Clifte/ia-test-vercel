import { google } from "googleapis"
import { cookies } from "next/headers"

// Configuração OAuth2
export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
    : "http://localhost:3000/api/auth/google/callback"

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET não estão configuradas")
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

// Gera URL de autorização
export function getAuthUrl(spreadsheetUrl: string) {
  const oauth2Client = getOAuth2Client()

  const scopes = ["https://www.googleapis.com/auth/spreadsheets"]

  // Codifica a URL da planilha no state para recuperar depois
  const state = Buffer.from(JSON.stringify({ spreadsheetUrl })).toString("base64")

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    state,
    prompt: "consent",
  })
}

// Troca código por tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = getOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

// Extrai o ID da planilha da URL
export function extractSpreadsheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : null
}

// Obtém cliente autenticado a partir dos cookies
export async function getAuthenticatedClient() {
  const cookieStore = await cookies()
  const tokensStr = cookieStore.get("google_tokens")?.value
  const spreadsheetId = cookieStore.get("spreadsheet_id")?.value

  if (!tokensStr || !spreadsheetId) {
    return null
  }

  try {
    const tokens = JSON.parse(tokensStr)
    const oauth2Client = getOAuth2Client()
    oauth2Client.setCredentials(tokens)

    // Verifica se o token expirou e tenta renovar
    if (tokens.expiry_date && tokens.expiry_date < Date.now()) {
      if (tokens.refresh_token) {
        const { credentials } = await oauth2Client.refreshAccessToken()
        oauth2Client.setCredentials(credentials)
        // Atualiza os cookies com novos tokens (será feito na rota)
      } else {
        return null
      }
    }

    return { oauth2Client, spreadsheetId }
  } catch {
    return null
  }
}

// Adiciona ofício na planilha
export async function appendToSheet(data: { data: string; motivo: string }) {
  const authData = await getAuthenticatedClient()

  if (!authData) {
    throw new Error("NOT_AUTHENTICATED")
  }

  const { oauth2Client, spreadsheetId } = authData
  const sheets = google.sheets({ version: "v4", auth: oauth2Client })

  // Primeiro, obtemos o número do próximo ofício
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Oficios!A:A",
  })

  const rows = response.data.values || []
  const lastRow = rows.length
  const currentYear = new Date().getFullYear()

  // Gera o próximo número de ofício no formato: XXX/YYYY
  const nextNumber = lastRow
  const numeroOficio = `${String(nextNumber).padStart(3, "0")}/${currentYear}`

  // Adiciona a nova linha na planilha
  const timestamp = new Date().toLocaleString("pt-BR", { timeZone: "America/Fortaleza" })

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Oficios!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[numeroOficio, data.data, data.motivo, timestamp]],
    },
  })

  return numeroOficio
}

// Busca ofícios da planilha
export async function getOficios() {
  const authData = await getAuthenticatedClient()

  if (!authData) {
    throw new Error("NOT_AUTHENTICATED")
  }

  const { oauth2Client, spreadsheetId } = authData
  const sheets = google.sheets({ version: "v4", auth: oauth2Client })

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Oficios!A:D",
  })

  return response.data.values || []
}

// Verifica se está autenticado
export async function isAuthenticated() {
  const authData = await getAuthenticatedClient()
  return authData !== null
}

// Obtém informações da planilha conectada
export async function getSpreadsheetInfo() {
  const authData = await getAuthenticatedClient()

  if (!authData) {
    return null
  }

  const { oauth2Client, spreadsheetId } = authData
  const sheets = google.sheets({ version: "v4", auth: oauth2Client })

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    return {
      title: response.data.properties?.title,
      spreadsheetId,
    }
  } catch {
    return null
  }
}
