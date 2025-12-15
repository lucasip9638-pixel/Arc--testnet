# 🚀 Como Enviar o Projeto para o GitHub

## 📋 Passo a Passo

### 1. Preparar o Projeto

Execute o script:
```bash
ENVIAR-PARA-GITHUB.bat
```

Este script:
- ✅ Verifica se Git está instalado
- ✅ Inicializa Git se necessário
- ✅ Cria/verifica .gitignore
- ✅ Adiciona todos os arquivos
- ✅ Faz commit inicial

### 2. Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Escolha um nome para o repositório (ex: `gm-swap-on-arc-frontend`)
3. **NÃO marque** "Initialize with README"
4. Clique em "Create repository"

### 3. Configurar Remote e Enviar

Execute o script:
```bash
CONFIGURAR-GITHUB-REMOTE.bat
```

Cole a URL do seu repositório quando solicitado.

## 🔐 Autenticação

### Opção 1: Personal Access Token (HTTPS)

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Dê um nome (ex: "Arc DeFi Project")
4. Selecione escopos: `repo` (todos)
5. Clique em "Generate token"
6. **COPIE O TOKEN** (só aparece uma vez!)
7. Ao fazer push, use o token como senha

### Opção 2: SSH (Recomendado)

1. Gere uma chave SSH:
   ```bash
   ssh-keygen -t ed25519 -C "seu-email@exemplo.com"
   ```

2. Adicione a chave ao GitHub:
   - Copie o conteúdo de `~/.ssh/id_ed25519.pub`
   - Acesse: https://github.com/settings/keys
   - Clique em "New SSH key"
   - Cole a chave e salve

3. Use URL SSH ao configurar remote:
   ```
   git@github.com:usuario/repositorio.git
   ```

## 📝 Comandos Manuais

Se preferir fazer manualmente:

```bash
# 1. Inicializar Git (se ainda não fez)
git init

# 2. Adicionar arquivos
git add .

# 3. Fazer commit
git commit -m "Initial commit: Arc DeFi Hub"

# 4. Adicionar remote
git remote add origin https://github.com/USUARIO/REPOSITORIO.git

# 5. Renomear branch
git branch -M main

# 6. Enviar para GitHub
git push -u origin main
```

## 🔄 Atualizar Código no GitHub

Depois do primeiro push, para atualizar:

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

## ⚠️ Arquivos Ignorados

O `.gitignore` já está configurado para ignorar:
- `node_modules/`
- `.next/`
- `.env` (arquivos de ambiente)
- Arquivos de build e cache

## 📚 Recursos

- [Documentação do Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [GitHub CLI](https://cli.github.com) (alternativa)

