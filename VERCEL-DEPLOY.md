# 🚀 Configuração Vercel - Deploy Automático

## ✅ Status Atual

- **Site Deployado**: https://arc-testnet-sdsz.vercel.app/
- **Repositório GitHub**: https://github.com/lucasip9638-pixel/Arc--testnet
- **Deploy Automático**: Configurado ✅

## 🔗 Como Funciona

O Vercel está conectado ao seu repositório GitHub e faz deploy automático sempre que você fizer `git push` para a branch `main`.

## 📋 Passos para Configurar (se ainda não estiver configurado)

### 1. Acesse o Vercel
👉 https://vercel.com

### 2. Faça Login
- Use sua conta GitHub para fazer login

### 3. Adicione Novo Projeto
- Clique em **"Add New Project"**
- Selecione o repositório: `lucasip9638-pixel/Arc--testnet`
- Clique em **"Import"**

### 4. Configure o Projeto
- **Framework Preset**: Next.js (detectado automaticamente)
- **Root Directory**: `./` (padrão)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install --legacy-peer-deps`

### 5. Variáveis de Ambiente (se necessário)
Se precisar de variáveis de ambiente, adicione em:
- **Settings** → **Environment Variables**

Exemplo (se necessário):
- `NEXT_PUBLIC_CONTRACT_ADDRESS` (se usar variável de ambiente)

### 6. Deploy
- Clique em **"Deploy"**
- Aguarde o build completar
- Seu site estará disponível em: `https://arc-testnet-sdsz.vercel.app/`

## 🔄 Deploy Automático

Após configurar, cada vez que você fizer:
```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

O Vercel automaticamente:
1. Detecta as mudanças no GitHub
2. Faz o build do projeto
3. Faz deploy da nova versão
4. Atualiza o site em alguns minutos

## 📝 Verificar Deploy

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto `Arc--testnet`
3. Veja o histórico de deploys
4. Cada commit terá um deploy automático

## 🔧 Configuração Atual

- **Arquivo**: `vercel.json` criado
- **Build Command**: `npm run build`
- **Install Command**: `npm install --legacy-peer-deps`
- **Framework**: Next.js (detectado automaticamente)

## ✅ Próximos Passos

1. Certifique-se de que o repositório está conectado no Vercel
2. Faça um teste: faça uma pequena mudança e faça push
3. Verifique se o deploy automático funciona

## 🎯 Links Importantes

- **Dashboard Vercel**: https://vercel.com/dashboard
- **Site Deployado**: https://arc-testnet-sdsz.vercel.app/
- **Repositório**: https://github.com/lucasip9638-pixel/Arc--testnet

