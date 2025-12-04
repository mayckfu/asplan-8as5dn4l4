// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5'
  }
  public: {
    Tables: {
      anexos: {
        Row: {
          created_at: string | null
          data_documento: string | null
          emenda_id: string
          filename: string
          id: string
          metadata: Json | null
          size: number | null
          tipo: string
          uploader: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          data_documento?: string | null
          emenda_id: string
          filename: string
          id?: string
          metadata?: Json | null
          size?: number | null
          tipo: string
          uploader?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          data_documento?: string | null
          emenda_id?: string
          filename?: string
          id?: string
          metadata?: Json | null
          size?: number | null
          tipo?: string
          uploader?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: 'anexos_emenda_id_fkey'
            columns: ['emenda_id']
            isOneToOne: false
            referencedRelation: 'emendas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'anexos_uploader_fkey'
            columns: ['uploader']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'audit_logs_changed_by_fkey'
            columns: ['changed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      backup_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          initiated_by: string | null
          size: string | null
          status: string
          type: string
          url: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          initiated_by?: string | null
          size?: string | null
          status: string
          type: string
          url?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          initiated_by?: string | null
          size?: string | null
          status?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'backup_logs_initiated_by_fkey'
            columns: ['initiated_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      cargos: {
        Row: {
          active: boolean | null
          created_at: string | null
          default_role: Database['public']['Enums']['user_role'] | null
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          default_role?: Database['public']['Enums']['user_role'] | null
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          default_role?: Database['public']['Enums']['user_role'] | null
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          autorizada_por: string | null
          categoria: string | null
          created_at: string | null
          data: string
          demanda: string | null
          descricao: string
          emenda_id: string
          fornecedor_nome: string | null
          id: string
          nota_fiscal_url: string | null
          registrada_por: string | null
          responsavel_execucao: string | null
          status_execucao: string
          unidade_destino: string | null
          valor: number
        }
        Insert: {
          autorizada_por?: string | null
          categoria?: string | null
          created_at?: string | null
          data: string
          demanda?: string | null
          descricao: string
          emenda_id: string
          fornecedor_nome?: string | null
          id?: string
          nota_fiscal_url?: string | null
          registrada_por?: string | null
          responsavel_execucao?: string | null
          status_execucao?: string
          unidade_destino?: string | null
          valor: number
        }
        Update: {
          autorizada_por?: string | null
          categoria?: string | null
          created_at?: string | null
          data?: string
          demanda?: string | null
          descricao?: string
          emenda_id?: string
          fornecedor_nome?: string | null
          id?: string
          nota_fiscal_url?: string | null
          registrada_por?: string | null
          responsavel_execucao?: string | null
          status_execucao?: string
          unidade_destino?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: 'despesas_autorizada_por_fkey'
            columns: ['autorizada_por']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'despesas_emenda_id_fkey'
            columns: ['emenda_id']
            isOneToOne: false
            referencedRelation: 'emendas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'despesas_registrada_por_fkey'
            columns: ['registrada_por']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'despesas_responsavel_execucao_fkey'
            columns: ['responsavel_execucao']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      emendas: {
        Row: {
          anexos_essenciais: boolean | null
          autor: string
          created_at: string | null
          data_repasse: string | null
          deliberacao_cie: string | null
          descricao_completa: string | null
          destino_recurso: string | null
          id: string
          meta_operacional: string | null
          natureza: string | null
          numero_emenda: string
          numero_proposta: string | null
          objeto_emenda: string | null
          observacoes: string | null
          parlamentar: string
          portaria: string | null
          situacao: Database['public']['Enums']['situacao_oficial']
          situacao_recurso: string | null
          status_interno: Database['public']['Enums']['status_interno']
          tipo: Database['public']['Enums']['tipo_emenda_enum']
          tipo_recurso: Database['public']['Enums']['tipo_recurso']
          updated_at: string | null
          valor_repasse: number | null
          valor_total: number
        }
        Insert: {
          anexos_essenciais?: boolean | null
          autor: string
          created_at?: string | null
          data_repasse?: string | null
          deliberacao_cie?: string | null
          descricao_completa?: string | null
          destino_recurso?: string | null
          id?: string
          meta_operacional?: string | null
          natureza?: string | null
          numero_emenda: string
          numero_proposta?: string | null
          objeto_emenda?: string | null
          observacoes?: string | null
          parlamentar: string
          portaria?: string | null
          situacao?: Database['public']['Enums']['situacao_oficial']
          situacao_recurso?: string | null
          status_interno?: Database['public']['Enums']['status_interno']
          tipo: Database['public']['Enums']['tipo_emenda_enum']
          tipo_recurso: Database['public']['Enums']['tipo_recurso']
          updated_at?: string | null
          valor_repasse?: number | null
          valor_total?: number
        }
        Update: {
          anexos_essenciais?: boolean | null
          autor?: string
          created_at?: string | null
          data_repasse?: string | null
          deliberacao_cie?: string | null
          descricao_completa?: string | null
          destino_recurso?: string | null
          id?: string
          meta_operacional?: string | null
          natureza?: string | null
          numero_emenda?: string
          numero_proposta?: string | null
          objeto_emenda?: string | null
          observacoes?: string | null
          parlamentar?: string
          portaria?: string | null
          situacao?: Database['public']['Enums']['situacao_oficial']
          situacao_recurso?: string | null
          status_interno?: Database['public']['Enums']['status_interno']
          tipo?: Database['public']['Enums']['tipo_emenda_enum']
          tipo_recurso?: Database['public']['Enums']['tipo_recurso']
          updated_at?: string | null
          valor_repasse?: number | null
          valor_total?: number
        }
        Relationships: []
      }
      historico: {
        Row: {
          criado_em: string | null
          detalhe: string | null
          emenda_id: string
          evento: string
          feito_por: string | null
          id: string
        }
        Insert: {
          criado_em?: string | null
          detalhe?: string | null
          emenda_id: string
          evento: string
          feito_por?: string | null
          id?: string
        }
        Update: {
          criado_em?: string | null
          detalhe?: string | null
          emenda_id?: string
          evento?: string
          feito_por?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'historico_emenda_id_fkey'
            columns: ['emenda_id']
            isOneToOne: false
            referencedRelation: 'emendas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'historico_feito_por_fkey'
            columns: ['feito_por']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      pendencias: {
        Row: {
          created_at: string | null
          descricao: string
          dispensada: boolean | null
          emenda_id: string | null
          id: string
          justificativa: string | null
          resolvida: boolean | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          dispensada?: boolean | null
          emenda_id?: string | null
          id?: string
          justificativa?: string | null
          resolvida?: boolean | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          dispensada?: boolean | null
          emenda_id?: string | null
          id?: string
          justificativa?: string | null
          resolvida?: boolean | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'pendencias_emenda_id_fkey'
            columns: ['emenda_id']
            isOneToOne: false
            referencedRelation: 'emendas'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          cargo_id: string | null
          cpf: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          role: Database['public']['Enums']['user_role']
          status: Database['public']['Enums']['user_status']
          unidade: string | null
          updated_at: string | null
        }
        Insert: {
          cargo_id?: string | null
          cpf?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          role?: Database['public']['Enums']['user_role']
          status?: Database['public']['Enums']['user_status']
          unidade?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo_id?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          role?: Database['public']['Enums']['user_role']
          status?: Database['public']['Enums']['user_status']
          unidade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_cargo_id_fkey'
            columns: ['cargo_id']
            isOneToOne: false
            referencedRelation: 'cargos'
            referencedColumns: ['id']
          },
        ]
      }
      repasses: {
        Row: {
          created_at: string | null
          data: string
          emenda_id: string
          fonte: string
          id: string
          observacoes: string | null
          status: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          data: string
          emenda_id: string
          fonte: string
          id?: string
          observacoes?: string | null
          status?: string
          valor: number
        }
        Update: {
          created_at?: string | null
          data?: string
          emenda_id?: string
          fonte?: string
          id?: string
          observacoes?: string | null
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: 'repasses_emenda_id_fkey'
            columns: ['emenda_id']
            isOneToOne: false
            referencedRelation: 'emendas'
            referencedColumns: ['id']
          },
        ]
      }
      security_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          severity: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          severity?: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          severity?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'security_notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: never
        Returns: Database['public']['Enums']['user_role']
      }
      log_security_notification: {
        Args: {
          p_message: string
          p_severity: string
          p_type: string
          p_user_id?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      situacao_oficial:
        | 'PAGA'
        | 'EMPENHADA_AGUARDANDO_FORMALIZACAO'
        | 'FAVORAVEL'
        | 'EM_ANALISE'
        | 'LIBERADO_PAGAMENTO_FNS'
        | 'OUTRA'
      status_interno:
        | 'RASCUNHO'
        | 'EM_EXECUCAO'
        | 'PAGA_SEM_DOCUMENTOS'
        | 'PAGA_COM_PENDENCIAS'
        | 'CONCLUIDA'
        | 'PROPOSTA_PAGA'
        | 'EM_ANALISE_PAGAMENTO'
        | 'APROVADA_PAGAMENTO'
        | 'AUTORIZADA_AGUARDANDO_EMPENHO'
        | 'AGUARDANDO_AUTORIZACAO_FNS'
        | 'PORTARIA_PUBLICADA_AGUARDANDO_FNS'
        | 'ENVIADA_PUBLICACAO_PORTARIA'
        | 'PROPOSTA_APROVADA'
        | 'CLASSIFICADA_AGUARDANDO_SECRETARIA'
      tipo_emenda_enum: 'individual' | 'bancada' | 'comissao'
      tipo_recurso:
        | 'CUSTEIO_MAC'
        | 'CUSTEIO_PAP'
        | 'EQUIPAMENTO'
        | 'INCREMENTO_MAC'
        | 'INCREMENTO_PAP'
        | 'OUTRO'
      user_role: 'ADMIN' | 'GESTOR' | 'ANALISTA' | 'CONSULTA'
      user_status: 'ATIVO' | 'BLOQUEADO' | 'PENDENTE'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      situacao_oficial: [
        'PAGA',
        'EMPENHADA_AGUARDANDO_FORMALIZACAO',
        'FAVORAVEL',
        'EM_ANALISE',
        'LIBERADO_PAGAMENTO_FNS',
        'OUTRA',
      ],
      status_interno: [
        'RASCUNHO',
        'EM_EXECUCAO',
        'PAGA_SEM_DOCUMENTOS',
        'PAGA_COM_PENDENCIAS',
        'CONCLUIDA',
        'PROPOSTA_PAGA',
        'EM_ANALISE_PAGAMENTO',
        'APROVADA_PAGAMENTO',
        'AUTORIZADA_AGUARDANDO_EMPENHO',
        'AGUARDANDO_AUTORIZACAO_FNS',
        'PORTARIA_PUBLICADA_AGUARDANDO_FNS',
        'ENVIADA_PUBLICACAO_PORTARIA',
        'PROPOSTA_APROVADA',
        'CLASSIFICADA_AGUARDANDO_SECRETARIA',
      ],
      tipo_emenda_enum: ['individual', 'bancada', 'comissao'],
      tipo_recurso: [
        'CUSTEIO_MAC',
        'CUSTEIO_PAP',
        'EQUIPAMENTO',
        'INCREMENTO_MAC',
        'INCREMENTO_PAP',
        'OUTRO',
      ],
      user_role: ['ADMIN', 'GESTOR', 'ANALISTA', 'CONSULTA'],
      user_status: ['ATIVO', 'BLOQUEADO', 'PENDENTE'],
    },
  },
} as const
