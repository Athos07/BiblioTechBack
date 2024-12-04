const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();
const port = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Conecta ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
        process.exit(1);
    }
    console.log('Conectado ao banco de dados!');
});

// Middleware para tratar JSON
app.use(express.json());

// Rota para listar todos os livros
app.get('/Livros', (req, res) => {
    const query = 'SELECT * FROM Livros';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erro ao buscar dados:', err.message);
            return res.status(500).json({ error: 'Erro ao buscar dados' });
        }
        res.json(results);
    });
});

// Rota para buscar um livro por ID
app.get('/Livros/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM Livros WHERE id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar livro:', err.message);
            return res.status(500).json({ error: 'Erro ao buscar livro' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Livro não encontrado' });
        }
        res.json(results[0]);
    });
});

// Rota para adicionar um novo livro
app.post('/adicionarLivros', (req, res) => {
    const { Nome, Autor, Editora } = req.body;

    if (!Nome || !Autor || !Editora) {
        return res.status(400).json({ error: 'Todos os campos (Nome, Autor, Editora) são obrigatórios.' });
    }

    const query = 'INSERT INTO Livros (Nome, Autor, Editora) VALUES (?, ?, ?)';
    db.query(query, [Nome, Autor, Editora], (err, results) => {
        if (err) {
            console.error('Erro ao adicionar livro:', err.message);
            return res.status(500).json({ error: 'Erro ao adicionar livro no banco de dados.' });
        }

        res.status(201).json({
            message: 'Livro adicionado com sucesso.',
            livro: { id: results.insertId, Nome, Autor, Editora },
        });
    });
});

// Rota para excluir um livro
app.delete('/deletarLivros/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM Livros WHERE id = ?';
    db.query(query, [id], (err) => {
        if (err) {
            console.error('Erro ao excluir livro:', err.message);
            return res.status(500).json({ error: 'Erro ao excluir livro' });
        }
        res.json({ message: 'Livro excluído com sucesso' });
    });
});

// Rota para atualizar um livro
app.put('/alterarLivros/:id', (req, res) => {
    const { id } = req.params;
    const { Nome, Autor, Editora } = req.body;

    if (!Nome || !Autor || !Editora) {
        return res.status(400).json({ error: 'Dados inválidos. Verifique Nome, Autor e Editora.' });
    }

    const query = 'UPDATE Livros SET Nome = ?, Autor = ?, Editora = ? WHERE id = ?';
    db.query(query, [Nome, Autor, Editora, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar livro:', err.message);
            return res.status(500).json({ error: 'Erro ao atualizar livro.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Livro não encontrado.' });
        }

        res.json({ message: 'Livro atualizado com sucesso.', id, Nome, Autor, Editora });
    });
});

// Rota para buscar um livro pelo nome
app.get('/Livros/nome/:Nome', (req, res) => {
    const { Nome } = req.params;
    const query = 'SELECT * FROM Livros WHERE Nome LIKE ?';

    // O "%" é usado para fazer uma busca que seja insensível a maiúsculas e minúsculas e permite encontrar qualquer livro que tenha o nome parcialmente correspondente.
    db.query(query, [`%${Nome}%`], (err, results) => {
        if (err) {
            console.error('Erro ao buscar livro pelo nome:', err.message);
            return res.status(500).json({ error: 'Erro ao buscar livro pelo nome' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Nenhum livro encontrado com esse nome' });
        }
        res.json(results);
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
