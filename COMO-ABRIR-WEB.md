# 🌐 Como Abrir a Aplicação na Web

## ✅ Método Rápido (Recomendado)

### Opção 1: Usar o Script Automático
1. Clique duas vezes no arquivo: **`ABRIR-WEB-CORRIGIDO.bat`**
2. Aguarde o servidor iniciar (20-30 segundos)
3. O navegador abrirá automaticamente em: **http://localhost:3000**

### Opção 2: Manualmente no Terminal
1. Abra PowerShell ou CMD na pasta do projeto
2. Execute:
   ```bash
   npm run dev
   ```
3. Aguarde aparecer: `✓ Ready in X.Xs`
4. Abra o navegador e acesse: **http://localhost:3000**

---

## 🔧 Se Não Funcionar

### Problema: Porta 3000 ocupada
```bash
# Parar processos Node.js
taskkill /F /IM node.exe

# Ou usar porta diferente
npm run dev -- -p 3001
```

### Problema: Erros de compilação
```bash
# Limpar cache e reinstalar
rmdir /s /q .next
rmdir /s /q .turbo
npm install --legacy-peer-deps
npm run dev
```

### Problema: Turbo não funciona
```bash
# Usar modo webpack (mais lento mas mais estável)
npm run dev:webpack
```

---

## 📋 Checklist

- [ ] Node.js instalado (`node --version`)
- [ ] Dependências instaladas (`node_modules` existe)
- [ ] Nenhum processo Node.js rodando na porta 3000
- [ ] Servidor iniciado e mostrando "Ready"
- [ ] Navegador acessando http://localhost:3000

---

## 🚀 Links

- **Local**: http://localhost:3000 (quando servidor estiver rodando)
- **Produção**: Faça deploy no Vercel para obter link público

---

## ⚠️ Importante

- **MANTENHA** a janela do terminal aberta enquanto usar a aplicação
- Para parar o servidor, pressione `Ctrl+C` no terminal
- O servidor precisa estar rodando para acessar o site

