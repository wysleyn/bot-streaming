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

// ================= CONFIGURAÇÕES =================

const TOKEN = "a2sgqtw8lehf0q3i";
const INSTANCE_ID = "171812";
const SEU_NUMERO = "5524999096129";

// ✅ BOT ATIVO PARA TESTE
const BOT_ATIVO = true;

// ================= MENSAGENS ATLAS =================

const mensagemBoasVindas = `📡🔥 *ATLAS – Acesso Completo a TV e Streaming*

Chega de pagar várias plataformas separadas.

Com o ATLAS você tem:

📺 Canais ao vivo  
🎬 Filmes  
📺 Séries  
⚽ Esportes  
🎌 Animes e doramas  
👶 Infantil  

✅ Funciona em TV, celular e computador

Escolha uma opção 👇`;

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
💵 Você ganha R$10 por cliente.

Seu código será gerado automaticamente ✅`;

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
    .insert([{ phone, cupom }])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar usuário:", error);
    return null;
  }

  return data;
}

// ================= STATUS =================

app.get("/", (req, res) => {
  res.send("✅ ATLAS Bot Online!");
});

// ================= WEBHOOK WHATSAPP =================

app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;

    if (body.event_type === "message_received" && body.data) {

      const from = body.data.from.replace("@c.us", "");
      const message = body.data.body?.trim().toLowerCase();

      // ✅ sempre cria usuário
      const user = await criarOuBuscarUsuario(from);
      if (!user) return res.sendStatus(200);

      // ✅ bloqueia respostas se desativado
      if (!BOT_ATIVO) return res.sendStatus(200);

      let resposta = "";

      if (message === "oi" || message === "menu") {
        resposta = mensagemBoasVindas + "\n\n" + mensagemMenu;
      }

      else if (message === "1") {
        resposta = mensagemAparelho;
      }

      else if (message === "2") {
        resposta = mensagemPlanos;
      }

      else if (message === "3") {
        resposta = mensagemIndique;
      }

      else if (message === "4") {

        resposta = "👨‍💻 Você está falando com o suporte. Aguarde atendimento ✅";

        await axios.post(
          `https://api.ultramsg.com/instance${INSTANCE_ID}/messages/chat`,
          new URLSearchParams({
            token: TOKEN,
            to: SEU_NUMERO,
            body: `📞 CLIENTE CHAMOU SUPORTE\nNúmero: ${from}`
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
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

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
