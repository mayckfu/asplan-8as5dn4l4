-- Supabase Initial Schema for Controle de Emendas
-- Version: 1.1 (Security Enhanced)
-- Date: 2025-11-07
-- Changes:
-- - Added Row-Level Security (RLS) policies for role-based access.
-- - Updated Foreign Key constraints to ON DELETE RESTRICT for data integrity.
-- - Added helper functions for JWT claim extraction.
-- - Added Storage policies for the 'anexos' bucket.

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE public.tipo_recurso AS ENUM (
    'CUSTEIO_MAC',
    'CUSTEIO_PAP',
    'EQUIPAMENTO',
    'INCREMENTO_MAC',
    'INCREMENTO_PAP',
    'OUTRO'
);

CREATE TYPE public.situacao_oficial AS ENUM (
    'PAGA',
    'EMPENHADA_AGUARDANDO_FORMALIZACAO',
    'FAVORAVEL',
    'EM_ANALISE',
    'LIBERADO_PAGAMENTO_FNS',
    'OUTRA'
);

CREATE TYPE public.status_interno AS ENUM (
    'RASCUNHO',
    'EM_EXECUCAO',
    'PAGA_SEM_DOCUMENTOS',
    'PAGA_COM_PENDENCIAS',
    'CONCLUIDA'
);

CREATE TYPE public.status_execucao AS ENUM (
    'PLANEJADA',
    'EMPENHADA',
    'LIQUIDADA',
    'PAGA'
);

-- =============================================
-- TABLES
-- =============================================

-- Profiles Table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    nome text,
    email text,
    cargo text,
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.profiles IS 'Stores public user profile information.';

-- Emendas Table
CREATE TABLE public.emendas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo text,
    tipo_recurso tipo_recurso NOT NULL,
    autor text NOT NULL,
    numero_emenda text,
    numero_proposta text NOT NULL,
    valor_total numeric(14, 2) NOT NULL,
    situacao situacao_oficial NOT NULL,
    portaria text,
    deliberacao_cie text,
    natureza text,
    objeto text,
    meta_operacional text,
    data_repassada date,
    status_interno status_interno DEFAULT 'RASCUNHO',
    created_by uuid NOT NULL REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.emendas IS 'Main table for managing amendment details.';

-- Repasses Table
CREATE TABLE public.repasses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    emenda_id uuid NOT NULL REFERENCES public.emendas(id) ON DELETE RESTRICT,
    data date NOT NULL,
    valor numeric(14, 2) NOT NULL,
    fonte text,
    comprovante_url text
);
COMMENT ON TABLE public.repasses IS 'Tracks fund transfers for amendments.';

-- Despesas Table
CREATE TABLE public.despesas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    emenda_id uuid NOT NULL REFERENCES public.emendas(id) ON DELETE RESTRICT,
    data date NOT NULL,
    valor numeric(14, 2) NOT NULL,
    categoria text NOT NULL,
    descricao text,
    nota_fiscal_url text,
    registrada_por uuid NOT NULL REFERENCES public.profiles(id),
    autorizada_por uuid REFERENCES public.profiles(id),
    responsavel_execucao uuid REFERENCES public.profiles(id),
    unidade_destino text,
    fornecedor_nome text,
    fornecedor_cnpj text,
    status_execucao status_execucao DEFAULT 'PLANEJADA'
);
COMMENT ON TABLE public.despesas IS 'Records expenses related to amendments.';

-- Demandas Table
CREATE TABLE public.demandas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    emenda_id uuid NOT NULL REFERENCES public.emendas(id) ON DELETE RESTRICT,
    titulo text NOT NULL,
    descricao text,
    meta_relacionada text,
    valor_previsto numeric(14, 2),
    status text
);
COMMENT ON TABLE public.demandas IS 'Optional demand tracking for amendments.';

-- Despesa_Demanda Junction Table
CREATE TABLE public.despesa_demanda (
    despesa_id uuid NOT NULL REFERENCES public.despesas(id) ON DELETE RESTRICT,
    demanda_id uuid NOT NULL REFERENCES public.demandas(id) ON DELETE RESTRICT,
    valor_alocado numeric(14, 2) NOT NULL,
    PRIMARY KEY (despesa_id, demanda_id)
);
COMMENT ON TABLE public.despesa_demanda IS 'Junction table for many-to-many relationship between expenses and demands.';

