-- Schema inicial do catálogo Fruto da Malha.
-- Fonte da verdade do banco (Hibernate roda em modo "validate" — nunca altera o schema sozinho).
-- Ver docs/DATABASE_SCHEMA.md para o diagrama e a justificativa de cada decisão.

CREATE TABLE usuario (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(120)  NOT NULL,
    email       VARCHAR(180)  NOT NULL,
    senha_hash  VARCHAR(255)  NOT NULL,
    role        VARCHAR(20)   NOT NULL,
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_usuario_email UNIQUE (email)
);

CREATE TABLE categoria (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(120)  NOT NULL,
    slug        VARCHAR(140)  NOT NULL,
    descricao   TEXT,
    imagem_url  VARCHAR(500),
    ordem       INTEGER       NOT NULL DEFAULT 0,
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_categoria_slug UNIQUE (slug)
);

CREATE TABLE colecao (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(120)  NOT NULL,
    slug        VARCHAR(140)  NOT NULL,
    descricao   TEXT,
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_colecao_slug UNIQUE (slug)
);

CREATE TABLE tamanho (
    id          BIGSERIAL PRIMARY KEY,
    nome        VARCHAR(20)   NOT NULL,
    ordem       INTEGER       NOT NULL DEFAULT 0,
    ativo       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_tamanho_nome UNIQUE (nome)
);

CREATE TABLE produto (
    id           BIGSERIAL PRIMARY KEY,
    nome         VARCHAR(160)   NOT NULL,
    referencia   VARCHAR(40)    NOT NULL,
    descricao    TEXT,
    categoria_id BIGINT         NOT NULL REFERENCES categoria (id),
    colecao_id   BIGINT         REFERENCES colecao (id),
    tecido       VARCHAR(120),
    sexo         VARCHAR(20)    NOT NULL,
    preco        NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
    status       VARCHAR(20)    NOT NULL DEFAULT 'ATIVO',
    observacoes  TEXT,
    destaque     BOOLEAN        NOT NULL DEFAULT FALSE,
    lancamento   BOOLEAN        NOT NULL DEFAULT FALSE,
    ordem        INTEGER        NOT NULL DEFAULT 0,
    deleted_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_produto_referencia UNIQUE (referencia)
);

CREATE INDEX ix_produto_categoria_id ON produto (categoria_id);
CREATE INDEX ix_produto_colecao_id ON produto (colecao_id);
CREATE INDEX ix_produto_status_deleted_at ON produto (status, deleted_at);
CREATE INDEX ix_produto_destaque ON produto (destaque) WHERE destaque = TRUE;
CREATE INDEX ix_produto_lancamento ON produto (lancamento) WHERE lancamento = TRUE;

CREATE TABLE produto_tamanho (
    id          BIGSERIAL PRIMARY KEY,
    produto_id  BIGINT      NOT NULL REFERENCES produto (id) ON DELETE CASCADE,
    tamanho_id  BIGINT      NOT NULL REFERENCES tamanho (id),
    disponivel  BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_produto_tamanho UNIQUE (produto_id, tamanho_id)
);

CREATE INDEX ix_produto_tamanho_produto_id ON produto_tamanho (produto_id);
CREATE INDEX ix_produto_tamanho_tamanho_id ON produto_tamanho (tamanho_id);

CREATE TABLE imagem_produto (
    id          BIGSERIAL PRIMARY KEY,
    produto_id  BIGINT      NOT NULL REFERENCES produto (id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    public_id   VARCHAR(300) NOT NULL,
    principal   BOOLEAN     NOT NULL DEFAULT FALSE,
    ordem       INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_imagem_produto_produto_id ON imagem_produto (produto_id);

CREATE TABLE video_produto (
    id          BIGSERIAL PRIMARY KEY,
    produto_id  BIGINT      NOT NULL REFERENCES produto (id) ON DELETE CASCADE,
    url         VARCHAR(500) NOT NULL,
    public_id   VARCHAR(300) NOT NULL,
    ordem       INTEGER     NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_video_produto_produto_id ON video_produto (produto_id);
