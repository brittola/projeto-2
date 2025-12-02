const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 8000;


app.use(express.json());


const USERS_SERVICE_URL = process.env.USERS_SERVICE_URL || 'http://users-service:3001';
const ORDERS_SERVICE_URL = process.env.ORDERS_SERVICE_URL || 'http://orders-service:3002';


async function proxyRequest(serviceUrl, path, method = 'GET', data = null) {
	try {
		const url = `${serviceUrl}${path}`;
		console.log(`Roteando ${method} ${path} para ${serviceUrl}`);

		const config = {
			method,
			url,
			timeout: 5000,
		};

		if (data) {
			config.data = data;
		}

		const response = await axios(config);
		return { success: true, data: response.data, status: response.status };

	} catch (error) {
		console.error(`Erro ao rotear para ${serviceUrl}:`, error.message);

		if (error.response) {
			return {
				success: false,
				data: error.response.data,
				status: error.response.status
			};
		}

		return {
			success: false,
			data: { error: 'Servico indisponivel', message: error.message },
			status: 503
		};
	}
}

app.get('/', (req, res) => {
	res.json({
		service: 'api-gateway',
		version: '1.0.0',
		services: {
			users: USERS_SERVICE_URL,
			orders: ORDERS_SERVICE_URL
		},
		endpoints: [
			'GET /health',
			'GET /users',
			'GET /users/:id',
			'POST /users',
			'GET /orders',
			'GET /orders/:id',
			'POST /orders'
		]
	});
});

app.get('/health', async (req, res) => {
	console.log('Health check de todos os servicos');

	const health = {
		service: 'api-gateway',
		status: 'healthy',
		timestamp: new Date().toISOString(),
		services: {}
	};

	try {
		await axios.get(`${USERS_SERVICE_URL}/health`, { timeout: 2000 });
		health.services['users-service'] = {
			status: 'healthy',
			url: USERS_SERVICE_URL
		};
	} catch (error) {
		health.services['users-service'] = {
			status: 'unhealthy',
			url: USERS_SERVICE_URL,
			error: error.message
		};
		health.status = 'degraded';
	}

	try {
		await axios.get(`${ORDERS_SERVICE_URL}/health`, { timeout: 2000 });
		health.services['orders-service'] = {
			status: 'healthy',
			url: ORDERS_SERVICE_URL
		};
	} catch (error) {
		health.services['orders-service'] = {
			status: 'unhealthy',
			url: ORDERS_SERVICE_URL,
			error: error.message
		};
		health.status = 'degraded';
	}

	const statusCode = health.status === 'healthy' ? 200 : 503;
	res.status(statusCode).json(health);
});

app.get('/users', async (req, res) => {
	const result = await proxyRequest(USERS_SERVICE_URL, '/users');
	res.status(result.status).json(result.data);
});

app.get('/users/:id', async (req, res) => {
	const result = await proxyRequest(USERS_SERVICE_URL, `/users/${req.params.id}`);
	res.status(result.status).json(result.data);
});

app.post('/users', async (req, res) => {
	const result = await proxyRequest(USERS_SERVICE_URL, '/users', 'POST', req.body);
	res.status(result.status).json(result.data);
});


app.get('/orders', async (req, res) => {
	const result = await proxyRequest(ORDERS_SERVICE_URL, '/orders');
	res.status(result.status).json(result.data);
});

app.get('/orders/:id', async (req, res) => {
	const result = await proxyRequest(ORDERS_SERVICE_URL, `/orders/${req.params.id}`);
	res.status(result.status).json(result.data);
});

app.post('/orders', async (req, res) => {
	const result = await proxyRequest(ORDERS_SERVICE_URL, '/orders', 'POST', req.body);
	res.status(result.status).json(result.data);
});

app.use((req, res) => {
	res.status(404).json({
		error: 'Rota nao encontrada',
		path: req.path
	});
});

app.listen(PORT, '0.0.0.0', () => {
	console.log(`API Gateway rodando na porta ${PORT}`);
	console.log(`Users Service: ${USERS_SERVICE_URL}`);
	console.log(`Orders Service: ${ORDERS_SERVICE_URL}`);
});

process.on('SIGTERM', () => {
	console.log('Encerrando gateway');
	process.exit(0);
});
