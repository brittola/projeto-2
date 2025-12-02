const { Client } = require('pg');

const config = {
	host: 'db',
	user: 'admin',
	password: 'desafio2',
	database: 'desafio2',
	port: 5432,
};

async function conectar() {
	const client = new Client(config);

	await client.connect();

	console.log('Conectado ao PostgreSQL');

	return client;
}

async function criarTabela(client) {
	const query = `
		CREATE TABLE IF NOT EXISTS usuarios (
			id SERIAL PRIMARY KEY,
			nome VARCHAR(100) NOT NULL,
			email VARCHAR(100) NOT NULL,
			criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`;

	await client.query(query);

	console.log('Tabela de usuários criada com sucesso');
}

async function inserirDados(client) {
	console.log('Inserindo dados iniciais...');

	const checkQuery = 'SELECT COUNT(*) FROM usuarios';
	const checkResult = await client.query(checkQuery);
	const count = parseInt(checkResult.rows[0].count);

	if (count > 0) {
		console.log(`Já existem ${count} registros no banco`);
		return;
	}

	const usuarios = [
		{ nome: 'João Silva', email: 'joao@email.com' },
		{ nome: 'Maria Santos', email: 'maria@email.com' },
		{ nome: 'Pedro Oliveira', email: 'pedro@email.com' },
	];

	for (const usuario of usuarios) {
		const query = 'INSERT INTO usuarios (nome, email) VALUES ($1, $2)';

		await client.query(query, [usuario.nome, usuario.email]);
	}

	console.log('Dados inseridos com sucesso');
}

async function consultarDados(client) {
	console.log('Usuários cadastrados:');

	const query = 'SELECT * FROM usuarios ORDER BY id';
	const result = await client.query(query);

	if (result.rows.length === 0) {
		console.log('Nenhum usuário encontrado');
		return;
	}

	result.rows.forEach(row => {
		console.log(`ID: ${row.id} | Nome: ${row.nome} | Email: ${row.email}`);
	});

	console.log(`Total: ${result.rows.length} usuários`);
}

async function main() {
	const comando = process.argv[2] || 'select';

	let client;

	try {
		client = await conectar();

		await criarTabela(client);

		if (comando === 'insert') {
			await inserirDados(client);
			await consultarDados(client);
		}

		if (comando === 'select') {
			await consultarDados(client);
		}
	} catch (err) {
		console.error('Erro:', err.message);

		process.exit(1);
	} finally {
		if (client) {
			await client.end();

			console.log('Conexão fechada');
		}
	}
}

main();