-- Anexos Table
CREATE TABLE public.anexos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    emenda_id uuid NOT NULL REFERENCES public.emendas(id) ON DELETE RESTRICT,
    tipo text,
    titulo text,
    url text NOT NULL,
    publico boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.anexos IS 'Manages attachments related to amendments.';

-- Historicos Table
CREATE TABLE public.historicos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    emenda_id uuid NOT NULL REFERENCES public.emendas(id) ON DELETE RESTRICT,
    evento text,
    detalhe text,
    feito_por uuid REFERENCES public.profiles(id),
    criado_em timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.historicos IS 'Logs changes and events for amendments.';

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_emendas_numero_proposta ON public.emendas(numero_proposta);
CREATE INDEX idx_emendas_tipo_recurso_situacao ON public.emendas(tipo_recurso, situacao);
CREATE INDEX idx_emendas_created_at ON public.emendas(created_at);
CREATE INDEX idx_repasses_emenda_id_data ON public.repasses(emenda_id, data);
CREATE INDEX idx_despesas_emenda_id_data ON public.despesas(emenda_id, data);
CREATE INDEX idx_despesas_status_execucao ON public.despesas(status_execucao);
CREATE INDEX idx_despesas_unidade_destino ON public.despesas(unidade_destino);
CREATE INDEX idx_despesas_registrada_por ON public.despesas(registrada_por);
CREATE INDEX idx_demandas_emenda_id ON public.demandas(emenda_id);

-- =============================================
-- VIEWS
-- =============================================

CREATE OR REPLACE VIEW public.vw_emendas_resumo AS
SELECT e.id AS emenda_id, e.valor_total, COALESCE(SUM(r.valor), 0) AS total_repassado, COALESCE(SUM(d.valor), 0) AS total_gasto, (COALESCE(SUM(d.valor), 0) / NULLIF(COALESCE(SUM(r.valor), 0), 0)) * 100 AS execucao_percent, (COALESCE(SUM(d.valor), 0) / NULLIF(e.valor_total, 0)) * 100 AS cobertura_percent, 0 AS pendencias_count
FROM public.emendas e LEFT JOIN public.repasses r ON e.id = r.emenda_id LEFT JOIN public.despesas d ON e.id = d.emenda_id
GROUP BY e.id;

CREATE OR REPLACE VIEW public.vw_despesas_por_responsavel AS
SELECT p.id AS responsavel_id, p.nome AS responsavel_nome, 'registrada_por' AS tipo_responsavel, SUM(d.valor) AS total_valor
FROM public.despesas d JOIN public.profiles p ON d.registrada_por = p.id
GROUP BY p.id, p.nome
UNION ALL
SELECT p.id AS responsavel_id, p.nome AS responsavel_nome, 'responsavel_execucao' AS tipo_responsavel, SUM(d.valor) AS total_valor
FROM public.despesas d JOIN public.profiles p ON d.responsavel_execucao = p.id
WHERE d.responsavel_execucao IS NOT NULL
GROUP BY p.id, p.nome;

CREATE OR REPLACE VIEW public.vw_despesas_por_unidade AS
SELECT unidade_destino, SUM(valor) AS total_gasto
FROM public.despesas
WHERE unidade_destino IS NOT NULL
GROUP BY unidade_destino;

CREATE OR REPLACE VIEW public.vw_despesas_por_demanda AS
SELECT d.id AS demanda_id, d.titulo AS demanda_titulo, SUM(dd.valor_alocado) AS total_alocado
FROM public.despesa_demanda dd JOIN public.demandas d ON dd.demanda_id = d.id
GROUP BY d.id, d.titulo;

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.set_registrada_por() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN IF NEW.registrada_por IS NULL THEN NEW.registrada_por := auth.uid(); END IF; RETURN NEW; END; $$;
CREATE TRIGGER trigger_set_registrada_por BEFORE INSERT ON public.despesas FOR EACH ROW EXECUTE FUNCTION public.set_registrada_por();

