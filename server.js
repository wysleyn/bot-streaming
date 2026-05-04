const express = require("express");
const axios = require("axios");
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================= CONFIGURAÇÕES =================

// ULTRAMSG
const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";

// MERCADO PAGO PRODUÇÃO
const MP_ACCESS_TOKEN = "APP_USR-6837348167992487-042516-9a8c1623514fc61737d98fc71f832f25-256715443";

// APK
const APK_LINK = "https://bot-streaming-41zm.onrender.com/apk";

// VÍDEO
const VIDEO_URL = "https://files.catbox.moe/hdreo7.mp4";

// SEU NÚMERO PARA SUPORTE
const SEU_NUMERO = "5524999096129";

// ================= CONTROLES =================

const atendimentosHumanos = {};
const pagamentosPendentes = {};

// ================= MENSAGENS =================

const mensagemMenu = `📋 *Menu Principal – MasterPlay*

Escolha uma opção abaixo:

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes  

Digite apenas o número da opção 👇`;

const mensagemTeste = `

A MasterPlay não possui versão de teste porque o aplicativo não utiliza login.

Isso significa que, quando ele é instalado, o acesso já fica totalmente liberado e vitalício.  
Se eu enviasse como teste, você já teria o aplicativo completo.

Para manter a segurança do acesso, a liberação acontece somente após o pagamento ✅

Mas pode ficar tranquilo(a):

✅ Pagamento único (sem mensalidade)  
✅ Acesso vitalício  
✅ Envio imediato após confirmação  
✅ Pagamento 100% seguro pelo Mercado Pago 🔒  

Prefere ver como funciona ou já quer garantir seu acesso agora?`;

const mensagemInicial = `🎬🔥 Chegou a forma mais inteligente de assistir tudo pagando apenas *UMA vez*.

Sem Netflix.
Sem Prime.
Sem Disney.
Sem várias assinaturas todo mês.

Com a *MasterPlay* você tem acesso a:

🍿 Filmes atualizados  
📺 Séries completas  
🎌 Animes  
🌎 Doramas  
🔥 Conteúdos organizados e fáceis de usar  

Tudo dentro de um único aplicativo 📱✨

✅ Pagamento único  
✅ Acesso vitalício  
✅ Sem mensalidade  
✅ Liberação automática após pagamento  

Você paga uma vez e usa para sempre.

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes  

Digite apenas o número da opção 👇`;
const mensagemComoFunciona = `📱 *Como funciona?*

1️⃣ Você realiza o pagamento único  
2️⃣ Recebe o aplicativo imediatamente  
3️⃣ Instala no seu celular  
4️⃣ Acesso liberado ✅

Sem mensalidade.
Sem renovação automática.
Sem cobranças futuras.

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte  
5️⃣ Perguntas frequentes`;

const mensagemConteudoTexto = `🎬 *Tudo o que você encontra dentro da MasterPlay:*

Imagine abrir um único aplicativo e ter acesso a:

🍿 Filmes para assistir hoje mesmo  
📺 Séries completas para maratonar sem parar  
🎌 Animes atualizados  
🌎 Doramas e conteúdos internacionais  
📡 Novelas e programas populares  
🔥 Categorias organizadas e fáceis de navegar  

Sem precisar trocar de aplicativo.
Sem pagar várias assinaturas.
Sem limite de acesso.

É como ter várias plataformas reunidas em um só lugar, direto no seu celular 📱✨

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
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

🔹 Tem canais ao vivo?
Não. A MasterPlay não possui canais ao vivo.
O foco é conteúdo sob demanda.

🔹 Funciona na televisão?
O aplicativo não é instalado diretamente na TV.
Mas você pode espelhar o conteúdo 📺✨

🔹 Se eu trocar de celular, perco acesso?
Não. Você pode instalar novamente no novo aparelho.

━━━━━━━━━━━━━━━

1️⃣ Como funciona  
2️⃣ Ver conteúdos  
3️⃣ Garantir acesso agora  
4️⃣ Falar com suporte`;

// ================= STATUS =================

app.get("/", (req, res) => {
  res.send("✅ MasterPlay Bot Online!");
});

// ================= DOWNLOAD APK =================

