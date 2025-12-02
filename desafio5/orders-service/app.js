const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3002;

app.use(express.json());

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://users-service:3001';

let pedidos = [
	{
		id: 1,
		usuario_id: 1,
		usuario_nome: 'Joao Silva',
		produto: 'Notebook',
		valor: 2500,
		status: 'pendente',
		criado_em: '2024-11-20T10:00:00.000Z'
	}
];

let proximoId = 2;

async function validarUsuario(usuarioId) {
	try {
		console.log(`Validando usuario ${usuarioId} com users-service`);
		const response = await axios.get(`${USERS_SERVICE_URL}/users/${usuarioId}`);
		console.log(`Usuario ${usuarioId} valido`);
		return response.data.user;
	} catch (error) {
		if (error.response && error.response.status === 404) {
			console.log(`Usuario ${usuarioId} nao encontrado`);
			return null;
		}
		throw error;
	}
}

app.get('/', (req, res) => {
	res.json({
		service: 'orders-service',
		version: '1.0.0',
		upstream: USERS_SERVICE_URL,
		endpoints: [
			'GET /orders',
			'GET /orders/:id',
			'POST /orders',
			'GET /health'
		]
	});
});

app.get('/health', async (req, res) => {
	const health = {
		service: 'orders-service',
		status: 'healthy',
		upstream: {}
	};

	try {
		await axios.get(`${USERS_SERVICE_URL}/health`, { timeout: 2000 });
		health.upstream.users_service = 'connected';
	} catch (error) {
		health.upstream.users_service = 'error';
		health.status = 'degraded';
	}

	const statusCode = health.status === 'healthy' ? 200 : 503;
	res.status(statusCode).json(health);
});

app.get('/orders', (req, res) => {
	console.log('GET /orders');
	res.json({
		service: 'orders-service',
		total: pedidos.length,
		orders: pedidos
	});
});

app.get('/orders/:id', (req, res) => {
	const id = parseInt(req.params.id);
	console.log(`GET /orders/${id}`);

	const pedido = pedidos.find(p => p.id === id);

	if (!pedido) {
		return res.status(404).json({
			error: 'Pedido nao encontrado',
			id: id
		});
	}

	res.json({
		service: 'orders-service',
		order: pedido
	});
});

app.post('/orders', async (req, res) => {
	const { usuario_id, produto, valor } = req.body;

	console.log('POST /orders', { usuario_id, produto, valor });

	if (!usuario_id || !produto || !valor) {
		return res.status(400).json({
			error: 'usuario_id, produto e valor obrigatorios'
		});
	}

	try {
		const usuario = await validarUsuario(usuario_id);

		if (!usuario) {
			return res.status(404).json({
				error: 'Usuario nao encontrado',
				usuario_id: usuario_id
			});
		}

		const novoPedido = {
			id: proximoId++,
			usuario_id: usuario_id,
			usuario_nome: usuario.nome,
			produto,
			valor,
			status: 'pendente',
			criado_em: new Date().toISOString()
		};

		pedidos.push(novoPedido);

		res.status(201).json({
			service: 'orders-service',
			message: 'Pedido criado',
			order: novoPedido
		});

	} catch (error) {
		console.error('Erro ao criar pedido:', error.message);
		res.status(503).json({
			error: 'Erro ao validar usuario',
			message: error.message
		});
	}
});

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Orders Service rodando na porta ${PORT}`);
	console.log(`Users Service URL: ${USERS_SERVICE_URL}`);
});

process.on('SIGTERM', () => {
	console.log('Encerrando orders-service');
	process.exit(0);
});
