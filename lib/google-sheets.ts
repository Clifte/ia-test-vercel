import { google } from "googleapis"

// Configuração da autenticação com Google Sheets API
function getGoogleSheetsAuth() {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_KEY

  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY não está configurada")
  }

  const parsedCredentials = JSON.parse(credentials)

  const auth = new google.auth.GoogleAuth({
    credentials: parsedCredentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  return auth
}

export async function appendToSheet(data: { data: string; motivo: string }) {
  const auth = getGoogleSheetsAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SPREADSHEET_ID não está configurada")
  }

  // Primeiro, obtemos o número do próximo ofício
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Oficios!A:A", // Coluna com os números dos ofícios
  })

  const rows = response.data.values || []
  const lastRow = rows.length
  const currentYear = new Date().getFullYear()

  // Gera o próximo número de ofício no formato: XXX/YYYY
  const nextNumber = lastRow // lastRow já inclui o header, então é o próximo número
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

export async function getOficios() {
  const auth = getGoogleSheetsAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID

  if (!spreadsheetId) {
    throw new Error("GOOGLE_SPREADSHEET_ID não está configurada")
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Oficios!A:D",
  })

  return response.data.values || []
}
