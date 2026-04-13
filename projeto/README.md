# Projeto

A documentacao principal do repositorio esta no [README da raiz](../README.md).

## Comandos rapidos

Os comandos abaixo partem da raiz do repositorio.

Frontend:

```bash
cd projeto
npm run dev
```

Backend:

```bash
cd projeto/backend
npm run dev
```

Seed do super usuario:

```bash
cd projeto/backend
npm run seed:super
```

## Deploy seguro na Vercel

1. Suba para o GitHub somente os arquivos do projeto.
   Os arquivos `.env` locais ja estao ignorados no [`projeto/.gitignore`](./.gitignore).

2. Na Vercel, importe o repositorio e configure:

```text
Root Directory: projeto
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

3. Crie a variavel de ambiente do frontend na Vercel:

```env
VITE_API_URL=https://SEU-BACKEND.onrender.com/api
```

4. Como o backend esta no Render, mantenha o `CORS_ORIGIN` com a URL publicada do frontend:

```env
http://localhost:5173,https://atlas-gestao.vercel.app
```

5. Depois de configurar as variaveis, faca um novo deploy na Vercel.
