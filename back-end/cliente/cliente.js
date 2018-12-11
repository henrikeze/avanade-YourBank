const mongoose = require('mongoose');

const ClienteSchema = mongoose.Schema({
    nome: String,
    senha:  {
        type: String,
        required: true,
        select: false
    },
    cpf: {  
        type: Number,
        unique: true,
        required: true,
    },
    agencia: Number,
    conta: Number,
    saldo: Number,
    transferencia: [{
        agencia: Number,
        conta: Number,
        valor: Number,
        data: Date,
        tipo: Boolean
    }]
})

module.exports = mongoose.model('Cliente', ClienteSchema);