CREATE OR REPLACE FUNCTION public.handle_emenda_history() RETURNS TRIGGER LANGUAGE plpgsql AS $$ DECLARE detalhe_log text := ''; BEGIN IF TG_OP = 'INSERT' THEN detalhe_log := 'Emenda criada com o número de proposta ' || NEW.numero_proposta || '.'; INSERT INTO public.historicos (emenda_id, evento, detalhe, feito_por) VALUES (NEW.id, 'CREATED', detalhe_log, auth.uid()); ELSIF TG_OP = 'UPDATE' THEN IF OLD.situacao IS DISTINCT FROM NEW.situacao THEN detalhe_log := detalhe_log || 'Situação oficial alterada de ' || OLD.situacao || ' para ' || NEW.situacao || '. '; END IF; IF OLD.status_interno IS DISTINCT FROM NEW.status_interno THEN detalhe_log := detalhe_log || 'Status interno alterado de ' || OLD.status_interno || ' para ' || NEW.status_interno || '. '; END IF; IF detalhe_log != '' THEN INSERT INTO public.historicos (emenda_id, evento, detalhe, feito_por) VALUES (NEW.id, 'STATUS_CHANGE', detalhe_log, auth.uid()); END IF; END IF; RETURN NEW; END; $$;
CREATE TRIGGER trigger_emenda_history AFTER INSERT OR UPDATE ON public.emendas FOR EACH ROW EXECUTE FUNCTION public.handle_emenda_history();

CREATE OR REPLACE FUNCTION public.handle_repasses_history() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN IF TG_OP = 'INSERT' THEN INSERT INTO public.historicos (emenda_id, evento, detalhe, feito_por) VALUES (NEW.emenda_id, 'REPASSE_LANCADO', 'Repasse no valor de ' || NEW.valor::text || ' lançado.', auth.uid()); END IF; RETURN NEW; END; $$;
CREATE TRIGGER trigger_repasses_history AFTER INSERT ON public.repasses FOR EACH ROW EXECUTE FUNCTION public.handle_repasses_history();

CREATE OR REPLACE FUNCTION public.handle_despesas_history() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN IF TG_OP = 'INSERT' THEN INSERT INTO public.historicos (emenda_id, evento, detalhe, feito_por) VALUES (NEW.emenda_id, 'DESPESA_LANCADA', 'Despesa no valor de ' || NEW.valor::text || ' lançada.', auth.uid()); ELSIF TG_OP = 'UPDATE' THEN IF OLD.status_execucao IS DISTINCT FROM NEW.status_execucao THEN INSERT INTO public.historicos (emenda_id, evento, detalhe, feito_por) VALUES (NEW.emenda_id, 'DESPESA_ATUALIZADA', 'Status da despesa ' || NEW.id || ' alterado para ' || NEW.status_execucao, auth.uid()); END IF; END IF; RETURN NEW; END; $$;
CREATE TRIGGER trigger_despesas_history AFTER INSERT OR UPDATE ON public.despesas FOR EACH ROW EXECUTE FUNCTION public.handle_despesas_history();

CREATE OR REPLACE FUNCTION public.handle_anexos_history() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN IF TG_OP = 'INSERT' THEN INSERT INTO public.historicos (emenda_id, evento, detalhe, feito_por) VALUES (NEW.emenda_id, 'ANEXO_ADICIONADO', 'Anexo "' || NEW.titulo || '" adicionado.', auth.uid()); END IF; RETURN NEW; END; $$;
CREATE TRIGGER trigger_anexos_history AFTER INSERT ON public.anexos FOR EACH ROW EXECUTE FUNCTION public.handle_anexos_history();

-- =============================================
-- SECURITY & RLS
-- =============================================

CREATE OR REPLACE FUNCTION public.get_my_claim(claim TEXT) RETURNS TEXT AS $$ SELECT nullif(current_setting('request.jwt.claims', true)::jsonb ->> claim, '')::TEXT; $$ LANGUAGE sql STABLE;
COMMENT ON FUNCTION public.get_my_claim(TEXT) IS 'Returns a specific claim from the current user''s JWT.';

CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS TEXT AS $$ SELECT public.get_my_claim('role'); $$ LANGUAGE sql STABLE;
COMMENT ON FUNCTION public.get_my_role() IS 'Returns the ''role'' claim from the current user''s JWT.';

ALTER TABLE public.emendas ENABLE ROW LEVEL SECURITY; ALTER TABLE public.emendas FORCE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to emendas" ON public.emendas FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Tecnicos can write emendas" ON public.emendas FOR INSERT, UPDATE, DELETE USING (get_my_role() = 'tecnico') WITH CHECK (get_my_role() = 'tecnico');
CREATE POLICY "Authenticated users can read emendas" ON public.emendas FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.repasses ENABLE ROW LEVEL SECURITY; ALTER TABLE public.repasses FORCE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to repasses" ON public.repasses FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Tecnicos can write repasses" ON public.repasses FOR INSERT, UPDATE, DELETE USING (get_my_role() = 'tecnico') WITH CHECK (get_my_role() = 'tecnico');
CREATE POLICY "Authenticated users can read repasses" ON public.repasses FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY; ALTER TABLE public.despesas FORCE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to despesas" ON public.despesas FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Tecnicos can write despesas" ON public.despesas FOR INSERT, UPDATE, DELETE USING (get_my_role() = 'tecnico') WITH CHECK (get_my_role() = 'tecnico');
CREATE POLICY "Authenticated users can read despesas" ON public.despesas FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.demandas ENABLE ROW LEVEL SECURITY; ALTER TABLE public.demandas FORCE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to demandas" ON public.demandas FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Tecnicos can write demandas" ON public.demandas FOR INSERT, UPDATE, DELETE USING (get_my_role() = 'tecnico') WITH CHECK (get_my_role() = 'tecnico');
CREATE POLICY "Authenticated users can read demandas" ON public.demandas FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.despesa_demanda ENABLE ROW LEVEL SECURITY; ALTER TABLE public.despesa_demanda FORCE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to despesa_demanda" ON public.despesa_demanda FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Tecnicos can write despesa_demanda" ON public.despesa_demanda FOR INSERT, UPDATE, DELETE USING (get_my_role() = 'tecnico') WITH CHECK (get_my_role() = 'tecnico');
CREATE POLICY "Authenticated users can read despesa_demanda" ON public.despesa_demanda FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY; ALTER TABLE public.anexos FORCE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to anexos" ON public.anexos FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Tecnicos can write anexos" ON public.anexos FOR INSERT, UPDATE, DELETE USING (get_my_role() = 'tecnico') WITH CHECK (get_my_role() = 'tecnico');
CREATE POLICY "Authenticated users can read anexos" ON public.anexos FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.historicos ENABLE ROW LEVEL SECURITY; ALTER TABLE public.historicos FORCE ROW LEVEL SECURITY;
CREATE POLICY "Admins have full access to historicos" ON public.historicos FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Tecnicos can write historicos" ON public.historicos FOR INSERT, UPDATE, DELETE USING (get_my_role() = 'tecnico') WITH CHECK (get_my_role() = 'tecnico');
CREATE POLICY "Authenticated users can read historicos" ON public.historicos FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY; ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- =============================================
-- STORAGE POLICIES
-- =============================================
-- Note: RLS on views is inherited from the underlying tables.

INSERT INTO storage.buckets (id, name, public) VALUES ('anexos', 'anexos', false) ON CONFLICT (id) DO NOTHING;
COMMENT ON TABLE storage.buckets IS 'Stores file buckets.';

CREATE POLICY "Allow authenticated read access to anexos" ON storage.objects FOR SELECT USING (bucket_id = 'anexos' AND auth.role() = 'authenticated');
CREATE POLICY "Allow write access to anexos for admin/tecnico" ON storage.objects FOR INSERT, UPDATE, DELETE USING (bucket_id = 'anexos' AND get_my_role() IN ('admin', 'tecnico')) WITH CHECK (bucket_id = 'anexos' AND get_my_role() IN ('admin', 'tecnico'));
