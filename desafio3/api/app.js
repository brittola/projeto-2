const express = require('express');
const { Client } = require('pg');
const redis = require('redis');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

const dbConfig = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
};

const redisClient = redis.createClient({
	socket: {
		host: process.env.REDIS_HOST,
		port: process.env.REDIS_PORT,
	}
});

redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('connect', () => console.log('Conectado ao Redis'));

async function initDatabase() {
	const client = new Client(dbConfig);

	try {
		await client.connect();

		console.log('Banco conectado com sucesso');

		await client.query(`
			CREATE TABLE IF NOT EXISTS usuarios (
				id SERIAL PRIMARY KEY,
				nome VARCHAR(100) NOT NULL,
				email VARCHAR(100) NOT NULL UNIQUE,
				criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
		`);

		console.log('Tabela usuarios criada');

		await client.end();
	} catch (err) {
		console.error('Erro ao inicializar banco:', err.message);

		throw err;
	}
}

app.get('/', async (req, res) => {
	try {
		const visitas = await redisClient.incr('contador_visitas');

		res.json({
			message: 'API funcionando',
			visitas: visitas,
			timestamp: new Date().toISOString(),
			servicos: {
				database: 'PostgreSQL',
				cache: 'Redis'
			}
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

app.get('/health', async (req, res) => {
	const health = {
		status: 'ok',
		services: {}
	};

	const dbClient = new Client(dbConfig);
	try {
		await dbClient.connect();
		await dbClient.query('SELECT 1');
		health.services.database = 'connected';
		await dbClient.end();
	} catch (err) {
		health.services.database = 'error';
		health.status = 'degraded';
	}

	try {
		await redisClient.ping();
		health.services.cache = 'connected';
	} catch (err) {
		health.services.cache = 'error';
		health.status = 'degraded';
	}

	const statusCode = health.status === 'ok' ? 200 : 503;
	res.status(statusCode).json(health);
});

app.get('/users', async (req, res) => {
	const client = new Client(dbConfig);

	try {
		await client.connect();
		const result = await client.query('SELECT * FROM usuarios ORDER BY id');

		res.json({
			total: result.rows.length,
			users: result.rows
		});

		await client.end();
	} catch (err) {
		console.error('Erro ao buscar usuarios:', err);
		res.status(500).json({ error: err.message });
	}
});

app.post('/users', async (req, res) => {
	const { nome, email } = req.body;

	if (!nome || !email) {
		return res.status(400).json({ error: 'Nome e email obrigatorios' });
	}

	const client = new Client(dbConfig);

	try {
		await client.connect();

		const result = await client.query(
			'INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *',
			[nome, email]
		);

		res.status(201).json({
			message: 'Usuario criado',
			user: result.rows[0]
		});

		await client.end();
	} catch (err) {
		console.error('Erro ao criar usuario:', err);

		if (err.code === '23505') {
			res.status(409).json({ error: 'Email ja cadastrado' });
		} else {
			res.status(500).json({ error: err.message });
		}
	}
});

async function start() {
	try {
		await redisClient.connect();

		await initDatabase();

		app.listen(PORT, '0.0.0.0', () => {
			console.log(`Servidor rodando na porta ${PORT}`);
		});
	} catch (err) {
		console.error('Erro ao iniciar aplicacao:', err);

		process.exit(1);
	}
}

process.on('SIGTERM', async () => {
	console.log('Encerrando aplicacao');

	await redisClient.quit();

	process.exit(0);
});

start();
