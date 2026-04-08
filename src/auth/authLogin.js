const jwt = require("jsonwebtoken");

// declarar autenticação com token
const auth = (req, res, next) => {
  const token = req.headers.authorization; // Armazenar no header da requisição

  // Condicional se não houver token, indica falha na requisição com status 401
  if (!token) {
    return res.status(401).json({
      mensagem: "Sem token",
    });
  }

  try {
    // Declararação da decodificação do payload que tá no arquivo app.js e vai verificar o token com bearer através do split e processando a chave secreta do .env
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.usuario = decoded; // requisição do usuario recebendo a decodificação
  
    next();

  } catch (error) {        
    return res.status(401).json({
      mensagem: "Token inválido",
    });
  }
};

module.exports = auth;
