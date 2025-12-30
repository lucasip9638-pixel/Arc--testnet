# 🔄 Renomear Repositório no GitHub

## 📋 Instruções para Renomear

### Passo 1: Acesse o Repositório no GitHub
👉 https://github.com/lucasip9638-pixel/Arc--testnet

### Passo 2: Vá para Settings
1. Clique na aba **"Settings"** (no topo do repositório)
2. Role até a seção **"Repository name"**

### Passo 3: Renomeie o Repositório
1. No campo **"Repository name"**, digite: `ARC-DeFi-Hub`
2. Clique em **"Rename"**
3. Confirme a ação

### Passo 4: Atualize o Remote Local (Após renomear)

Após renomear no GitHub, execute no terminal:

```bash
cd "D:\arc testnet\Arc--testnet"
git remote set-url origin https://github.com/lucasip9638-pixel/ARC-DeFi-Hub.git
git remote -v  # Verificar se está correto
```

### Passo 5: Verificar

```bash
git remote -v
```

Deve mostrar:
```
origin  https://github.com/lucasip9638-pixel/ARC-DeFi-Hub.git (fetch)
origin  https://github.com/lucasip9638-pixel/ARC-DeFi-Hub.git (push)
```

## ✅ Após Renomear

- ✅ Novo nome: **ARC-DeFi-Hub**
- ✅ Novo link: https://github.com/lucasip9638-pixel/ARC-DeFi-Hub
- ✅ Todos os arquivos já foram atualizados com o novo nome
- ✅ O Vercel continuará funcionando automaticamente

## 🔗 Links Atualizados

- **GitHub**: https://github.com/lucasip9638-pixel/ARC-DeFi-Hub
- **Vercel**: https://arc-testnet-sdsz.vercel.app/ (continua o mesmo)

## ⚠️ Importante

- O nome do diretório local pode continuar como `Arc--testnet`
- Apenas o nome do repositório no GitHub será alterado
- Todos os commits e histórico serão preservados

