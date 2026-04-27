const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// =============================
// CONFIGURAÇÕES
// =============================

// ULTRAMSG
const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";

// MERCADO PAGO PRODUÇÃO
const MP_ACCESS_TOKEN = "APP_USR-6837348167992487-042516-9a8c1623514fc61737d98fc71f832f25-256715443";

// APK
const APK_LINK = "https://files.catbox.moe/vm1bsw";

// SEU NÚMERO PARA SUPORTE
const SEU_NUMERO = "55999096129";

// =============================
// MENSAGENS FIXAS
// =============================

const mensagemInicial = `👋 Seja bem-vindo(a) à *MasterPlay* 🎬🔥

Hoje, para ter acesso completo aos principais conteúdos, você precisaria assinar várias plataformas como:

📺 Netflix – R$ 39,90/mês  
🎬 Prime Video – R$ 19,90/mês  
🦁 Disney+ – R$ 33,90/mês  
🎥 HBO – R$ 34,90/mês  
📡 Globoplay – R$ 27,90/mês  
🎌 Crunchyroll – R$ 14,99/mês  
🌎 Rakuten Viki – R$ 25,99/mês  
🍎 Apple TV+ – R$ 21,90/mês  
🎞 Paramount+ – R$ 19,90/mês  
⭐ Star+ – R$ 40,90/mês  

💸 Isso pode ultrapassar R$ 200 por mês.

Com a *MasterPlay* você paga apenas *UMA única vez*.

━━━━━━━━━━━━━━━

Escolha uma opção:

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes`;

const mensagemComoFunciona = `📱 *Como funciona?*

1️⃣ Você realiza o pagamento único  
2️⃣ Recebe o aplicativo imediatamente  
3️⃣ Instala no seu celular  
4️⃣ Acesso liberado ✅

━━━━━━━━━━━━━━━

Escolha:

2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes`;

const mensagemFAQ = `❓ *Perguntas Frequentes – MasterPlay*

🔹 Funciona em qual celular?
Funciona em celulares Android.

🔹 Funciona em iPhone?
Não. O aplicativo é exclusivo para Android.

🔹 Precisa pagar todo mês?
Não. O pagamento é único e o acesso é vitalício ✅

🔹 O acesso expira?
Não. Após o pagamento, o acesso é permanente.

🔹 Como recebo o aplicativo?
Após o pagamento aprovado, você recebe automaticamente aqui no WhatsApp.

🔹 É seguro o pagamento?
Sim. O pagamento é processado pelo Mercado Pago 🔒

🔹 O conteúdo é atualizado?
Sim. Novos conteúdos são adicionados frequentemente.

🔹 Funciona na televisão?
O app não instala direto na TV.
Mas você pode espelhar o conteúdo do celular para a televisão 📺✨

━━━━━━━━━━━━━━━

Escolha:

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte`;

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

      // MENU / GATILHO AUTOMÁTICO
      if (
        message === "oi" ||
        message === "menu" ||
        message.includes("quero conhecer") ||
        message.includes("quero saber") ||
        message.includes("mais informações")
      ) {
        resposta = mensagemInicial;
      }

      // COMO FUNCIONA
      else if (
        message === "1" ||
        message.includes("como funciona")
      ) {
        resposta = mensagemComoFunciona;
      }

      // CONTEÚDOS
      else if (
        message === "2" ||
        message.includes("conteúdo") ||
        message.includes("filmes") ||
        message.includes("séries") ||
        message.includes("animes") ||
        message.includes("doramas") ||
        message.includes("novelas")
      ) {

        // Enviar vídeo
        await axios.post(
          `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/video`,
          new URLSearchParams({
            token: TOKEN,
            to: from,
            video: "https://files.catbox.moe/hdreo7.mp4",
            caption:
              "🎬 Esse é o aplicativo funcionando na prática.\n\nTudo organizado, rápido e fácil de usar 📱✨"
          }).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        );

        resposta = `🎬 *Tudo o que você encontra dentro da MasterPlay:*

🍿 Filmes  
📺 Séries  
🎌 Animes  
🌎 Doramas  
📡 Novelas  

━━━━━━━━━━━━━━━

Escolha:

1️⃣ Como funciona  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes`;
      }

      // PAGAMENTO DINÂMICO
      else if (
        message === "3" ||
        message.includes("preço") ||
        message.includes("valor") ||
        message.includes("quanto custa") ||
        message.includes("comprar") ||
        message.includes("acesso")
      ) {

        const preference = await axios.post(
          "https://api.mercadopago.com/checkout/preferences",
          {
            items: [
              {
                title: "MasterPlay",
                quantity: 1,
                unit_price: 1.00
              }
            ],
            metadata: { phone: from },
            notification_url:
              "https://bot-streaming-41zm.onrender.com/mercadopago"
          },
          {
            headers: {
              Authorization: `Bearer ${MP_ACCESS_TOKEN}`
            }
          }
        );

        resposta = `🔥 *Pagamento MasterPlay*

👉 ${preference.data.init_point}

Após o pagamento, seu acesso será liberado automaticamente ✅`;
      }

      // SUPORTE
      else if (
        message === "4" ||
        message.includes("suporte") ||
        message.includes("ajuda")
      ) {

        resposta = `👨‍💻 Você escolheu falar com o suporte.

Aguarde que entraremos em contato ✅`;

        // Notificar você
        await axios.get(
          `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
          {
            params: {
              token: TOKEN,
              to: SEU_NUMERO,
              body: `📞 NOVO PEDIDO DE SUPORTE\n\nNúmero: ${from}`
            }
          }
        );
      }

      // FAQ
      else if (message === "5" || message.includes("perguntas")) {
        resposta = mensagemFAQ;
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

    if (req.body.type !== "payment") return res.sendStatus(200);

    const paymentId = req.body.data?.id;

    const payment = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`
        }
      }
    );

    if (payment.data.status === "approved") {

      const phone = payment.data.metadata?.phone;

      await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: {
            token: TOKEN,
            to: phone,
            body: `✅ Pagamento confirmado!

📥 Baixe o aplicativo:
${APK_LINK}

Aproveite ✅`
          }
        }
      );
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