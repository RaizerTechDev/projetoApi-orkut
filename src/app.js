//  Importando as dependências necessárias para a aplicação, como dotenv para carregar variáveis de ambiente.
require("dotenv").config();
//  Importando express para criar o servidor e definir as rotas da API, permitindo que a aplicação responda a requisições HTTP e forneça os recursos necessários para o frontend interagir com o backend.
const express = require("express");
//  Importando o pool de conexões do banco de dados para executar consultas SQL, permitindo que a aplicação interaja com o banco de dados para armazenar e recuperar informações de usuários e posts.
const pool = require("./config/db");
// Importando os middlewares de validação post e usuarios para garantir que os dados enviados nas requisições estejam no formato correto e atendam aos requisitos necessários, melhorando a robustez e a segurança da aplicação.
const validarPost = require("./validacao/post");
const validarUsuarios = require("./validacao/usuarios");
// Importando jsonwebtoken para criar e verificar tokens JWT, permitindo a autenticação segura dos usuários e o controle de acesso às rotas protegidas da aplicação.
const jwt = require("jsonwebtoken");
//  Importando o middleware de autenticação para proteger as rotas de criação, atualização e exclusão de posts, garantindo que apenas usuários autenticados possam realizar essas ações, aumentando a segurança da aplicação. 
const auth = require("./auth/authLogin");
// Importando bcrypt para criptografar as senhas dos usuários, garantindo que as senhas sejam armazenadas de forma segura no banco de dados, dificultando o acesso não autorizado mesmo que o banco de dados seja comprometido.
const bcrypt = require("bcrypt");
// Importando crypto para gerar tokens de autenticação seguros, garantindo que os tokens sejam únicos e difíceis de serem adivinhados, aumentando a segurança da autenticação dos usuários.
const crypto = require("crypto");
// Garantindo o CORS para permitir que o frontend acesse a API sem problemas de política de mesma origem, garantindo que as requisições sejam feitas de forma segura e controlada.
const cors = require("cors");


const app = express();
app.use(express.json());

app.use(cors());

app.use(express.static("public"));

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR", {
    timeZone: "America/Bahia",
  });
}

