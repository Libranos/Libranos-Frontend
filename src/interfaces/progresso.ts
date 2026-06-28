export interface ProgressoResponse {
  id: number
  aulaId: number
  aulaTitulo: string
  moduloId: number
  concluidoEm: string
}

export interface ProgressoModuloResponse {
  moduloId: number
  moduloTitulo: string
  totalAulas: number
  aulasConcluidadas: number
  percentualConclusao: number
}
