-- ============================================
-- GLICO — Schema do Banco de Dados
-- Execute este script no MySQL Workbench ou
-- via terminal: mysql -u root -p < schema.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS glico_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE glico_db;

-- ============================================
-- TABELA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(100)         NOT NULL,
  email       VARCHAR(100)         NOT NULL UNIQUE,
  senha_hash  VARCHAR(255)         NOT NULL,
  criado_em   DATETIME             NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: avaliacoes
-- Armazena as respostas do formulário e o
-- resultado da predição do modelo de IA.
-- ============================================
CREATE TABLE IF NOT EXISTS avaliacoes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT       NOT NULL,
  data_avaliacao  DATETIME  NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Features do modelo (BRFSS/CDC)
  high_bp         TINYINT(1) NOT NULL COMMENT 'Pressão Alta: 0=Não, 1=Sim',
  high_chol       TINYINT(1) NOT NULL COMMENT 'Colesterol Alto: 0=Não, 1=Sim',
  bmi             FLOAT      NOT NULL COMMENT 'IMC calculado: peso(kg) / altura(m)^2',
  smoker          TINYINT(1) NOT NULL COMMENT 'Fumante: 0=Não, 1=Sim',
  phys_activity   TINYINT(1) NOT NULL COMMENT 'Atividade Física Regular: 0=Não, 1=Sim',
  heart_disease   TINYINT(1) NOT NULL COMMENT 'Doença Cardíaca / Ataque: 0=Não, 1=Sim',
  stroke          TINYINT(1) NOT NULL COMMENT 'AVC: 0=Não, 1=Sim',
  gen_hlth        TINYINT    NOT NULL COMMENT 'Saúde Geral: 1=Excelente até 5=Ruim',
  ment_hlth       TINYINT    NOT NULL COMMENT 'Dias com saúde mental ruim no mês (0-30)',
  phys_hlth       TINYINT    NOT NULL COMMENT 'Dias com saúde física ruim no mês (0-30)',
  heavy_alcohol   TINYINT(1) NOT NULL COMMENT 'Consumo pesado de álcool: 0=Não, 1=Sim',
  fruits          TINYINT(1) NOT NULL COMMENT 'Consome frutas regularmente: 0=Não, 1=Sim',
  veggies         TINYINT(1) NOT NULL COMMENT 'Consome vegetais regularmente: 0=Não, 1=Sim',
  sex             TINYINT(1) NOT NULL COMMENT 'Sexo: 0=Feminino, 1=Masculino',
  age_category    TINYINT    NOT NULL COMMENT 'Faixa etária CDC (1=18-24 até 13=80+)',

  -- Resultado da predição (preenchido pela API preditiva)
  risco_predito   TINYINT(1)  NULL COMMENT '0=Sem risco, 1=Com risco',
  probabilidade   FLOAT       NULL COMMENT 'Probabilidade de risco (ex: 0.82 = 82%)',
  tipo_predicao   VARCHAR(10) NOT NULL DEFAULT 'ML' COMMENT 'Tipo de predição: ML ou FALLBACK',

  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
