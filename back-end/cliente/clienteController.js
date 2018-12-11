const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const VerifyToken = require('./VerifyToken');
const Cliente = require('./cliente');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Configuração do JWT
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const bcrypt = require('bcryptjs');
const config = require('../config') // get config file

// Rota para registro/criar cliente
router.post('/register', function (req, res) {
    // pega a senha digitada e converte em hash
    let hashedPassword = bcrypt.hashSync(req.body.senha, 8);
    Cliente.create({
        nome: req.body.nome,
        senha: hashedPassword,
        cpf: req.body.cpf,
        agencia: req.body.agencia,
        conta: req.body.conta,
        saldo: req.body.saldo,
        transferencia: [{
            conta: Number,
            valor: req.body.valor,
            data: new Date(),
            tipo: req.body.tipo,
        }]
    },
        function (err, cliente) {
            if (err) return res.status(500).send("There was a problem adding the information to the database.");
            res.status(200).send(cliente);
        });
});

// Autenticacao de login
// http://localhost:3000/api/auth/login
router.post('/login', function (req, res) {

    Cliente.findOne({ cpf: req.body.cpf }, function (err, user) {
        if (err) return res.status(500).send('Problema status 500.');
        if (!user) return res.status(404).send('Usuario nao encontrado.');
        // Aqui checaria se o hash do password está certo
        //var passwordIsValid = bcrypt.compare(req.body.senha, user.senha);
        //if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

        // Se o usuario foi encontrado e o hash da senha é valido cria um token
        var token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: 86400 // expira em 24horas
        });

        // Retorna as infos do cliente e o token
        res.status(200).send({ cliente: user, auth: true, token: token });
    });
});

// Rota para verificar o token 
router.get('/me', VerifyToken, function (req, res, next) {
    // Senha 0 omitindo a senha 
    Cliente.findById(req.userId, { senha: 0 }, function (err, user) {
        if (err) return res.status(500).send("Problema status 500");
        if (!user) return res.status(404).send("Usuario nao encontrado.");
        res.status(200).send(user);
    });

});

// Retorna um cliente pelo CPF
router.get('/cliente/:cpf', function (req, res) {

    Cliente.findOne({ cpf: req.params.cpf }, function (err, cliente) {
        if (err) return res.status(500).send("Problema status 500.");
        if (!cliente) return res.status(404).send("Usuario nao encontrado.");
        res.status(200).send(cliente);
    });
});

// Retorna os dados do cliente para confirmar transferencia
router.get('/cliente/:agencia/:conta', function (req, res) {

    Cliente.findOne({ agencia: req.params.agencia, conta: req.params.conta }, function (err, cliente) {
        if (err) return res.status(500).send("Problema status 500.");
        if (!cliente) return res.status(404).send("Usuario nao encontrado.");
        res.status(200).send(cliente);
    });
});

// Cria uma transferencia
router.put('/cliente/:cliente/:cpf', function (req, res) {
    let transf = req.body;
    let ultimaTransf = transf.transferencia[transf.transferencia.length - 1]
    // Aumenta o saldo de quem recebeu e cria uma nova transferencia
    Cliente.update(
        { "cpf": transf.cpf },
        { "$set": { saldo: transf.saldo } }, function (err, cliente) {
            if (err) return res.status(500).send("Problema status 500.");
            res.status(200).send();
        });
    Cliente.update(
        { "cpf": transf.cpf },
        { "$push": { "transferencia": ultimaTransf } }, function (err, cliente) {
            if (err) return res.status(500).send("Problema status 500.");
            res.status(200).send();
        });
    // Cria a transferência reversa para quem fez a transferência
    ultimaTransf.tipo = false;

    Cliente.update(
        { "cpf": req.params.cpf },
        { "$push": { "transferencia": ultimaTransf } }, function (err, cliente) {
            if (err) return res.status(500).send("Problema status 500.");
            res.status(200).send();
        });
})

// Retira valor do saldo de quem fez a transferencia
router.post('/cliente/:cpf/:valor', function (req, res) {
    Cliente.update(
        { "cpf": req.params.cpf },
        { "$set": { saldo: req.params.valor } }, function (err, cliente) {
            if (err) return res.status(500).send("Problema status 500.");
            res.status(200).send();
        });
})

module.exports = router;