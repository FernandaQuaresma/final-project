const express = require("express");
const Sequelize = require("sequelize");
const cors = require("cors");
const rotas = express();


rotas.use(cors());
rotas.use(express.json());

const conexaoComBanco = new Sequelize("projeto", "root", "", {
    host: "localhost",
    dialect: "mysql",
});

conexaoComBanco.authenticate()
    .then(() => {
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
    })
    .catch((error) => {
        console.error('Erro ao conectar ao banco de dados:', error);
    });

// Tabela aluno
const aluno = conexaoComBanco.define("aluno", {
    nome_aluno: {
        type: Sequelize.STRING,
    },
    email_aluno: {
        type: Sequelize.STRING,
        unique: true,
    },
    senha: {
        type: Sequelize.STRING,
    },
}, {
    freezeTableName: true,
});

// Tabela professor
const professor = conexaoComBanco.define("professor", {
    nome_professor: {
        type: Sequelize.STRING,
    },
    email_professor: {
        type: Sequelize.STRING,
        unique: true,
    },
    senha: {
        type: Sequelize.STRING,
    },
}, {
    freezeTableName: true,
});

// Cadastro de aluno
rotas.post("/cadastro/aluno", async (req, res) => {
    const { nome_aluno, email_aluno, senha } = req.body;
    try {
        const novoAluno = await aluno.create({
            nome_aluno,
            email_aluno,
            senha,
        });
        res.status(201).json(novoAluno);
    } catch (error) {
        res.status(400).json({ mensagem: "Erro ao cadastrar aluno." });
    }
});

// Cadastro de professor
rotas.post("/cadastro/professor", async (req, res) => {
    const { nome_professor, email_professor, senha } = req.body;
    try {
        const novoProfessor = await professor.create({
            nome_professor,
            email_professor,
            senha,
        });
        res.status(201).json(novoProfessor);
    } catch (error) {
        res.status(400).json({ mensagem: "Erro ao cadastrar professor." });
    }
});

// Login de aluno
rotas.post("/login/aluno", async (req, res) => {
    const { email_aluno, senha } = req.body;
    const alunoEncontrado = await aluno.findOne({ where: { email_aluno } });
    if (alunoEncontrado && alunoEncontrado.senha === senha) {
        res.json({ redirecionarPara: "pagina_aluno.html" });
    } else {
        res.status(401).json({ mensagem: "Credenciais inválidas." });
    }
});

// Login de professor
rotas.post("/login/professor", async (req, res) => {
    const { email_professor, senha } = req.body;
    const professorEncontrado = await professor.findOne({ where: { email_professor } });
    if (professorEncontrado && professorEncontrado.senha === senha) {
        res.json({ redirecionarPara: "pagina_professor.html" });
    } else {
        res.status(401).json({ mensagem: "Credenciais inválidas." });
    }
});

rotas.listen(3000, () => {
    console.log("Servidor rodando na porta 3031.");
});
