# Como Deletar Repositórios no GitHub

## Limite de Repositórios
O GitHub tem um limite de 10 repositórios para contas gratuitas. Se você tem mais de 10, precisa deletar alguns.

## Passo a Passo para Deletar Repositórios

### Método 1: Via Interface Web do GitHub

1. **Acesse o GitHub:**
   - Vá para: https://github.com/lucasip9638-pixel
   - Faça login na sua conta

2. **Veja seus repositórios:**
   - Clique em "Repositories" no topo
   - Você verá todos os seus repositórios

3. **Selecione o repositório para deletar:**
   - Clique no repositório que deseja deletar
   - **IMPORTANTE:** Certifique-se de que não é o `ARC-TESTNET` (seu projeto principal)

4. **Acesse as configurações:**
   - Clique na aba "Settings" (no topo do repositório)
   - Role até o final da página

5. **Deletar o repositório:**
   - Na seção "Danger Zone" (Zona de Perigo)
   - Clique em "Delete this repository"
   - Digite o nome do repositório para confirmar
   - Clique em "I understand the consequences, delete this repository"

### Método 2: Via GitHub CLI (se instalado)

```bash
# Listar seus repositórios
gh repo list lucasip9638-pixel

# Deletar um repositório (substitua NOME-DO-REPO)
gh repo delete lucasip9638-pixel/NOME-DO-REPO --yes
```

## Repositório Principal (NÃO DELETAR)
- ✅ **ARC-TESTNET** - Este é o projeto principal, NÃO DELETE!

## Repositórios que Podem ser Deletados
Deletar apenas repositórios que você não usa mais. Verifique antes de deletar:
- Repositórios de teste
- Repositórios antigos não utilizados
- Repositórios duplicados

## Atenção!
⚠️ **CUIDADO:** Uma vez deletado, o repositório e todo o código serão perdidos permanentemente (a menos que você tenha backup local).

## Verificar Quantos Repositórios Você Tem

1. Vá para: https://github.com/lucasip9638-pixel?tab=repositories
2. Conte quantos repositórios aparecem
3. Se tiver mais de 10, delete os que não são mais necessários

## Após Deletar
Depois de deletar os repositórios extras, você poderá:
- Continuar usando o GitHub normalmente
- Criar novos repositórios (até o limite de 10)
- Trabalhar no projeto ARC-TESTNET sem problemas

