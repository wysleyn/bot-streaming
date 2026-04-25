const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔹 ULTRAMSG
const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";

// 🔹 MERCADO PAGO (COLOQUE SEU ACCESS TOKEN AQUI)
const MP_ACCESS_TOKEN = "APP_USR-5609769983488912-042516-3165c6daed22052c70f69e4d1c915ec2-3308801985";

// 🔹 APK
const APK_LINK = "https://files.catbox.moe/vm1bsw";

app.get("/", (req, res) => {
  res.send("✅ MasterPlay Bot Online!");
});

/* ============================
   WEBHOOK WHATSAPP
============================ */

app.post("/webhook", async (req, res) => {
  const body = req.body;

  if (
    body.event_type === "message_received" &&
    body.data &&
    body.data.fromMe === false
  ) {
    const from = body.data.from.replace("@c.us", "");
    const message = body.data.body.trim().toLowerCase();

    let resposta = "";

    if (message === "oi" || message === "menu") {
      resposta = `👋 Seja bem-vindo(a) à *MasterPlay* 🎬🔥

Para ter acesso completo aos principais conteúdos, você precisaria assinar várias plataformas separadas.

Com a *MasterPlay* você paga apenas UMA única vez.

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte`;
    }

    else if (message === "3") {
      resposta = `🔥 *Acesso Vitalício MasterPlay*

💰 R$ 1,00 (valor de teste)

👉 https://mpago.la/2scYgvr

Após o pagamento, seu acesso será liberado automaticamente ✅`;
    }

    else {
      resposta = `Digite *menu* para ver as opções disponíveis.`;
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

  res.send("ok");
});

/* ============================
   WEBHOOK MERCADO PAGO
============================ */

app.post("/mercadopago", async (req, res) => {
  try {
    const paymentId = req.body.data?.id;

    if (!paymentId) return res.sendStatus(200);

    // 🔎 Consultar pagamento
    const payment = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    if (payment.data.status === "approved") {

      const phone = payment.data.payer?.phone?.number;
      const areaCode = payment.data.payer?.phone?.area_code;

      if (!phone || !areaCode) {
        console.log("Telefone não encontrado no pagamento.");
        return res.sendStatus(200);
      }

      const fullPhone = `55${areaCode}${phone}`;

      await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: {
            token: TOKEN,
            to: fullPhone,
            body: `✅ Pagamento confirmado!

Seu acesso à *MasterPlay* está liberado 🎬🔥

📥 Baixe o aplicativo aqui:
${APK_LINK}

Após instalar, abra o app e aproveite ✅

Se precisar de ajuda, é só responder aqui.`
          }
        }
      );

      console.log("✅ APK enviado automaticamente");
    }

  } catch (error) {
    console.error("Erro Mercado Pago:", error.response?.data || error.message);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});