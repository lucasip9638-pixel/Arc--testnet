# 🌐 Como Visualizar a Aplicação na Web

## 📍 Opção 1: Localmente (localhost)

### Link Local:
**http://localhost:3000**

### Como iniciar:
```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:3000**

---

## 🚀 Opção 2: Deploy no Vercel (Link Público)

Para ter um link público que qualquer pessoa pode acessar, faça deploy no Vercel:

### Passo 1: Instalar Vercel CLI (se ainda não tiver)
```bash
npm install -g vercel
```

### Passo 2: Fazer Login
```bash
vercel login
```

### Passo 3: Deploy
```bash
vercel
```

Siga as instruções:
- **Set up and deploy?** → `Y`
- **Which scope?** → Escolha sua conta
- **Link to existing project?** → `N`
- **Project name?** → Pressione Enter (usa o nome padrão)
- **Directory?** → Pressione Enter (usa o diretório atual)
- **Override settings?** → `N`

### Passo 4: Deploy para Produção
```bash
vercel --prod
```

### ✅ Resultado:
Você receberá um link como:
- **https://seu-projeto.vercel.app**

---

## 🎯 Método Mais Rápido: GitHub + Vercel

### 1. Certifique-se de que o código está no GitHub
```bash
git add .
git commit -m "Deploy ready"
git push
```

### 2. Acesse Vercel
👉 https://vercel.com

### 3. Conecte seu GitHub
- Clique em "Add New Project"
- Conecte seu repositório: `lucasip9638-pixel/ARC-TESTNET`
- Clique em "Import"

### 4. Configure o Projeto
- **Framework Preset:** Next.js (detectado automaticamente)
- **Root Directory:** `./` (padrão)
- Clique em **"Deploy"**

### 5. Aguarde o Deploy
- O Vercel fará o build automaticamente
- Você receberá um link como: **https://arc-testnet.vercel.app**

---

## 🔗 Links Atuais

### Local:
- **http://localhost:3000** (quando o servidor estiver rodando)

### Deploy (após configurar):
- Será fornecido pelo Vercel após o deploy

---

## 📝 Notas Importantes

1. **Localhost** só funciona no seu computador
2. **Vercel** cria um link público que qualquer pessoa pode acessar
3. O Vercel faz deploy automático a cada push no GitHub (se configurado)
4. O projeto já está no GitHub: `https://github.com/lucasip9638-pixel/ARC-TESTNET`

---

## ✅ Status Atual

- ✅ Código no GitHub
- ✅ Servidor local disponível em `http://localhost:3000`
- ⏳ Deploy no Vercel (fazer agora se quiser link público)

