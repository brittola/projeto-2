const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3002;

app.use(express.json());

const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://users-service:3001';

async function buscarUsuarios() {
	try {
		console.log('Fazendo requisição para users-service');
		const response = await axios.get(`${USERS_SERVICE_URL}/users`);
		console.log(`Recebidos ${response.data.users.length} usuários`);
		return response.data.users;
	} catch (error) {
		console.error('Erro ao buscar usuários:', error.message);
		throw error;
	}
}

async function buscarUsuario(id) {
	try {
		console.log(`Buscando usuário ${id} no users-service`);
		const response = await axios.get(`${USERS_SERVICE_URL}/users/${id}`);
		console.log(`Usuário ${id} encontrado`);
		return response.data.user;
	} catch (error) {
		if (error.response && error.response.status === 404) {
			return null;
		}
		console.error('Erro ao buscar usuário:', error.message);
		throw error;
	}
}

function adicionarInformacoes(usuario) {
	const datasMembro = {
		1: '2022-01-15',
		2: '2021-06-10',
		3: '2023-03-20',
		4: '2023-11-05'
	};

	return {
		...usuario,
		status: 'ativo',
		membro_desde: datasMembro[usuario.id] || '2024-01-01',
		categoria: usuario.idade >= 18 ? 'adulto' : 'menor',
		nivel: usuario.idade > 30 ? 'senior' : 'junior'
	};
}

app.get('/', (req, res) => {
	res.json({
		service: 'info-service',
		version: '1.0.0',
		upstream: USERS_SERVICE_URL,
		endpoints: [
			'GET /info',
			'GET /info/:id',
			'GET /health'
		]
	});
});

app.get('/health', async (req, res) => {
	const health = {
		service: 'info-service',
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

app.get('/info', async (req, res) => {
	console.log('Requisição recebida: GET /info');

	try {
		const usuarios = await buscarUsuarios();

		const usuariosComInfo = usuarios.map(adicionarInformacoes);

		res.json({
			service: 'info-service',
			source: 'users-service',
			total: usuariosComInfo.length,
			users_info: usuariosComInfo,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Erro ao processar requisição:', error.message);
		res.status(503).json({
			error: 'Erro ao comunicar com users-service',
			message: error.message
		});
	}
});

app.get('/info/:id', async (req, res) => {
	const id = parseInt(req.params.id);
	console.log(`Requisição recebida: GET /info/${id}`);

	try {
		const usuario = await buscarUsuario(id);

		if (!usuario) {
			return res.status(404).json({
				error: 'Usuário não encontrado',
				id: id
			});
		}

		const usuarioComInfo = adicionarInformacoes(usuario);

		res.json({
			service: 'info-service',
			source: 'users-service',
			user: usuarioComInfo,
			timestamp: new Date().toISOString()
		});

	} catch (error) {
		console.error('Erro ao processar requisição:', error.message);
		res.status(503).json({
			error: 'Erro ao comunicar com users-service',
			message: error.message
		});
	}
});

app.use((req, res) => {
	res.status(404).json({
		error: 'Endpoint não encontrado',
		path: req.path
	});
});

app.listen(PORT, '0.0.0.0', () => {
	console.log(`Info Service rodando na porta ${PORT}`);
	console.log(`Users Service URL: ${USERS_SERVICE_URL}`);
});

process.on('SIGTERM', () => {
	console.log('Encerrando serviço');
	process.exit(0);
});
