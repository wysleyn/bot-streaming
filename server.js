const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ⚠️ COLOQUE SEU TOKEN AQUI
const TOKEN = "SEU_TOKEN_AQUI";
const INSTANCE_ID = "171812";

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

    const resposta = `👋 Olá! Seja bem-vindo à *MasterPlay* 🎬🔥

Escolha uma opção:

1️⃣ Ver como funciona
2️⃣ Ver conteúdos disponíveis
3️⃣ Garantir acesso vitalício agora`;

    try {
      await axios.post(
        `https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`,
        new URLSearchParams({
          token: TOKEN,
          to: from,
          body: resposta
        }).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        }
      );
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error.response?.data || error.message);
    }
  }

  res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});