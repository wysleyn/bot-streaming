const express = require("express");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Rota principal
app.get("/", (req, res) => {
  res.send("✅ Bot Streaming Online!");
});

// Rota para receber mensagens (Webhook)
app.post("/webhook", (req, res) => {
  const body = req.body;

  console.log("Mensagem recebida:");
  console.log(body);

  res.status(200).send("Mensagem recebida com sucesso!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});