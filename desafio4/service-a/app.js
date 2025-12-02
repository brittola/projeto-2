const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

const usuarios = [
	{
		id: 1,
		nome: 'João Silva',
		email: 'joao@email.com',
		idade: 28
	},
	{
		id: 2,
		nome: 'Maria Santos',
		email: 'maria@email.com',
		idade: 32
	},
	{
		id: 3,
		nome: 'Pedro Oliveira',
		email: 'pedro@email.com',
		idade: 25
	},
	{
		id: 4,
		nome: 'Ana Costa',
		email: 'ana@email.com',
		idade: 19
	}
];

app.get('/', (req, res) => {
	res.json({
		service: 'users-service',
		version: '1.0.0',
		endpoints: [
			'GET /users',
			'GET /users/:id',
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
	console.log('Requisição recebida: GET /users');

	res.json({
		service: 'users-service',
		total: usuarios.length,
		users: usuarios
	});
});

app.get('/users/:id', (req, res) => {
	const id = parseInt(req.params.id);
	console.log(`Requisição recebida: GET /users/${id}`);

	const usuario = usuarios.find(u => u.id === id);

	if (!usuario) {
		return res.status(404).json({
			error: 'Usuário não encontrado',
			id: id
		});
	}

	res.json({
		service: 'users-service',
		user: usuario
	});
});

app.use((req, res) => {
	res.status(404).json({
		error: 'Endpoint não encontrado',
		path: req.path
	});
});


app.listen(PORT, '0.0.0.0', () => {
	console.log(`Users Service rodando na porta ${PORT}`);
});

process.on('SIGTERM', () => {
	console.log('Encerrando serviço');
	process.exit(0);
});
