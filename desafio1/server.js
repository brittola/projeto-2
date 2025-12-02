const express = require("express");
const os = require("os");

const app = express();
const PORT = 8080;

app.get("/", (req, res) => {
	console.log(`Requisição recebida de ${req.ip}`);

	const response = {
		message: "Olá do servidor!",
		timestamp: new Date().toISOString(),
		hostname: os.hostname(),
	};

	res.json(response);
});

app.get("/health", (req, res) => {
	res.json({ status: "ok", uptime: process.uptime() });
});

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Servidor rodando na porta ${PORT}`);
	console.log(`Hostname: ${os.hostname()}`);
});

process.on("SIGTERM", () => {
	process.exit(0);
});
