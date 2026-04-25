const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ SEU TOKEN REAL
const TOKEN = "a2sgqtw8lehf0q3is";

// ✅ SOMENTE O NÚMERO DA INSTÂNCIA
const INSTANCE_ID = "171812";

app.get("/", (req, res) => {
  res.send("✅ MasterPlay Bot Online!");
});

app.post("/webhook", async (req, res) => {
  const body = req.body;

  console.log("📩 Webhook UltraMsg recebido:");
  console.log(JSON.stringify(body, null, 2));

  if (
    body.event_type === "message_received" &&
    body.data &&
    body.data.fromMe === false
  ) {
    const from = body.data.from.replace("@c.us", "");
    const message = body.data.body;

    console.log("💬 Mensagem:", message);

    const resposta = `👋 Olá! Seja bem-vindo à *MasterPlay* 🎬🔥

Escolha uma opção:

1️⃣ Ver como funciona
2️⃣ Ver conteúdos disponíveis
3️⃣ Garantir acesso vitalício agora`;

    try {
      // ✅ ENVIO VIA GET (mesmo formato que funcionou no navegador)
      const response = await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: {
            token: TOKEN,
            to: from,
            body: resposta
          }
        }
      );

      console.log("✅ Status HTTP:", response.status);
      console.log("✅ Resposta API:", response.data);

    } catch (error) {
      console.error("❌ Status erro:", error.response?.status);
      console.error("❌ Resposta erro:", error.response?.data || error.message);
    }
  }

  res.send("ok");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});