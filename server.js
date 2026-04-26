const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ULTRAMSG
const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";

// MERCADO PAGO
const MP_ACCESS_TOKEN = "APP_USR-5609769983488912-042516-3165c6daed22052c70f69e4d1c915ec2-3308801985";

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

      if (message === "3") {
        resposta = `🔥 *Acesso Vitalício MasterPlay*

💰 R$ 1,00 (teste)

👉 https://mpago.la/2scYgvr

Após o pagamento, seu acesso será liberado automaticamente ✅`;
      } else {
        resposta = "Digite 3 para testar o pagamento automático.";
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
    console.error("Erro webhook WhatsApp:", error.response?.data || error.message);
    res.sendStatus(200);
  }
});

// =============================
// WEBHOOK MERCADO PAGO
// =============================
app.post("/mercadopago", async (req, res) => {
  try {
    const paymentId = req.body.id;

    if (!paymentId) {
      console.log("⚠️ ID de pagamento não encontrado");
      return res.sendStatus(200);
    }

    console.log("🔎 Consultando pagamento:", paymentId);

    const payment = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    console.log("✅ Status pagamento:", payment.data.status);

    if (payment.data.status === "approved") {

      const phone = payment.data.payer?.phone?.number;
      const areaCode = payment.data.payer?.phone?.area_code;

      if (!phone || !areaCode) {
        console.log("⚠️ Telefone não encontrado no pagamento.");
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

Após instalar, abra o app e aproveite ✅`
          }
        }
      );

      console.log("✅ APK enviado automaticamente");
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