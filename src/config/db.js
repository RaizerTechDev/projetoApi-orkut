// Criar conexão com pool para se cominicar ao banco de dados
const {Pool} = require('pg')

module.exports = new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }       
})
