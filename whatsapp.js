const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const qrcode = require("qrcode-terminal")
const P = require("pino")

async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger: P({ level: "debug" }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: "silent" }))
        },
        browser: ["Windows", "Chrome", "120.0.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update

        if (qr) {
            console.log("\n📲 Escaneie o QR Code abaixo:\n")
            qrcode.generate(qr, { small: true })
        }

        if (connection === "open") {
            console.log("✅ WhatsApp conectado com sucesso!")
        }

        if (connection === "close") {
            console.log("❌ Conexão fechada.")
        }
    })

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return

        const sender = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""

        console.log("📩 Nova mensagem de:", sender)
        console.log("💬 Texto:", text)

        await sock.sendMessage(sender, {
            text: "👋 Olá! Você entrou em contato com a MasterPlay.\n\nNosso atendimento automático está ativo 🚀"
        })
    })
}

startWhatsApp()