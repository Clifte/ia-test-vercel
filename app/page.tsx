"use client"

import { useState, useEffect } from "react"
import {
  FileText,
  Building2,
  KeyRound,
  Mail,
  FolderOpen,
  Settings,
  ExternalLink,
  Link2,
  Unlink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"

interface SpreadsheetInfo {
  title: string
  spreadsheetId: string
}

interface AuthStatus {
  authenticated: boolean
  spreadsheet: SpreadsheetInfo | null
}

export default function SistemaCEFOP() {
  const [dataOficio, setDataOficio] = useState("")
  const [motivoOficio, setMotivoOficio] = useState("")
  const [resultado, setResultado] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Estado para conexão com Google Sheets
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [spreadsheetUrl, setSpreadsheetUrl] = useState("")
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Verifica status de autenticação ao carregar
  useEffect(() => {
    checkAuthStatus()

    // Verifica parâmetros da URL (retorno do OAuth)
    const params = new URLSearchParams(window.location.search)
    if (params.get("success") === "connected") {
      checkAuthStatus()
      // Limpa os parâmetros da URL
      window.history.replaceState({}, "", window.location.pathname)
    } else if (params.get("error")) {
      setResultado("Erro ao conectar com o Google. Tente novamente.")
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  async function checkAuthStatus() {
    setCheckingAuth(true)
    try {
      const response = await fetch("/api/auth/status")
      const data = await response.json()
      setAuthStatus(data)
    } catch {
      setAuthStatus({ authenticated: false, spreadsheet: null })
    } finally {
      setCheckingAuth(false)
    }
  }

  async function handleConnect() {
    if (!spreadsheetUrl.trim()) {
      alert("Cole a URL da planilha do Google Sheets")
      return
    }

    setConnecting(true)
    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spreadsheetUrl }),
      })

      const data = await response.json()

      if (response.ok && data.authUrl) {
        // Redireciona para o Google OAuth
        window.location.href = data.authUrl
      } else {
        alert(data.error || "Erro ao conectar")
      }
    } catch {
      alert("Erro ao conectar. Tente novamente.")
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    try {
      await fetch("/api/auth/status", { method: "DELETE" })
      setAuthStatus({ authenticated: false, spreadsheet: null })
      setResultado(null)
    } catch {
      alert("Erro ao desconectar")
    }
  }

  async function gerarOficio() {
    if (!authStatus?.authenticated) {
      setShowConnectModal(true)
      return
    }

    if (!dataOficio || !motivoOficio) {
      alert("Preencha data e motivo!")
      return
    }

    setLoading(true)
    setResultado("Calculando numero...")

    try {
      const response = await fetch("/api/oficios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: dataOficio,
          motivo: motivoOficio,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResultado(`OFICIO REGISTRADO: ${data.numero}`)
        setMotivoOficio("")
      } else if (data.error === "NOT_AUTHENTICATED") {
        setShowConnectModal(true)
        setResultado(null)
      } else {
        setResultado(`Erro: ${data.error}`)
      }
    } catch {
      setResultado("Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-5">
      {/* Header */}
      <header className="text-center mb-8 p-5 bg-[var(--verde-escuro)] text-white rounded-2xl">
        <h1 className="text-2xl md:text-3xl font-bold">SISTEMA INTEGRADO CEFOP / SEFOR</h1>
        <p className="mt-2 opacity-90">NOSSO NUMERO: 3106-4207</p>

        {/* Status da conexão */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {checkingAuth ? (
            <span className="flex items-center gap-2 text-sm opacity-75">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando conexao...
            </span>
          ) : authStatus?.authenticated ? (
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
              <span className="text-sm">
                Conectado: <strong>{authStatus.spreadsheet?.title}</strong>
              </span>
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-1 px-3 py-1 bg-red-500/80 hover:bg-red-600 rounded text-xs font-medium transition-colors"
              >
                <Unlink className="w-3 h-3" />
                Desconectar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConnectModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              <Link2 className="w-4 h-4" />
              Conectar Planilha Google
            </button>
          )}
        </div>
      </header>

      {/* Modal de Conexão */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--verde-escuro)] mb-4 flex items-center gap-2">
              <Link2 className="w-6 h-6" />
              Conectar Planilha do Google
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              Cole a URL da planilha do Google Sheets que deseja usar para salvar os oficios.
              Voce sera redirecionado para autorizar o acesso.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  A planilha deve ter uma aba chamada <strong>Oficios</strong> com as colunas:
                  Numero, Data, Motivo, Timestamp
                </span>
              </p>
            </div>

            <input
              type="url"
              value={spreadsheetUrl}
              onChange={(e) => setSpreadsheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full p-3 mb-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--verde-botao)]"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 p-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex-1 p-3 bg-[var(--verde-botao)] text-white font-semibold rounded-lg hover:bg-[var(--verde-escuro)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Autorizar Acesso
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {/* Card: Gerador de Ofícios */}
        <Card title="GERADOR DE OFICIOS" icon={<FileText className="w-5 h-5" />}>
          <label className="text-xs font-bold text-[var(--verde-medio)] uppercase">Data do Registro:</label>
          <input
            type="date"
            value={dataOficio}
            onChange={(e) => setDataOficio(e.target.value)}
            className="w-full p-3 mb-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--verde-botao)]"
          />
          <input
            type="text"
            value={motivoOficio}
            onChange={(e) => setMotivoOficio(e.target.value)}
            placeholder="Descreva o motivo/assunto do oficio..."
            className="w-full p-3 mb-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--verde-botao)]"
          />
          <button
            onClick={gerarOficio}
            disabled={loading}
            className="w-full p-3 bg-[var(--verde-botao)] text-white font-semibold rounded-lg hover:bg-[var(--verde-escuro)] transition-colors disabled:opacity-50"
          >
            {loading ? "PROCESSANDO..." : "GERAR E SALVAR NUMERO"}
          </button>
          {resultado && (
            <div
              className={`mt-3 p-4 rounded-lg text-center font-bold border ${
                resultado.includes("REGISTRADO")
                  ? "bg-[#d8f3dc] text-[var(--verde-escuro)] border-[var(--verde-botao)]"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {resultado}
            </div>
          )}
        </Card>

        {/* Card: Acessos Institucionais */}
        <Card title="ACESSOS INSTITUCIONAIS" icon={<Building2 className="w-5 h-5" />}>
          <SectionLabel>PORTAL CEFOP</SectionLabel>
          <ItemDados>
            <Label>PAGINA DE TRABALHO:</Label>
            <a
              href="https://cefop.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--verde-medio)] font-bold hover:underline"
            >
              Abrir cefop.vercel.app
            </a>
          </ItemDados>
          <ItemDados>
            <Label>SENHA DE ACESSO:</Label> 4207
          </ItemDados>

          <SectionLabel className="mt-4">SIC / SEFOR</SectionLabel>
          <ItemDados>
            <Label>SEFOR 1:</Label> Login: sefor01 <br />
            <strong>Senha:</strong> sefor01seducced
          </ItemDados>
          <ItemDados>
            <Label>SEFOR 2:</Label> Login: sefor02 <br />
            <strong>Senha:</strong> sefor02seducced
          </ItemDados>
          <ItemDados>
            <Label>SEFOR 3:</Label> Login: sefor03 <br />
            <strong>Senha:</strong> sefor03seducced
          </ItemDados>
        </Card>

        {/* Card: Contas Master */}
        <Card title="CONTAS MASTER (@prof)" icon={<KeyRound className="w-5 h-5" />}>
          <ItemDados>
            <Label>SEFOR 01:</Label> sefor01-s1@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Sefor2021
          </ItemDados>
          <ItemDados>
            <Label>SEFOR 02:</Label> sefor02-s2@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Sefor2021
          </ItemDados>
          <ItemDados>
            <Label>SEFOR 03:</Label> sefor03-s1@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> SEFOR321
          </ItemDados>
          <ItemDados>
            <Label>FORMACAO:</Label> formacao.sefor@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> cefop2026
          </ItemDados>
          <ItemDados>
            <Label>AGI SEFOR 1:</Label> agisefor1@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
          <ItemDados>
            <Label>AGI SEFOR 3:</Label> agisefor3@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Sefor3@2026
          </ItemDados>
        </Card>

        {/* Card: Emails FOCO */}
        <Card title="EMAILS FOCO E CLUBE DA MATEMATICA" icon={<Mail className="w-5 h-5" />}>
          <ItemDados>
            <Label>FOCO/SEFOR 1:</Label> focoformador.sefor1@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
          <ItemDados>
            <Label>FOCO/SEFOR 2:</Label> focoformador.sefor2@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
          <ItemDados>
            <Label>FOCO/SEFOR 3:</Label> focoformador.sefor3@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
          <ItemDados>
            <Label>CLUBE DA MATEMATICA/SEFOR 1:</Label> bolsistamatsefor1@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
          <ItemDados>
            <Label>CLUBE DA MATEMATICA/SEFOR 2:</Label> bolsistamatsefor2@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
          <ItemDados>
            <Label>CLUBE DA MATEMATICA/SEFOR 3:</Label> bolsistamatsefor3@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
        </Card>

        {/* Card: Repositórios Drive */}
        <Card title="REPOSITORIOS DRIVE" icon={<FolderOpen className="w-5 h-5" />}>
          <LinkButton href="https://drive.google.com/drive/folders/13RmkfrWRlo_yqDZJkMss1GjG9JagPY1N">
            DRIVE GERAL (@prof)
          </LinkButton>
          <LinkButton href="https://drive.google.com/drive/folders/1aEfAD6WV9TbDNsxZktGBL0iqv2b8hm9e">
            PASTA FOCO
          </LinkButton>
          <LinkButton href="https://drive.google.com/drive/folders/1l49zXFDSL6buOqszOJhPzza4sbPJLlWc">
            PASTA FACE
          </LinkButton>
          <LinkButton href="https://drive.google.com/drive/folders/1kRS6L-7feBF1Z1gf0WlnwmZgRpbyGLjX">
            LOGOMARCAS SEDUC
          </LinkButton>
          <LinkButton href="https://docs.google.com/document/d/13yQyBVZH2Dbnb4JLwqZ7UezW8cjRNuCxS3lOcq9rmwA/edit?usp=sharing">
            FAQ
          </LinkButton>
        </Card>

        {/* Card: Acessos e Sistemas */}
        <Card title="ACESSOS E SISTEMAS" icon={<Settings className="w-5 h-5" />}>
          <LinkButton href="https://seloescolasustentavel.seduc.ce.gov.br/">SELO ESCOLA SUSTENTAVEL</LinkButton>
          <LinkButton href="https://atendimento.seduc.ce.gov.br/">ATENDIMENTO ASTIN</LinkButton>
          <ItemDados>
            <Label>SENHAS:</Label> <strong>Zimbra:</strong> Simecdti99# <br />
            <strong>Gmail:</strong> Sefor2023#
          </ItemDados>
          <ItemDados>
            <Label>CEFOP Prof:</Label> cefop.sefor@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Cefop2026#
          </ItemDados>
          <ItemDados>
            <Label>SENHA NOTE NOVO:</Label> 20162022
          </ItemDados>
        </Card>
      </div>
    </div>
  )
}

// Componentes auxiliares
function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border-t-4 border-[var(--verde-medio)]">
      <h3 className="text-[var(--verde-escuro)] m-0 border-b border-gray-200 pb-3 text-sm font-bold uppercase flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </div>
  )
}

function ItemDados({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f8faf9] p-3 rounded-lg mb-2 border-l-4 border-[var(--verde-botao)] text-sm">{children}</div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-bold text-[var(--verde-medio)] block mb-1 uppercase text-xs">{children}</span>
}

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`font-bold text-[var(--verde-medio)] block border-b border-gray-200 mb-2 pb-2 text-xs uppercase ${className}`}
    >
      {children}
    </span>
  )
}

function LinkButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full p-3 mb-2 bg-[var(--verde-botao)] text-white font-semibold rounded-lg hover:bg-[var(--verde-escuro)] transition-colors text-sm"
    >
      {children}
      <ExternalLink className="w-4 h-4" />
    </a>
  )
}