// Rota Cadastro novo usuário
app.post("/usuarios", validarUsuarios, async (req, res) => {
  try {
    const {nome, email, senha} = req.body;

    const senhaHash = await bcrypt.hash(senha, 10)

    const resultado = await pool.query(`
      INSERT INTO usuarios (nome, email, senha)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
    [nome, email, senhaHash]
  );
  res.status(201).json({
    mensagem: "Usuário criado com sucesso",
    usuario: resultado.rows[0]
  })
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao criar usuário"
    })
  }
})

//Rota de Login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body; //Atualizar corpo da requisição
  try {
    // Executar codigo sql
    const usuario = await pool.query(
      `
      SELECT * FROM usuarios WHERE email=$1
    `,
      [email],
    );

    // Condicional para verificar as infprmações do usuário como array de objetos
    if (usuario.rows.length === 0) {
      return res.status(400).json({
        mensagem: "Usuário não encontrado",
      });
    }
    // Verificar a senha usando bcrypt.compare, que compara a senha fornecida com a senha hash armazenada no banco de dados. Ele retorna true se as senhas corresponderem e false caso contrário. Isso é importante para garantir que a senha seja verificada de forma segura, sem expor a senha original.
    const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);
    // Condicional para verificar se a senha é válida, se não for, retornar status 400 e mensagem de senha inválida
    if (!senhaValida) {
      return res.status(400).json({
        mensagem: "Senha inválida",
      });
    }
    // declarando o token e emitir que a pessoa tenha acesso a area restrita com sign
    const token = jwt.sign(
      { id: usuario.rows[0].id }, // Verificar as informações com ID, usando payload
      process.env.JWT_SECRET, // chave secreta no .env
      { expiresIn: "1h" }, // expira em 1h
    );

    res.json({ token });

  } catch (error) { 
    res.status(500).json({
      mensagem: "Erro interno do servidor",
    });
  }
});

// Rota para solicitar novo token por email para resetar senha
app.post("/reset-senha", async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await pool.query(
      "SELECT * FROM usuarios WHERE email=$1",
      [email]
    );

    if (usuario.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado",
      });
    }

    // 🔥 gerar token
    const token = crypto.randomBytes(32).toString("hex");
//  🔥 definir expiração do token para 1 hora 
    const expira = new Date(Date.now() + 3600000); // 1h

    await pool.query(
      `UPDATE usuarios 
       SET reset_token=$1, reset_token_expira=$2 
       WHERE email=$3`,
      [token, expira, email]
    );

    // 🚨 aqui no mundo real você enviaria email
    res.json({
      mensagem: "Token gerado",
      token, // só pra teste
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Erro ao solicitar reset",
    });
  }
});

//Rota: redefinir senha
app.patch("/usuarios/reset-senha", async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    const usuario = await pool.query(
      `SELECT * FROM usuarios 
       WHERE reset_token=$1 
       AND reset_token_expira > NOW()`,
      [token]
    );

    if (usuario.rows.length === 0) {
      return res.status(400).json({
        mensagem: "Token inválido ou expirado",
      });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await pool.query(
      `UPDATE usuarios 
       SET senha=$1, reset_token=NULL, reset_token_expira=NULL 
       WHERE id=$2`,
      [senhaHash, usuario.rows[0].id]
    );

    res.json({
      mensagem: "Senha atualizada com sucesso",
    });

  } catch (erro) {
    console.error(erro);
    res.status(500).json({
      erro: "Erro ao resetar senha",
    });
  }
});

// Rota de teste para verificar se o servidor tá rodando
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <title>API Orkut</title>

       <link rel="icon" type="image/png" href="/favicon.png" /> 
      <link rel="stylesheet" href="/css/style.css">
    </head>
    
    <body>
      <div class="container">
        <h1>🚀 API Orkut - Rede Social Backend</h1>

        <p>
          API REST desenvolvida com Node.js, Express e PostgreSQL,
          simulando uma rede social completa com autenticação JWT,
          CRUD de usuários e postagens.
        </p>

        <div class="links">
          <a href="/usuarios" target="_blank">👤 Ver Usuários</a>
          <a href="/posts" target="_blank">📝 Ver Postagens</a>
        </div>

       <div class="techs">
  <h4>
    🔐 <a href="https://jwt.io/" target="_blank">JWT</a> |
    🗄️ <a href="https://www.postgresql.org/" target="_blank">PostgreSQL</a> |
    ⚡ <a href="https://nodejs.org/" target="_blank">Node.js</a>
  </h4>
</div>
      </div>  

       <fotter class="footer">
        <p>Desenvolvido por Rafael Raizer - 2026</p>
      </fotter>
    </body>
       
    </html>
  `);
});

// Buscar a Rota GET com usuários
app.get("/usuarios", async (req, res) => {
  try {
    const resultado = await pool.query(`
            SELECT id, nome, email, criado_em FROM usuarios;
        `);
    // Retornar informações de resultados de um array de objetos e dados com row
    res.json(resultado.rows);
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar dados de usuários" });
  }
});

// Buscar a Rota GET com posts
app.get("/posts", async (req, res) => {
  // Executar códigos sql e unir com join
  try {
    const resultado = await pool.query(`
               SELECT 
            usuarios.id AS usuarios_id,            
            usuarios.nome,           
            post.titulo,
            post.conteudo,
            post.criado_em,
            post.id AS post_id
            FROM post
            JOIN usuarios
            ON post.usuario_id = usuarios.id
           ORDER BY usuarios.id DESC
        `);

    const dados = resultado.rows.map((post) => ({
      ...post,
      criado_em: formatarData(post.criado_em),
    }));

    // Retornar informações de resultados de um array de objetos e dados com row
    post: (resultado.rows[0], res.json(dados));
  } catch (erro) {
    res.status(500).json({ erro: "Erro ao buscar postagens" });
  }
});

// Criando a Rota POST
app.post("/posts", auth, validarPost, async (req, res) => {
  try {
    const { titulo, conteudo } = req.body;
    const resultado = await pool.query(
      `
      INSERT INTO post (titulo, conteudo, usuario_id)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [titulo, conteudo, req.usuario.id],
    );
    res.status(201).json({
      mensagem: "Post criado com sucesso",
      post: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao criar postagem",
    });
  }
});

// Atualizando a Rota PUT    
app.put("/posts/:id", auth, validarPost, async (req, res) => {
  try {
    const { id } = req.params; // Atualizar id por parametros
    const { titulo, conteudo } = req.body; //Atualizar corpo da requisição

    // Verificar se o post existe com ID e conseguir converter sql em VALUES com filtragem ou segurança $ e RETURNING
    const post = await pool.query(`SELECT * FROM post WHERE id=$1`, [id]);
    // Se o post não existir, retornar status 404 e mensagem de post não encontrado
    if (post.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Post não encontrado",
      });
    }

    // Verificar se o usuário é o dono do post com ID do usuário e do post, senão, retornar status 403 e mensagem de acesso negado
    if (post.rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({
        mensagem: "Sem permissão",
      });
    }

    // Atualizar o post com ID e conseguir converter sql em VALUES com filtragem ou segurança $ e RETURNING
    const resultado = await pool.query(
      `UPDATE post SET titulo=$1, conteudo=$2 WHERE id=$3 RETURNING *`,
      [titulo, conteudo, id],
    );
    // Retornar status e mensagem
    res.status(200).json({
      mensagem: "Post atualizado com sucesso",

      // Retornar informações de resultados de um array de objetos e dados com row
      post: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao atualizar post",
    });
  }
});

// Excluindo ROTA DELETE usuarios
app.delete("/usuarios/:id", auth, async (req, res) => {
  try {
    const { id } = req.params; // Atualizar id por parametros

    // Verificar se o usuario existe com ID e conseguir converter sql em VALUES com filtragem ou segurança $ e RETURNING
    const usuario = await pool.query(`SELECT * FROM usuarios WHERE id=$1`, [id]);

    // Se o usuário não existir, retornar status 404 e mensagem de usuário não encontrado
    if (usuario.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Usuário não encontrado",
      });
    }

    // Deletar com ID e conseguir converter sql em VALUES com filtragem ou segurança $ e RETURNING
    const resultado = await pool.query(
      `DELETE FROM usuarios WHERE id=$1 RETURNING *`,
      [id],
    );

    // Retornar status e mensagem
    res.json({
      mensagem: "Usuário deletado com sucesso",

      // Retornar informações de resultados de um array de objetos e dados com row
      usuario: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao deletar usuário",
    });
  }
});

// Excluindo ROTA DELETE posts
app.delete("/posts/:id", auth, async (req, res) => {
  try {
    const { id } = req.params; // Atualizar id por parametros

    // Verificar se o post existe com ID e conseguir converter sql em VALUES com filtragem ou segurança $ e RETURNING
    const post = await pool.query(`SELECT * FROM post WHERE id=$1`, [id]);

    // Se o post não existir, retornar status 404 e mensagem de post não encontrado
    if (post.rows.length === 0) {
      return res.status(404).json({
        mensagem: "Post não encontrado",
      });
    }

    // Verificar se o usuário é o dono do post com ID do usuário e do post, senão, retornar status 403 e mensagem de acesso negado
    if (post.rows[0].usuario_id !== req.usuario.id) {
      return res.status(403).json({
        mensagem: "Sem permissão",
      });
    }

    // Deletar com ID e conseguir converter sql em VALUES com filtragem ou segurança $ e RETURNING
    const resultado = await pool.query(
      `DELETE FROM post WHERE id=$1 RETURNING *`,
      [id],
    );

    // Retornar status e mensagem
    res.json({
      mensagem: "Post deletado com sucesso",

      // Retornar informações de resultados de um array de objetos e dados com row
      post: resultado.rows[0],
    });
  } catch (erro) {
    res.status(500).json({
      erro: "Erro ao deletar post",
    });
  }
});

module.exports = app;
