// Arquivo seed com funcao para criar varios usuarios

const express = require('express');
const app = express();
const Cliente = require('./cliente/cliente')
const ClienteController = require('./cliente/clienteController');
const Mongoose = require('mongoose');
Mongoose.connect('mongodb://localhost:27017/yourbank', { useNewUrlParser: true });
const db = Mongoose.connection;


app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*")
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});


//Rotas
app.use('/clientes', ClienteController);
app.use('/api/auth', ClienteController);
app.use('/me', ClienteController)
app.use('/login', ClienteController)

//
db.once('open', async function callback() {
    console.log('Conexão com o banco de dados ativa - carregando setup inicial');
    await this.dropDatabase();
    setupInicial()
});

async function setupInicial() {

    for (let i = 0; i < 10; i++) {
        let cliente = {
            nome: "Cliente " + i,
            senha: "senha1",
            cpf: "1111111111" + i,
            agencia: 1111,
            conta: 11111 + i,
            saldo: 1000
        }
        await Cliente.create(cliente);
    }
    console.log("Setup inicial finalizado, clientes iniciais criados")
}

app.listen(3000, function () {
    console.log("API YourBank na porta 3000, aguarde o setupInicial")
});
