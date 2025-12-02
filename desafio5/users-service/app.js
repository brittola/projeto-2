const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

let usuarios = [
	{ id: 1, nome: 'Joao Silva', email: 'joao@email.com', ativo: true },
	{ id: 2, nome: 'Maria Santos', email: 'maria@email.com', ativo: true },
	{ id: 3, nome: 'Pedro Oliveira', email: 'pedro@email.com', ativo: false }
];

let proximoId = 4;

app.get('/', (req, res) => {
	res.json({
		service: 'users-service',
		version: '1.0.0',
		endpoints: [
			'GET /users',
			'GET /users/:id',
			'POST /users',
			'GET /health'
		]
	});
});

app.get('/health', (req, res) => {
	res.json({
		service: 'users-service',
		status: 'healthy',
		timestamp: new Date().toISOString()
	});
});

app.get('/users', (req, res) => {
	console.log('GET /users');
	res.json({
		service: 'users-service',
		total: usuarios.length,
		users: usuarios
	});
});

app.get('/users/:id', (req, res) => {
	const id = parseInt(req.params.id);
	console.log(`GET /users/${id}`);

	const usuario = usuarios.find(u => u.id === id);

	if (!usuario) {
		return res.status(404).json({
			error: 'Usuario nao encontrado',
			id: id
		});
	}

	res.json({
		service: 'users-service',
		user: usuario
	});
});

app.post('/users', (req, res) => {
	const { nome, email } = req.body;

	console.log('POST /users', { nome, email });

	if (!nome || !email) {
		return res.status(400).json({
			error: 'Nome e email obrigatorios'
		});
	}

	if (usuarios.find(u => u.email === email)) {
		return res.status(409).json({
			error: 'Email ja cadastrado'
		});
	}

	const novoUsuario = {
		id: proximoId++,
		nome,
		email,
		ativo: true,
		criado_em: new Date().toISOString()
	};

	usuarios.push(novoUsuario);

	res.status(201).json({
		service: 'users-service',
		message: 'Usuario criado',
		user: novoUsuario
	});
});

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Users Service rodando na porta ${PORT}`);
});

process.on('SIGTERM', () => {
	console.log('Encerrando users-service');
	process.exit(0);
});
