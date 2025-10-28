export interface User {
  id: string
  nome: string
  email: string
  equipe: string
}

export interface Resposta {
  autor: string
  mensagem: string
  data: string
}

export interface Anexo {
  id: string
  chamado_id: string
  nome_arquivo: string
  tipo_arquivo: string
  tamanho_arquivo: number
  url: string
  usuario_id: string
  data_upload: string
}

export interface Ticket {
  id: string
  nome_solicitante: string
  email_contato: string
  telefone_setor: string
  setor: string
  prioridade: string
  descricao_problema: string
  status: string
  atribuido_a: string | null
  data_criacao: string
  data_atribuicao: string | null
  data_conclusao: string | null
  historico_respostas: Resposta[]
  anexos?: Anexo[]
}
