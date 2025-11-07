-- Supabase Schema for Planning & Health Dashboard (APS)
-- Version: 1.0
-- Date: 2025-11-07

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE public.papel_usuario AS ENUM (
    'admin',
    'planejador',
    'tecnico',
    'visualizador'
);

CREATE TYPE public.area_cuidado AS ENUM (
    'APS',
    'ODONTO',
    'VIGILANCIA',
    'ESPECIALIZADA'
);

CREATE TYPE public.status_registro AS ENUM (
    'OK',
    'PENDENTE',
    'INCONSISTENTE'
);

-- =============================================
-- TABLES
-- =============================================

-- Profiles Table
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    nome text,
    email text UNIQUE,
    papel public.papel_usuario NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.profiles IS 'Stores user profile information and roles.';

-- UBS Table
CREATE TABLE public.ubs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    cnes text UNIQUE,
    bairro text,
    microarea text,
    latitude numeric,
    longitude numeric,
    ativa boolean DEFAULT true
);
COMMENT ON TABLE public.ubs IS 'Stores information about Unidades Básicas de Saúde (UBS).';

-- Profissionais Table
CREATE TABLE public.profissionais (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    cns text,
    cbo text,
    vinculo text,
    ubs_id uuid REFERENCES public.ubs(id) ON DELETE SET NULL
);
COMMENT ON TABLE public.profissionais IS 'Stores information about health professionals.';

-- Equipes Table
CREATE TABLE public.equipes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ine text UNIQUE,
    tipo text,
    ubs_id uuid REFERENCES public.ubs(id) ON DELETE SET NULL
);
COMMENT ON TABLE public.equipes IS 'Stores information about health teams.';

-- Indicadores Table
CREATE TABLE public.indicadores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    descricao text,
    area public.area_cuidado,
    meta numeric,
    unidade_medida text
);
COMMENT ON TABLE public.indicadores IS 'Defines health indicators and their goals.';

-- Series Indicadores Table
CREATE TABLE public.series_indicadores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    indicador_id uuid NOT NULL REFERENCES public.indicadores(id) ON DELETE CASCADE,
    data date NOT NULL,
    valor numeric,
    ubs_id uuid REFERENCES public.ubs(id) ON DELETE SET NULL,
    equipe_id uuid REFERENCES public.equipes(id) ON DELETE SET NULL,
    status public.status_registro DEFAULT 'OK'
);
COMMENT ON TABLE public.series_indicadores IS 'Stores time series data for indicators.';

-- Produção e-SUS Table
CREATE TABLE public.producao_esus (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data date NOT NULL,
    tipo text,
    quantidade numeric,
    ubs_id uuid REFERENCES public.ubs(id) ON DELETE SET NULL,
    equipe_id uuid REFERENCES public.equipes(id) ON DELETE SET NULL,
    status public.status_registro DEFAULT 'OK'
);
COMMENT ON TABLE public.producao_esus IS 'Stores production data from e-SUS.';

-- Odontologia Table
CREATE TABLE public.odontologia (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data date NOT NULL,
    procedimento text,
    quantidade numeric,
    ubs_id uuid REFERENCES public.ubs(id) ON DELETE SET NULL,
    equipe_id uuid REFERENCES public.equipes(id) ON DELETE SET NULL,
    status public.status_registro DEFAULT 'OK'
);
COMMENT ON TABLE public.odontologia IS 'Stores dental care production data.';

-- Estoque Table (Optional)
CREATE TABLE public.estoque (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    insumo text NOT NULL,
    quantidade numeric,
    ubs_id uuid REFERENCES public.ubs(id) ON DELETE SET NULL,
    atualizado_em timestamptz
);
COMMENT ON TABLE public.estoque IS 'Optional table for inventory management.';

-- Anexos Table
CREATE TABLE public.anexos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo text,
    url text NOT NULL,
    publico boolean DEFAULT false,
    created_at timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.anexos IS 'Stores file attachments.';

-- Historicos Table
CREATE TABLE public.historicos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tabela text NOT NULL,
    registro_id uuid,
    evento text NOT NULL,
    detalhe jsonb,
    feito_por uuid REFERENCES public.profiles(id),
    criado_em timestamptz DEFAULT now() NOT NULL
);
COMMENT ON TABLE public.historicos IS 'Audit log for changes in critical tables.';

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_series_indicadores_data ON public.series_indicadores(data);
CREATE INDEX idx_series_indicadores_ubs_data ON public.series_indicadores(ubs_id, data);
CREATE INDEX idx_series_indicadores_equipe_data ON public.series_indicadores(equipe_id, data);

CREATE INDEX idx_producao_esus_data ON public.producao_esus(data);
CREATE INDEX idx_producao_esus_ubs_data ON public.producao_esus(ubs_id, data);
CREATE INDEX idx_producao_esus_equipe_data ON public.producao_esus(equipe_id, data);

CREATE INDEX idx_odontologia_data ON public.odontologia(data);
CREATE INDEX idx_odontologia_ubs_data ON public.odontologia(ubs_id, data);
CREATE INDEX idx_odontologia_equipe_data ON public.odontologia(equipe_id, data);

-- =============================================
-- VIEWS
-- =============================================

