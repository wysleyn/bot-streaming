const express = require("express");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ MasterPlay Bot Online!");
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("📩 Webhook UltraMsg recebido:");
  console.log(JSON.stringify(body, null, 2));

  if (body.data && body.data.body) {
    console.log("💬 Mensagem:", body.data.body);
  }

  res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
