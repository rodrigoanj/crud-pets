import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Configuração para descobrir a pasta atual usando ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares obrigatórios
app.use(express.json()); // Habilita o recebimento de JSON no corpo das requisições (POST/PUT)
app.use(express.static(__dirname)); // Faz o Express servir seus arquivos HTML, CSS e JS (como o dashboard.js) automaticamente

// Array em memória simulando um banco de dados temporário
let bancoDeDadosPets = [];

// ==========================================
// ROTAS DA API REST (Backend)
// ==========================================

// 1. READ (Listar todos)
app.get('/api/pets', (req, res) => {
    res.json(bancoDeDadosPets);
});

// 2. CREATE (Cadastrar novo)
app.post('/api/pets', (req, res) => {
    const novoPet = {
        id: Date.now().toString(), // Cria o ID dinâmico no servidor
        ...req.body
    };
    bancoDeDadosPets.push(novoPet);
    res.status(201).json({ mensagem: "Pet cadastrado com sucesso!", pet: novoPet });
});

// 3. UPDATE (Atualizar)
app.put('/api/pets/:id', (req, res) => {
    const { id } = req.params;
    const index = bancoDeDadosPets.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ mensagem: "Pet não encontrado no servidor." });
    }

    bancoDeDadosPets[index] = { id, ...req.body };
    res.json({ mensagem: "Pet atualizado com sucesso!", pet: bancoDeDadosPets[index] });
});

// 4. DELETE (Remover)
app.delete('/api/pets/:id', (req, res) => {
    const { id } = req.params;
    const index = bancoDeDadosPets.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ mensagem: "Pet não encontrado no servidor." });
    }

    bancoDeDadosPets.splice(index, 1);
    res.json({ mensagem: "Pet deletado com sucesso!" });
});

// Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend iniciado com sucesso!`);
    console.log(`🌍 Acesse a aplicação em: http://localhost:${PORT}`);
});