const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ================= SUPABASE =================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ================= CONFIG =================

const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";
const SEU_NUMERO = "5524999096129";

const BOT_ATIVO = true;

// ================= MENSAGENS =================

const mensagemBoasVindas = `📡🔥 *ATLAS – Acesso Completo a TV e Streaming*

Com o ATLAS você tem:

📺 Canais ao vivo  
🎬 Filmes  
📺 Séries  
⚽ Esportes  
🎌 Animes e doramas  
👶 Infantil  

✅ Funciona em TV, celular e computador`;

const mensagemMenu = `📋 *Menu ATLAS*

1️⃣ Teste grátis  
2️⃣ Ver planos  
3️⃣ Indique e ganhe  
4️⃣ Suporte  

Digite o número da opção 👇`;

const mensagemAparelho = `✅ Vamos liberar seu teste gratuito (3 horas).

Em qual aparelho você vai instalar?

1️⃣ Smart TV / TV Box  
2️⃣ Celular  
3️⃣ Notebook / Computador`;

const mensagemPlanos = `🔥 *PLANOS ATLAS*

1️⃣ 1 mês – R$ 29,90  
2️⃣ 2 meses – R$ 49,90  
3️⃣ 3 meses – R$ 74,90  
4️⃣ 4 meses – R$ 99,90  
5️⃣ 6 meses – R$ 149,90  
6️⃣ 12 meses – R$ 249,90  

Digite o plano desejado 👇`;

const mensagemIndique = `💰 *Indique e Ganhe – ATLAS*

A cada 2 amigos ativos:
🎁 Você ganha 1 mês grátis.

Após 10 ativos:
💵 Você ganha R$10 por cliente.`;

// ================= FUNÇÃO USUÁRIO =================

async function criarOuBuscarUsuario(phone) {
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (existingUser) return existingUser;

  const ultimos4 = phone.slice(-4);
  const cupom = `ATLAS${ultimos4}`;

  const { data, error } = await supabase
    .from("users")
    .insert([{ phone, cupom, etapa: "menu" }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar usuário:", error);
    return null;
  }

  return data;
}

async function atualizarEtapa(phone, etapa) {
  await supabase
    .from("users")
    .update({ etapa })
    .eq("phone", phone);
}

// ================= STATUS =================

app.get("/", (req, res) => {
  res.send("✅ ATLAS Bot Online!");
});

// ================= WEBHOOK =================

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.event_type === "message_received" && body.data) {

      const from = body.data.from.replace("@c.us", "");
      const message = body.data.body?.trim().toLowerCase();

      const user = await criarOuBuscarUsuario(from);
      if (!user) return res.sendStatus(200);

      if (!BOT_ATIVO) return res.sendStatus(200);

      // ✅ MENU UNIVERSAL
      if (message === "menu") {
        await atualizarEtapa(from, "menu");
        await enviarMensagem(from, mensagemBoasVindas + "\n\n" + mensagemMenu);
        return res.sendStatus(200);
      }

      // ✅ FLUXO BASEADO NA ETAPA
      switch (user.etapa) {

        case "menu":

          if (message === "1") {
            await atualizarEtapa(from, "escolhendo_aparelho");
            await enviarMensagem(from, mensagemAparelho);
          }

          else if (message === "2") {
            await atualizarEtapa(from, "escolhendo_plano");
            await enviarMensagem(from, mensagemPlanos);
          }

          else if (message === "3") {
            await enviarMensagem(from, mensagemIndique);
          }

          else if (message === "4") {
            await atualizarEtapa(from, "suporte");

            await enviarMensagem(from, "👨‍💻 Você está falando com o suporte. Aguarde atendimento ✅");

            await enviarMensagem(SEU_NUMERO, `📞 Cliente chamou suporte\nNúmero: ${from}`);
          }

          else {
            await enviarMensagem(from, mensagemMenu);
          }

          break;

        case "escolhendo_aparelho":

          if (["1","2","3"].includes(message)) {
            await atualizarEtapa(from, "menu");
            await enviarMensagem(from, "✅ Perfeito! Vou preparar seu teste.\nEm instantes envio seu login.");
            await enviarMensagem(SEU_NUMERO, `🎁 Novo teste solicitado\nNúmero: ${from}`);
          } else {
            await enviarMensagem(from, mensagemAparelho);
          }

          break;

        case "escolhendo_plano":

          if (["1","2","3","4","5","6"].includes(message)) {
            await atualizarEtapa(from, "menu");
            await enviarMensagem(from, "✅ Plano selecionado!\nVou gerar seu pagamento agora.");
            await enviarMensagem(SEU_NUMERO, `💰 Cliente escolheu plano ${message}\nNúmero: ${from}`);
          } else {
            await enviarMensagem(from, mensagemPlanos);
          }

          break;

        default:
          await atualizarEtapa(from, "menu");
          await enviarMensagem(from, mensagemMenu);
      }
    }

    res.sendStatus(200);

  } catch (error) {
    console.error("Erro WhatsApp:", error);
    res.sendStatus(200);
  }
});

// ================= FUNÇÃO ENVIAR =================

async function enviarMensagem(to, body) {
  await axios.get(
    `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
    {
      params: { token: TOKEN, to, body }
    }
  );
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
