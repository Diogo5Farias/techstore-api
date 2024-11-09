const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require('dotenv').config();
const PORT = 3004;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

console.log(process.env.DB_HOST);

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});

app.get('/', (req, res) => {
    res.send('Bem-vindo ao servidor da TechStore!');
})

app.get('/categorias', (req, res) => {
    return db.query('SELECT * FROM categoria', (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return;
        }
        console.log('Data fetched successfully:', result);
        res.status(200).send(result);
    })
})

app.post('/categorias', (req, res) => {
    const { nome } = req.body;
    const insertNovaCategoria ='INSERT INTO categoria (nome) VALUES (?);';
    db.query(insertNovaCategoria, [nome], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(422).send('Não foi possível inserir os dados');
            return;
        }
        console.log('Data inserted successfully:', result);
        res.status(201).send('Dados inseridos com sucesso!');
    });
})

app.get('/produtos', (req, res) => {
    return db.query('SELECT * FROM produto', (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return;
        }
        console.log('Data fetched successfully:', result);
        res.send(result);
    })
})

app.post('/produtos', (req, res) => {
    const { nome, preco, categoriaId } = req.body;
    const insertNovoProduto ='INSERT INTO produto (nome, preco, categoriaId) VALUES (?, ?, ?);';
    db.query(insertNovoProduto, [nome, preco, categoriaId], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(422).send(`Não foi possível inserir ${[nome, preco, categoriaId]}`);
            return;
        }
        res.status(201).send('Dados inseridos com sucesso!');
    });
})

app.get('/pedidos', (req, res) => {
    return db.query('SELECT * FROM pedido', (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return;
        }
        console.log('Data fetched successfully:', result);
        res.status(200).send(result);
    })
})

app.post('/pedidos', (req, res) => {
    const { produtoId, quantidade, dataPedido } = req.body;
    const insertNovoPedido ='INSERT INTO pedido (produtoId, quantidade, dataPedido) VALUES (?, ?, ?);';
    db.query(insertNovoPedido, [produtoId, quantidade, dataPedido], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(422).send('Não foi possível inserir os dados');
            return;
        }
        res.status(201).send('Dados inseridos com sucesso!');
    });
})

app.post('/register', (req, res) => {
    const { email, senha } = req.body;
    const insertNovoUsuario ='INSERT INTO usuario (email, senha) VALUES (?, ?);';
    db.query(insertNovoUsuario, [email, senha], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            res.status(422).send('Não foi possível inserir os dados');
            return;
        }
        res.status(201).send('Dados inseridos com sucesso!');
    });
})

app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    console.log(email, senha);
    const buscarEmail = 'SELECT * FROM usuario WHERE email = ?;';
    db.query(buscarEmail, [email], (err, result) => {
        if (err) {
            console.error('Error fetching data:', err);
            return;
        }
        if (result.length === 0) {
            res.status(401).send('Email ou senha incorretos');
            return;
        }
        if (result[0].senha !== senha) {
            res.status(401).send('Email ou senha incorretos');
            return;
        }
        res.status(200).send('Login bem-sucedido!');
    })
})

app.put('/produtos/:id', (req, res) => {
    const { nome, preco, categoriaId } = req.body;
    const insertNovoProduto = 'UPDATE produto SET nome = ?, preco = ?, categoriaId = ? WHERE id = ?;';
    try {
        db.query(insertNovoProduto, [nome, preco, categoriaId, req.params.id], (err, result) => {
            if (err) {
                console.error('Error updating data:', err);
                res.status(422).send(`Não foi possível alterar o produto ${req.params.id}`);
                return;
            }
            res.status(200).send('Produto atualizado com sucesso');
        });
    } catch (error) {
        res.status(500).send('Erro interno do servidor');
    }
});

