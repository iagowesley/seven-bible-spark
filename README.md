# Seven Bible Spark

Aplicativo de estudo bíblico semanal com lições diárias e sistema de gestão de conteúdo integrado.

## Funcionalidades

- Estudos bíblicos organizados por trimestre, semana e dia
- Sistema de administração completo para gerenciar conteúdo
- Lições dinâmicas com textos principais, secundários, resumos e hashtags
- Quizzes para testar o conhecimento
- Interface moderna e responsiva usando Shadcn UI
- Suporte completo a temas claro e escuro

## Configuração do Supabase

Este projeto utiliza o Supabase para armazenamento de dados e autenticação. Siga os passos abaixo para configurar o ambiente:

### 1. Criar um projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto e anote a URL e a chave anon/public
3. Configure as informações do projeto em `src/integrations/supabase/client.ts`

### 2. Configurar tabelas no Supabase

O projeto utiliza as seguintes tabelas:

#### Tabela `trimestres`

```sql
create table trimestres (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  ano integer not null,
  created_at timestamp with time zone default now() not null
);

-- Permissões para usuários autenticados
alter table trimestres enable row level security;
create policy "Usuários autenticados podem ler trimestres" on trimestres
  for select to authenticated using (true);
create policy "Somente admins podem modificar trimestres" on trimestres
  for all to authenticated using (auth.uid() in (select id from admins));
```

#### Tabela `semanas`

```sql
create table semanas (
  id uuid default gen_random_uuid() primary key,
  trimestre_id uuid references trimestres(id) on delete cascade not null,
  numero integer not null,
  titulo text not null,
  subtitulo text not null,
  img_sabado_url text,
  created_at timestamp with time zone default now() not null
);

-- Permissões para usuários autenticados
alter table semanas enable row level security;
create policy "Usuários autenticados podem ler semanas" on semanas
  for select to authenticated using (true);
create policy "Somente admins podem modificar semanas" on semanas
  for all to authenticated using (auth.uid() in (select id from admins));
```

#### Tabela `licoes`

```sql
create table licoes (
  id uuid default gen_random_uuid() primary key,
  semana_id uuid references semanas(id) on delete cascade not null,
  dia text not null check (dia in ('domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado')),
  texto1 text not null,
  texto2 text not null,
  resumo text not null,
  hashtags text not null,
  created_at timestamp with time zone default now() not null,
  unique (semana_id, dia)
);

-- Permissões para usuários autenticados
alter table licoes enable row level security;
create policy "Usuários autenticados podem ler licoes" on licoes
  for select to authenticated using (true);
create policy "Somente admins podem modificar licoes" on licoes
  for all to authenticated using (auth.uid() in (select id from admins));
```

### 3. Configurar Storage no Supabase

1. Crie um bucket chamado `images` no Storage do Supabase
2. Configure as permissões para permitir upload e download de imagens:

```sql
-- Permissões para imagens
create policy "Usuários autenticados podem ver imagens" on storage.objects
  for select to authenticated using (bucket_id = 'images');
create policy "Somente admins podem fazer upload de imagens" on storage.objects
  for insert to authenticated using (
    bucket_id = 'images' AND 
    auth.uid() in (select id from admins)
  );
create policy "Somente admins podem atualizar imagens" on storage.objects
  for update to authenticated using (
    bucket_id = 'images' AND 
    auth.uid() in (select id from admins)
  );
create policy "Somente admins podem excluir imagens" on storage.objects
  for delete to authenticated using (
    bucket_id = 'images' AND 
    auth.uid() in (select id from admins)
  );
```

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo de desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Executar build de produção
npm run start
```

## Tecnologias Utilizadas

- React.js
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Supabase (Banco de dados PostgreSQL e Storage)
- React Query
- React Router

## Estrutura de Diretórios

- `/src` - Código fonte da aplicação
  - `/components` - Componentes React reutilizáveis
  - `/contexts` - Contextos e providers
  - `/hooks` - Hooks personalizados
  - `/lib` - Bibliotecas e helpers
  - `/models` - Serviços CRUD para o Supabase
  - `/pages` - Páginas da aplicação
  - `/integrations` - Integrações com serviços externos (Supabase)

## Licença

MIT

## Project info

**URL**: https://lovable.dev/projects/a76e9acd-9ac0-4c6a-aaf6-db176adba62b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a76e9acd-9ac0-4c6a-aaf6-db176adba62b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a76e9acd-9ac0-4c6a-aaf6-db176adba62b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
