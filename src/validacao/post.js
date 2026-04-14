const Joi = require('joi')

const postSchema = Joi.object({
    titulo: Joi.string().min(3).required().messages({
        "string.empty": "O Título é obrigatório",
        "string.min": "O Título deve ter no minimo 3 caracteres",
        "any.required": "O título é obrigatório!"
    }),

        conteudo: Joi.string().min(5).required().messages({
        "string.empty": "O Conteúdo é obrigatório",
        "string.min": "O Conteúdo deve ter no minimo 5 caracteres",
        "any.required": "O conteúdo é obrigatório!"
    }),

    //     usuario_id: Joi.number().integer().required().messages({
    //     "number.base": "O usuário_id deve ser um número",
    //     "number.integer": "O usuário_id deve ser número inteiro",
    //     "any.required": "O usuário_id é obrigatório!"
    // })
})

 function validarPost(req, res, next) {
    const {error} = postSchema.validate(req.body, {abortEarly: false}) // abortEarly: false é importante pois já trás todos os erros, ao invés de 1 por vez. 

    if(error) {       
       console.log(error); 
        return res.status(400).json ({
            erro: error.details.map(e => e.message)
        })        
    }
    next()
 }

 module.exports = validarPost;


