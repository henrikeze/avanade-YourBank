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
app.use('/login', ClienteController )

//
db.once('open', async function callback() {
	console.log('Conexão com o banco de dados ativa - carregando setup inicial');
	await this.dropDatabase();
	setupInicial()
});

async function setupInicial() {

	let cliente1 = {
		nome: "Antonio Carlos da Silva",
		senha: "senha1",
		cpf: "11111111111",
		agencia: 1111,
		conta: 111111,
		saldo: 1000,
		 transferencia: [{
			agencia: 1111,
		 	conta: 111111,
		 	valor: 500,
		 	data: new Date(),
		 	tipo: true
		 },{
			agencia: 1111,
		 	conta: 222222,
		 	valor: 2000,
		 	data: new Date(),
		 	tipo: false
		 }]
	}

	let cliente2 = {
		nome: "Maria do Carmo Souza",
		senha: "senha1",
		cpf: "22222222222",
		agencia: 1111,
		conta: 222222,
		saldo: 1000,
		 transferencia: [{
			agencia: 1111,
		 	conta: 111110,
		 	valor: 500,
		 	data: new Date(),
		 	tipo: true
		 }]
	}

	await Cliente.create(cliente1);
	await Cliente.create(cliente2);

	console.log("Setup inicial finalizado, clientes iniciais criados")
}

app.listen(3000, function () {
	console.log("API YourBank na porta 3000, aguarde o setupInicial")
});