CREATE OR REPLACE VIEW public.vw_kpi_gerais AS
SELECT
    (SELECT COUNT(*) FROM public.producao_esus WHERE data >= date_trunc('month', now())) AS producao_mensal_total,
    (SELECT COUNT(*) FROM public.odontologia WHERE data >= date_trunc('month', now())) AS odonto_mensal_total;

CREATE OR REPLACE VIEW public.vw_producao_por_ubs AS
SELECT u.nome, p.tipo, SUM(p.quantidade) as total
FROM public.producao_esus p
JOIN public.ubs u ON p.ubs_id = u.id
GROUP BY u.nome, p.tipo;

CREATE OR REPLACE VIEW public.vw_odonto_por_ubs AS
SELECT u.nome, o.procedimento, SUM(o.quantidade) as total
FROM public.odontologia o
JOIN public.ubs u ON o.ubs_id = u.id
GROUP BY u.nome, o.procedimento;

CREATE OR REPLACE VIEW public.vw_indicadores_evolucao AS
SELECT
    i.nome,
    s.data,
    s.valor
FROM public.series_indicadores s
JOIN public.indicadores i ON s.indicador_id = i.id
WHERE s.data >= now() - interval '12 months'
ORDER BY i.nome, s.data;

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER AS $$
DECLARE
    user_id uuid := auth.uid();
    details jsonb;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        details := jsonb_build_object('new', to_jsonb(NEW));
        INSERT INTO public.historicos (tabela, registro_id, evento, detalhe, feito_por)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', details, user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        details := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
        INSERT INTO public.historicos (tabela, registro_id, evento, detalhe, feito_por)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', details, user_id);
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        details := jsonb_build_object('old', to_jsonb(OLD));
        INSERT INTO public.historicos (tabela, registro_id, evento, detalhe, feito_por)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', details, user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
CREATE TRIGGER series_indicadores_audit AFTER INSERT OR UPDATE OR DELETE ON public.series_indicadores FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER producao_esus_audit AFTER INSERT OR UPDATE OR DELETE ON public.producao_esus FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER odontologia_audit AFTER INSERT OR UPDATE OR DELETE ON public.odontologia FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER indicadores_audit AFTER INSERT OR UPDATE OR DELETE ON public.indicadores FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- =============================================
-- SECURITY & RLS
-- =============================================

CREATE OR REPLACE FUNCTION public.get_my_claim(claim TEXT) RETURNS TEXT AS $$
    SELECT nullif(current_setting('request.jwt.claims', true)::jsonb ->> claim, '')::TEXT;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS public.papel_usuario AS $$
    SELECT public.get_my_claim('role')::public.papel_usuario;
$$ LANGUAGE sql STABLE;

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_indicadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producao_esus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odontologia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anexos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historicos ENABLE ROW LEVEL SECURITY;

-- Policies for read access (all authenticated users)
CREATE POLICY "Allow read access to all authenticated users" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.ubs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.profissionais FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.equipes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.indicadores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.series_indicadores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.producao_esus FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.odontologia FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.estoque FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.anexos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access to all authenticated users" ON public.historicos FOR SELECT USING (auth.role() = 'authenticated');

-- Policies for write access (admin, planejador, tecnico)
CREATE POLICY "Allow write access for admin/planejador/tecnico" ON public.ubs FOR ALL USING (get_my_role() IN ('admin', 'planejador', 'tecnico'));
CREATE POLICY "Allow write access for admin/planejador/tecnico" ON public.profissionais FOR ALL USING (get_my_role() IN ('admin', 'planejador', 'tecnico'));
CREATE POLICY "Allow write access for admin/planejador/tecnico" ON public.equipes FOR ALL USING (get_my_role() IN ('admin', 'planejador', 'tecnico'));
CREATE POLICY "Allow write access for admin/planejador/tecnico" ON public.indicadores FOR ALL USING (get_my_role() IN ('admin', 'planejador', 'tecnico'));
CREATE POLICY "Allow write access for admin/planejador/tecnico" ON public.series_indicadores FOR ALL USING (get_my_role() IN ('admin', 'planejador', 'tecnico'));
CREATE POLICY "Allow write access for admin/planejador/tecnico" ON public.producao_esus FOR ALL USING (get_my_role() IN ('admin', 'planejador', 'tecnico'));
CREATE POLICY "Allow write access for admin/planejador/tecnico" ON public.odontologia FOR ALL USING (get_my_role() IN ('admin', 'planejador', 'tecnico'));
CREATE POLICY "Allow write access for admin/planejador/tecnico" ON public.estoque FOR ALL USING (get_my_role() IN ('admin', 'planejador', 'tecnico'));
CREATE POLICY "Allow write access for admin/planejador/tecnico" ON public.anexos FOR ALL USING (get_my_role() IN ('admin', 'planejador', 'tecnico'));

-- Special policies for profiles
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage profiles" ON public.profiles FOR ALL USING (get_my_role() = 'admin');

-- =============================================
-- STORAGE POLICIES
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('anexos', 'anexos', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow read access to anexos for authenticated users" ON storage.objects FOR SELECT
USING ( bucket_id = 'anexos' AND auth.role() = 'authenticated' );

CREATE POLICY "Allow write access to anexos for tecnico/admin" ON storage.objects FOR INSERT, UPDATE, DELETE
USING ( bucket_id = 'anexos' AND get_my_role() IN ('admin', 'tecnico') );
