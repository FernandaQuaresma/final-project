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

// Tabela de nota
const Nota = conexaoComBanco.define("notas", {
    nota: {
        type: Sequelize.FLOAT,
    },
    materia: {
        type: Sequelize.STRING
    },
    alunoId: {
        type: Sequelize.INTEGER,
        references: {
            model: aluno,
            key: 'id',
        }
    },
    professorId: {
        type: Sequelize.INTEGER,
        references: {
            model: professor,
            key: 'id',
        }
    }
}, {
    freezeTableName: true,
});

// Criando as tabelas no banco
conexaoComBanco.sync()
    .then(() => console.log("Tabelas criadas ou verificadas"))
    .catch((error) => console.error('Erro ao sincronizar o banco de dados:', error));

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
        res.json({ redirecionarPara: "espaco-aluno.html" });
    } else {
        res.status(401).json({ mensagem: "Credenciais inválidas." });
    }
});

// Login de professor
rotas.post("/login/professor", async (req, res) => {
    const { email_professor, senha } = req.body;
    const professorEncontrado = await professor.findOne({ where: { email_professor } });
    if (professorEncontrado && professorEncontrado.senha === senha) {
        res.json({ redirecionarPara: "espaco-prof.html" });
    } else {
        res.status(401).json({ mensagem: "Credenciais inválidas." });
    }
});

// Rota para listar todos os alunos para o select no espaço do professor
rotas.get("/listar/alunos", async (req, res) => {
    try {
        const alunos = await aluno.findAll({
            attributes: ['id', 'nome_aluno']
        });
        res.json(alunos);
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao buscar alunos." });
    }
});

// Rota para registrar a nota
rotas.post("/registrar/nota", async (req, res) => {
    const { alunoId, materia, nota, professorId } = req.body;

    if (!alunoId || !materia || !nota || !professorId) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        const novaNota = await Nota.create({
            alunoId: alunoId,
            materia: materia,
            nota: nota,
            professorId: professorId
        });

        res.status(201).json({ message: "Nota registrada com sucesso!" });
    } catch (error) {
        console.error("Erro ao registrar a nota:", error);
        res.status(500).json({ error: "Erro ao registrar a nota." });
    }
});


// Rota para editar a nota
rotas.put("/nota/:id", async (req, res) => {
    const { id } = req.params;
    const { alunoId, materia, nota, professorId } = req.body;

    try {
        const notaExistente = await Nota.findByPk(id);
        if (!notaExistente) {
            return res.status(404).json({ mensagem: "Nota não encontrada." });
        }

        // Atualizando os dados da nota
        await notaExistente.update({ alunoId, materia, nota, professorId });

        res.status(200).json({ mensagem: "Nota atualizada com sucesso!" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao editar a nota." });
    }
});


// Rota para excluir a nota
rotas.delete("/nota/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const notaExistente = await Nota.findByPk(id);
        if (!notaExistente) {
            return res.status(404).json({ mensagem: "Nota não encontrada." });
        }

        await notaExistente.destroy();

        res.status(200).json({ mensagem: "Nota excluída com sucesso!" });
    } catch (error) {
        res.status(500).json({ mensagem: "Erro ao excluir a nota." });
    }
});

// Rota para buscar as notas do aluno
rotas.get('/notas/aluno/:id', async (req, res) => {
    try {
      const alunoId = req.params.id;
      const notas = await Nota.findAll({
        where: {
          alunoId: alunoId
        }
      });
  
      console.log(notas); // Verifique se as notas estão sendo encontradas
  
      if (!notas || notas.length === 0) {
        return res.status(404).json({ mensagem: 'Notas não encontradas.' });
      }
  
      res.json(notas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensagem: 'Erro ao buscar notas.' });
    }
  });
  
  




// Inicia o servidor
rotas.listen(3031, () => {
    console.log("Servidor rodando na porta 3031.");
});
