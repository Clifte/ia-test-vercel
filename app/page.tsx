"use client"

import { useState } from "react"
import { FileText, Building2, KeyRound, Mail, FolderOpen, Settings, ExternalLink } from "lucide-react"

export default function SistemaCEFOP() {
  const [dataOficio, setDataOficio] = useState("")
  const [motivoOficio, setMotivoOficio] = useState("")
  const [resultado, setResultado] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function gerarOficio() {
    if (!dataOficio || !motivoOficio) {
      alert("Preencha data e motivo!")
      return
    }

    setLoading(true)
    setResultado("Calculando número...")

    try {
      const response = await fetch("/api/oficios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: dataOficio,
          motivo: motivoOficio,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResultado(`✅ OFÍCIO REGISTRADO: ${data.numero}`)
        setMotivoOficio("")
      } else {
        setResultado(`❌ Erro: ${data.error}`)
      }
    } catch (error) {
      setResultado("❌ Erro ao conectar com o servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-5">
      {/* Header */}
      <header className="text-center mb-8 p-5 bg-[var(--verde-escuro)] text-white rounded-2xl">
        <h1 className="text-2xl md:text-3xl font-bold">SISTEMA INTEGRADO CEFOP / SEFOR</h1>
        <p className="mt-2 opacity-90">NOSSO NÚMERO: 3106-4207</p>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto">
        {/* Card: Gerador de Ofícios */}
        <Card title="GERADOR DE OFÍCIOS" icon={<FileText className="w-5 h-5" />}>
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
            placeholder="Descreva o motivo/assunto do ofício..."
            className="w-full p-3 mb-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--verde-botao)]"
          />
          <button
            onClick={gerarOficio}
            disabled={loading}
            className="w-full p-3 bg-[var(--verde-botao)] text-white font-semibold rounded-lg hover:bg-[var(--verde-escuro)] transition-colors disabled:opacity-50"
          >
            {loading ? "PROCESSANDO..." : "GERAR E SALVAR NÚMERO"}
          </button>
          {resultado && (
            <div className="mt-3 p-4 bg-[#d8f3dc] rounded-lg text-center font-bold text-[var(--verde-escuro)] border border-[var(--verde-botao)]">
              {resultado}
            </div>
          )}
        </Card>

        {/* Card: Acessos Institucionais */}
        <Card title="ACESSOS INSTITUCIONAIS" icon={<Building2 className="w-5 h-5" />}>
          <SectionLabel>🌐 PORTAL CEFOP</SectionLabel>
          <ItemDados>
            <Label>PÁGINA DE TRABALHO:</Label>
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

          <SectionLabel className="mt-4">💼 SIC / SEFOR</SectionLabel>
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
            <Label>FORMAÇÃO:</Label> formacao.sefor@prof.ce.gov.br
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
        <Card title="EMAILS FOCO E CLUBE DA MATEMÁTICA" icon={<Mail className="w-5 h-5" />}>
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
            <Label>CLUBE DA MATEMÁTICA/SEFOR 1:</Label> bolsistamatsefor1@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
          <ItemDados>
            <Label>CLUBE DA MATEMÁTICA/SEFOR 2:</Label> bolsistamatsefor2@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
          <ItemDados>
            <Label>CLUBE DA MATEMÁTICA/SEFOR 3:</Label> bolsistamatsefor3@prof.ce.gov.br
            <br />
            <strong>Senha:</strong> Seduc2026
          </ItemDados>
        </Card>

        {/* Card: Repositórios Drive */}
        <Card title="REPOSITÓRIOS DRIVE" icon={<FolderOpen className="w-5 h-5" />}>
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
          <LinkButton href="https://seloescolasustentavel.seduc.ce.gov.br/">SELO ESCOLA SUSTENTÁVEL</LinkButton>
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
  return (
    <span className="font-bold text-[var(--verde-medio)] block mb-1 uppercase text-xs">{children}</span>
  )
}

function SectionLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`font-bold text-[var(--verde-medio)] block border-b border-gray-200 mb-2 pb-2 text-xs uppercase ${className}`}>
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
