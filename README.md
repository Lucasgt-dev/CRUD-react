# Atlas Gestao

Sistema CRUD full stack com autenticacao, dashboard e controle de acesso por perfil. O frontend foi construido com React + Vite + PrimeReact, e o backend usa Node.js, Express, MongoDB e JWT.

O codigo da aplicacao esta dentro da pasta `projeto/`, e os caminhos abaixo partem da raiz do repositorio.

## Funcionalidades

- Login com autenticacao via JWT
- Dashboard com resumo de usuarios, clientes e produtos
- CRUD de clientes com ativacao e desativacao de acesso
- CRUD de produtos com validacao de preco e estoque minimo
- Gestao de usuarios para perfis autorizados
- Interface responsiva com PrimeReact
- Seed de super usuario para liberar o primeiro acesso

## Tecnologias

- Frontend: React 19, Vite, React Router, PrimeReact e PrimeIcons
- Backend: Node.js, Express 5, Mongoose, bcryptjs, JWT, CORS e Morgan
- Banco de dados: MongoDB

## Estrutura do projeto

```text
crud-react/
|-- README.md
`-- projeto/
    |-- backend/
    |   |-- .env.example
    |   `-- src/
    |-- frontend/
    |   `-- src/
    |-- render.yaml
    `-- vite.config.js
```

## Como executar localmente

1. Clone o repositorio e entre na raiz do projeto:

```bash
git clone <url-do-repositorio>
cd crud-react
```

2. Instale as dependencias do frontend:

```bash
cd projeto
npm install
```

3. Instale as dependencias do backend:

```bash
cd backend
npm install
cd ..
```

4. Crie o arquivo `backend/.env` com base em `backend/.env.example`.

5. Ajuste as variaveis com os dados do seu ambiente:

```env
PORT=5000
MONGODB_URI=mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=troque_esta_chave_por_uma_mais_segura
SUPER_NAME=SUPER User
SUPER_EMAIL=super@admin.com
SUPER_PASSWORD=123456
CORS_ORIGIN=http://localhost:5173
```

6. Em um terminal aberto em `crud-react/projeto/backend`, inicie o backend:

```bash
npm run dev
```

7. Em outro terminal aberto em `crud-react/projeto`, inicie o frontend:

```bash
npm run dev
```

8. Acesse a aplicacao em `http://localhost:5173`.

## Primeiro acesso

Depois de configurar o `.env`, sincronize o super usuario:

```bash
cd crud-react/projeto/backend
npm run seed:super
```

Use o `SUPER_EMAIL` e o `SUPER_PASSWORD` definidos no `.env` para entrar no sistema.

## Variaveis de ambiente

### Backend

| Variavel | Obrigatoria | Descricao |
| --- | --- | --- |
| `PORT` | Nao | Porta do servidor. O padrao local e `5000`. |
| `MONGODB_URI` | Sim | String de conexao com o MongoDB. |
| `JWT_SECRET` | Sim | Chave usada para assinar os tokens JWT. |
| `SUPER_NAME` | Sim | Nome do usuario super criado pelo seed. |
| `SUPER_EMAIL` | Sim | E-mail do usuario super. |
| `SUPER_PASSWORD` | Sim | Senha do usuario super. |
| `CORS_ORIGIN` | Sim | Lista de origens permitidas, separadas por virgula. |

### Frontend

O frontend aceita a variavel opcional abaixo:

| Variavel | Obrigatoria | Descricao |
| --- | --- | --- |
| `VITE_API_URL` | Nao | URL base da API. Sem ela, o frontend usa `http://localhost:5000/api`. |

## Regras de negocio importantes

- Usuarios e clientes so podem ser excluidos quando estiverem com acesso desativado.
- Produtos exigem pelo menos `1` unidade em estoque.
- O perfil `super` nao pode ser criado, editado ou removido pelo CRUD comum.
- O endpoint `GET /health` pode ser usado para health check da API.

## Deploy

O repositorio ja inclui `projeto/render.yaml` com configuracao para publicar o backend no Render.

Para o backend em producao, configure pelo menos:

- `MONGODB_URI`
- `JWT_SECRET`
- `SUPER_PASSWORD`
- `CORS_ORIGIN`

Depois de publicar a API, configure o frontend com:

```env
VITE_API_URL=https://seu-backend.onrender.com/api
```

## Observacao

Antes de subir o projeto para producao, troque os valores de exemplo do `.env`, principalmente `JWT_SECRET` e `SUPER_PASSWORD`.
