export interface Aula {
  id: number
  titulo: string
  descricao: string
  ordem: number
  ativo: boolean
  moduloId: number
  moduloTitulo: string
  createdAt: string
}

export interface AulaRequest {
  titulo: string
  descricao?: string
  ordem: number
  moduloId: number
}
