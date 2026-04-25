const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ⚠️ COLOQUE SEUS DADOS AQUI
const INSTANCE_ID = "171812"; // seu instanceId
const TOKEN = "a2sgqtw8lehf0q3i"; // coloque seu token

app.get("/", (req, res) => {
  res.send("✅ MasterPlay Bot Online!");
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("📩 Webhook UltraMsg recebido:");
  console.log(JSON.stringify(body, null, 2));

  if (body.event_type === "message_received" && body.data.fromMe === false) {
    const from = body.data.from;
    const message = body.data.body;

    console.log("💬 Mensagem:", message);

    // MENU AUTOMÁTICO
    const resposta = `👋 Olá! Seja bem-vindo à *MasterPlay* 🎬🔥

Escolha uma opção:

1️⃣ Ver como funciona
2️⃣ Ver conteúdos disponíveis
3️⃣ Garantir acesso vitalício agora`;

   await axios.post(
  `https://api.ultramsg.com/171812/messages/chat`,
  new URLSearchParams({
    token: TOKEN,
    to: from,
    body: resposta
  }).toString(),
  {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
);
