# 📁 Arquivos Principais do Projeto

## 🎯 Estrutura do Projeto

### Frontend (Next.js)
```
app/
├── layout.tsx          # Layout principal da aplicação
├── page.tsx            # Página inicial
└── globals.css         # Estilos globais

components/
├── defi-app.tsx        # Componente principal do DeFi Hub
├── daily-gm.tsx        # Componente Daily GM
├── token-swap-real.tsx # Componente de Swap de Tokens
├── send-token.tsx      # Componente para enviar tokens
├── network-selector.tsx # Seletor de rede
└── ui/                 # Componentes UI (shadcn/ui)

lib/
├── wagmi-config.ts     # Configuração Wagmi/Viem
├── daily-gm-contract.ts # Configuração contrato DailyGM
├── swap-contract.ts    # Configuração contrato Swap
├── tokens.ts           # Endereços dos tokens
└── utils.ts            # Utilitários

hooks/
├── use-wallet.ts       # Hook para carteira
└── use-toast.ts        # Hook para notificações

contracts/
├── DailyGM.sol         # Contrato Daily GM
├── TokenSwap.sol       # Contrato Swap
└── Staking.sol         # Contrato Staking

scripts/
└── deploy-*.js         # Scripts de deploy

public/                 # Assets públicos
```

## 📄 Arquivos de Configuração

- `package.json` - Dependências e scripts
- `tsconfig.json` - Configuração TypeScript
- `next.config.mjs` - Configuração Next.js
- `tailwind.config.js` - Configuração Tailwind CSS
- `hardhat.config.ts` - Configuração Hardhat
- `.gitignore` - Arquivos ignorados pelo Git

## 🔗 Links Importantes

- **Live Demo**: https://arc-testnet-sdsz.vercel.app/
- **GitHub**: https://github.com/lucasip9638-pixel/ARC-DeFi-Hub
- **Arc Testnet Explorer**: https://testnet.arcscan.app
- **Arc Network**: https://www.arc.network/

## 🚀 Deploy

O projeto está configurado para deploy automático no Vercel através do GitHub.

