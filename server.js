const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ULTRAMSG
const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";

// MERCADO PAGO PRODUÇÃO
const MP_ACCESS_TOKEN = "APP_USR-6837348167992487-042516-9a8c1623514fc61737d98fc71f832f25-256715443";

// APK
const APK_LINK = "https://files.catbox.moe/vm1bsw";

// =============================
// STATUS
// =============================
app.get("/", (req, res) => {
  res.send("✅ MasterPlay Bot Online!");
});

// =============================
// WEBHOOK WHATSAPP
// =============================
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (
      body.event_type === "message_received" &&
      body.data &&
      body.data.fromMe === false
    ) {
      const from = body.data.from.replace("@c.us", "");
      const message = body.data.body.trim().toLowerCase();

      let resposta = "";

      // MENU SIMPLES
      if (message === "oi" || message === "menu") {
        resposta = `👋 Bem-vindo(a) à *MasterPlay* 🎬🔥

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora`;
      }

      // OPÇÃO 3 → CRIAR PAGAMENTO DINÂMICO
      else if (message === "3") {

        // ✅ Criar preferência Mercado Pago
        const preference = await axios.post(
          "https://api.mercadopago.com/checkout/preferences",
          {
            items: [
              {
                title: "Teste MasterPlay",
                quantity: 1,
                unit_price: 1.00
              }
            ],
            metadata: {
              phone: from
            },
            notification_url:
              "https://bot-streaming-41zm.onrender.com/mercadopago"
          },
          {
            headers: {
              Authorization: `Bearer ${MP_ACCESS_TOKEN}`
            }
          }
        );

        const paymentLink = preference.data.init_point;

        resposta = `🔥 *Pagamento Teste MasterPlay*

💰 R$ 1,00

Clique abaixo para pagar:

👉 ${paymentLink}

Após o pagamento, seu acesso será liberado automaticamente ✅`;
      }

      else {
        resposta = "Digite *menu* para ver as opções.";
      }

      await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: {
            token: TOKEN,
            to: from,
            body: resposta
          }
        }
      );
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Erro WhatsApp:", error.response?.data || error.message);
    res.sendStatus(200);
  }
});

// =============================
// WEBHOOK MERCADO PAGO
// =============================
app.post("/mercadopago", async (req, res) => {
  try {

    const paymentId = req.body.id;

    if (!paymentId) return res.sendStatus(200);

    const payment = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    if (payment.data.status === "approved") {

      const phone = payment.data.metadata.phone;

      if (!phone) return res.sendStatus(200);

      await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: {
            token: TOKEN,
            to: phone,
            body: `✅ Pagamento confirmado!

Seu acesso à *MasterPlay* está liberado 🎬🔥

📥 Baixe o aplicativo aqui:
${APK_LINK}

Aproveite ✅`
          }
        }
      );

      console.log("✅ APK liberado automaticamente");
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Erro Mercado Pago:", error.response?.data || error.message);
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});