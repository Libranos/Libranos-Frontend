export interface Alternativa {
  id: number
  texto: string
  midiaUrl?: string
  correta: boolean
}

export interface AlternativaRequest {
  texto: string
  midiaUrl?: string
  correta: boolean
}

export interface Atividade {
  id: number
  titulo: string
  descricao?: string
  midiaUrl?: string
  ordem: number
  ativo: boolean
  aulaId: number
  aulaTitulo: string
  alternativas: Alternativa[]
  createdAt: string
}

export interface AtividadeRequest {
  titulo: string
  descricao?: string
  midiaUrl?: string
  ordem: number
  aulaId: number
  alternativas: AlternativaRequest[]
}