app.get("/apk", async (req, res) => {
  try {
    const fileResponse = await axios.get(
      "https://files.catbox.moe/vm1bsw",
      { responseType: "stream" }
    );

    res.setHeader("Content-Disposition", "attachment; filename=masterplay.apk");
    res.setHeader("Content-Type", "application/vnd.android.package-archive");

    fileResponse.data.pipe(res);

  } catch (error) {
    console.error("Erro ao baixar APK:", error.message);
    res.status(500).send("Erro ao baixar APK.");
  }
});

// ================= WEBHOOK WHATSAPP =================

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.event_type === "message_received" && body.data) {

      const from = body.data.from.replace("@c.us", "");
      const message = body.data.body?.trim().toLowerCase();

      // Ativa atendimento humano se você responder
      if (body.data.fromMe === true) {
        atendimentosHumanos[from] = true;
        return res.sendStatus(200);
      }

      // Se estiver em atendimento humano
      if (atendimentosHumanos[from]) {
        if (["1","2","3","4","5","menu"].includes(message)) {
          atendimentosHumanos[from] = false;
        } else {
          return res.sendStatus(200);
        }
      }

      let resposta = "";

      if (
        message === "oi" ||
        message.includes("quero conhecer") ||
        message.includes("quero saber")
      ) {
        resposta = mensagemInicial;
      }

      else if (message === "menu") {
        resposta = mensagemMenu;
      }

      else if (message.includes("teste") || message.includes("testar")) {

        await axios.post(
          `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/video`,
          new URLSearchParams({
            token: TOKEN,
            to: from,
            video: VIDEO_URL,
            caption: "🎬 Olha o aplicativo funcionando na prática."
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        resposta = mensagemTeste;
      }

      else if (message === "1") {
        resposta = mensagemComoFunciona;
      }

      else if (message === "2") {

        await axios.post(
          `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/video`,
          new URLSearchParams({
            token: TOKEN,
            to: from,
            video: VIDEO_URL,
            caption: "🎬 Esse é o aplicativo funcionando na prática."
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        resposta = mensagemConteudoTexto;
      }

      else if (message === "3") {

        const preference = await axios.post(
          "https://api.mercadopago.com/checkout/preferences",
          {
            items: [{ title: "MasterPlay", quantity: 1, unit_price: 19.90 }],
            metadata: { phone: from },
            notification_url:
              "https://bot-streaming-41zm.onrender.com/mercadopago"
          },
          { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
        );

        pagamentosPendentes[from] = true;

        // 20 minutos
        setTimeout(async () => {
          if (pagamentosPendentes[from]) {
            await axios.get(
              `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
              {
                params: {
                  token: TOKEN,
                  to: from,
                  body: `Oi 😊

Vi que você iniciou a liberação mas ainda não finalizou.

Posso te ajudar em algo?`
                }
              }
            );
          }
        }, 20 * 60 * 1000);

        // 1 hora
        setTimeout(async () => {
          if (pagamentosPendentes[from]) {
            await axios.get(
              `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
              {
                params: {
                  token: TOKEN,
                  to: from,
                  body: `Ainda consigo liberar seu acesso por R$ 19,90 ✅

Quer que eu gere o link novamente?`
                }
              }
            );
          }
        }, 60 * 60 * 1000);

        resposta = `🔥 *Acesso Vitalício MasterPlay*

💰 R$ 19,90 pagamento único

👉 ${preference.data.init_point}

Após o pagamento, o acesso é liberado automaticamente ✅`;
      }

      else if (message === "4") {

        resposta = `👨‍💻 Você escolheu falar com o suporte.

Aguarde que entraremos em contato ✅`;

        await axios.post(
          `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
          new URLSearchParams({
            token: TOKEN,
            to: SEU_NUMERO,
            body: `📞 NOVO PEDIDO DE SUPORTE\nNúmero: ${from}`
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
      }

      else if (message === "5") {
        resposta = mensagemFAQ;
      }

      else {
        resposta = "Digite *menu* para ver as opções.";
      }

      await axios.get(
        `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
        {
          params: { token: TOKEN, to: from, body: resposta }
        }
      );
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Erro WhatsApp:", error.response?.data || error.message);
    res.sendStatus(200);
  }
});

// ================= WEBHOOK MERCADO PAGO =================

app.post("/mercadopago", async (req, res) => {
  try {
    if (req.body.type !== "payment") return res.sendStatus(200);

    const paymentId = req.body.data?.id;

    const payment = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` } }
    );

    if (payment.data.status === "approved") {

      const phone = payment.data.metadata?.phone;

      pagamentosPendentes[phone] = false;

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
