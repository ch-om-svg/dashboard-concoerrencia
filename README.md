# Dashboard de Concorrência (91 Marcas)

Inteligência competitiva, benchmarking e monitorização de 91 marcas internacionais organizadas em 3 secções:
- **1. Sapatos** (31 marcas, incluindo DIPLOMATIC)
- **2. Botas** (30 marcas)
- **3. Malas & Acessórios** (30 marcas)

---

## 🔒 Segurança & Privacidade
- **Acesso com Palavra-passe:** O dashboard está protegido por uma tela de login de luxo.
  - Palavra-passe predefinida: `concorrencia2026`
  - Para alterar, edite a constante `DASHBOARD_PASSWORD` ou o hash SHA-256 no início do script em `index.html`.
- **Anti-Indexação Google:**
  - `robots.txt` com `Disallow: /`
  - Meta tags `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">`
  - Cabeçalhos HTTP configurados em `vercel.json` (`X-Robots-Tag: noindex, nofollow`)

---

## 🚀 Como Colocar no GitHub e Vercel (Passo a Passo)

### 1. Criar Repositório no GitHub
1. Aceda a [github.com/new](https://github.com/new).
2. Escolha o nome do repositório (ex: `dashboard-concorrencia`).
3. Selecione **Private** (Recomendado para manter privado).
4. Não marque "Add a README file" (já temos o projeto pronto).
5. Clique em **Create repository**.

### 2. Enviar o Código Local para o GitHub
No seu terminal (PowerShell), execute os comandos abaixo (substituindo pelo link do seu repositório):

```powershell
git remote add origin https://github.com/SEU_UTILIZADOR/dashboard-concorrencia.git
git branch -M main
git push -u origin main
```

---

### 3. Fazer Deploy na Vercel (Gratuito e em 1 Minuto)
1. Aceda a [vercel.com](https://vercel.com) e inicie sessão com a sua conta GitHub.
2. Clique em **"Add New..."** → **"Project"**.
3. Selecione o repositório `dashboard-concorrencia` e clique em **"Import"**.
4. Nas configurações de deploy:
   - **Framework Preset:** `Other`
   - **Root Directory:** `./`
   - **Build & Output Settings:** Deixe os campos em branco / predefinidos (é um site estático HTML/JS super rápido).
5. Clique em **"Deploy"**.

Em cerca de 20 segundos o seu link seguro da Vercel estará ativo (ex: `https://dashboard-concorrencia.vercel.app`)!
