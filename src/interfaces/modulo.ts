export interface Modulo {
  id: number
  titulo: string
  descricao: string
  ordem: number
  ativo: boolean
  createdAt: string
}

export interface ModuloRequest {
  titulo: string
  descricao?: string
  ordem: number
}
