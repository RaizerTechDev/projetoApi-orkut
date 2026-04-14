![Banner](https://capsule-render.vercel.app/api?type=waving&color=0:7b1fa2,100:e040fb&height=200&section=header&text=API%20Orkut&fontSize=40&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Uma%20API%20inspirada%20na%20rede%20social%20clássica&descAlignY=55&descSize=16)

# 🚀 API Orkut

API RESTful inspirada na clássica rede social **Orkut**, desenvolvida com foco em **arquitetura backend**, **segurança** e **boas práticas de desenvolvimento**.

O projeto simula funcionalidades essenciais de uma rede social, incluindo autenticação, gerenciamento de usuários e publicações, utilizando **Node.js**, **Express** e **PostgreSQL**.

---

## 🛠️ Tecnologias Utilizadas

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-47A248?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens)
![Bcrypt](https://img.shields.io/badge/Bcrypt-003A8F?style=for-the-badge)
![Cors](https://img.shields.io/badge/CORS-FFCA28?style=for-the-badge)

---

## 🧩 Arquitetura e Conceitos Aplicados

- 🔐 **Autenticação baseada em JWT (JSON Web Token)**
- 🔑 Uso de variáveis de ambiente para segurança (`JWT_SECRET`)
- 🔒 Hash de senhas com **bcrypt**
- 🧱 Estrutura RESTful
- 🗄️ Integração com banco de dados relacional (**PostgreSQL**)
- 🛡️ Middleware de autenticação para proteção de rotas
- 🔄 Tratamento de erros e respostas padronizadas

---

## ✨ Funcionalidades

- 👤 Cadastro de usuários com senha criptografada
- 🔑 Autenticação e geração de token JWT
- 🔄 Recuperação e redefinição de senha com token temporário
- 📝 CRUD completo de posts
- 👥 Listagem de usuários
- 🔒 Controle de acesso baseado em autenticação
- 🗑️ Exclusão de usuários e posts com validação de permissões

---

## 📚 Documentação da API

**🔗 [Acessar documentação completa no Postman](https://documenter.getpostman.com/view/19569624/2sBXqCNNu3/)**

---

## 📌 Endpoints

| Método | Rota                     | Descrição                              | Autenticação |
|--------|--------------------------|----------------------------------------|--------------|
| POST   | /usuarios                | Criação de usuário                     | ❌           |
| POST   | /login                   | Autenticação e geração de token JWT    | ❌           |
| GET    | /                        | Health check da API                    | ❌           |
| GET    | /usuarios                | Listagem de usuários                   | ❌           |
| GET    | /posts                   | Listagem de posts                      | ❌           |
| POST   | /posts                   | Criação de post                        | ✅           |
| PUT    | /posts/:id               | Atualização de post                    | ✅           |
| DELETE | /usuarios/:id            | Remoção de usuário                     | ✅           |
| DELETE | /posts/:id               | Remoção de post                        | ✅           |

---

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)** para controle de acesso.

Após autenticação via `/login`, o cliente deve incluir o token no header das requisições protegidas:

```http
Authorization: Bearer <seu_token_jwt>

```

O token é validado utilizando a chave secreta definida em variável de ambiente (JWT_SECRET).

---

## 📥 Exemplos de Requisição

Criar usuário
```
{
  "nome": "Rafael",
  "email": "rafael@email.com",
  "senha": "123456"
}
```

Login
```
{
  "email": "rafael@email.com",
  "senha": "123456"
}
```

Criar post (rota protegida)
```
{
  "titulo": "Meu primeiro post",
  "conteudo": "Conteúdo do post aqui..."
}
```

## 📤 Resposta

*Sucesso ao criar usuário (201)*
```
{
  "mensagem": "Usuário criado com sucesso",
  "usuario": {
    "id": 1,
    "nome": "Rafael",
    "email": "rafael@email.com"
}
  ```

*Sucesso no login*
```
{
  "token": "jwt_token_aqui"
}
```

*Post criado com sucesso*
```
{
  "mensagem": "Post criado com sucesso",
  "post": {
    "id": 1,
    "titulo": "Meu primeiro post",
    "conteudo": "Conteúdo do post",
     "usuario_id": 2    
  } 
}
```

## ⚙️ Como Executar Localmente

### Clone o repositório
```
git clone https://github.com/RaizerTechDev/projetoApi-orkut.git
```

### Acesse a pasta
```
cd projetoApi-orkut
```

### Instale as dependências
```
nnpm install express dotenv cors jsonwebtoken bcrypt
npm install nodemon --save-dev

```

### Execute o projeto
```
npm run dev
```

## 🔐 Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto:
```
PORT=3000

DATABASE_URL=sua_connection_string_postgres

JWT_SECRET=sua_chave_secreta
```

## ☁️ Deploy

A aplicação está disponível em produção via Render:

🔗 https://projetoapi-orkut-p1dn.onrender.com/

---


<br>

## **👨‍💻 Autor**

Projeto desenvolvido para prática de **CRUD com API REST**.

<table>
<tr>
  <td align="center">
    <img src="https://avatars.githubusercontent.com/u/87991807?v=4" width="80" />
  </td>
  <td>
    **RafaRaizer-Dev** <br>
    <a href="https://api.whatsapp.com/send/?phone=47999327137">📱 WhatsApp</a> | 
    <a href="https://www.linkedin.com/in/raizer-rafael/">💼 LinkedIn</a> | 
    <a href="https://github.com/RaizerTechDev">🐱 GitHub</a> | 
    <a href="https://raizertechdev-portfolio.netlify.app/">🌐 Portfólio</a>