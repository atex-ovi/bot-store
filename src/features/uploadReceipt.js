// src/features/uploadReceipt.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { userState } from '../data/userState.js'
import { appendOrder } from '../utils/utils_order.js'
import { downloadMediaMessage } from 'atexovi-baileys'
import { respondToAdminAndUser } from '../utils/orderResponse.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function askReceiptUpload(sock, from) {
  userState.set(from, { step: 'waiting_receipt' })
  await sock.sendMessage(from, {
    text: '📤 Please upload your payment receipt (image). To speed up the process, you can include your full address in the same message.',
    footer: '© Tempe Crispy Store — Atex Ovi',
  })
}

export async function saveReceipt(sock, msg) {
  try {
    const from = msg.key.remoteJid
    const state = userState.get(from) || {}

    if (state.step !== 'waiting_receipt' && state.step !== 'waiting_address') {
      await sock.sendMessage(from, {
        text: 'ℹ️ Please tap "Buy Now" and choose a payment method before sending your payment receipt.',
      })
      return
    }

    const mediaBuffer = await downloadMediaMessage(msg).catch(() => null)
    if (!mediaBuffer) {
      await sock.sendMessage(from, { text: '❌ Failed to download payment receipt. Please resend your image.' })
      return
    }

    let buffer = mediaBuffer
    if (buffer.readable) {
      buffer = await new Promise((resolve, reject) => {
        const chunks = []
        buffer.on('data', (chunk) => chunks.push(chunk))
        buffer.on('end', () => resolve(Buffer.concat(chunks)))
        buffer.on('error', reject)
      })
    }

    const receiptsDir = path.join(process.cwd(), 'src', 'data', 'receipts')
    if (!fs.existsSync(receiptsDir)) fs.mkdirSync(receiptsDir, { recursive: true })

    const filename = `receipt_${Date.now()}.jpg`
    const filepath = path.join(receiptsDir, filename)
    fs.writeFileSync(filepath, buffer)

    let userMessage = ''
    if (msg.message?.imageMessage?.caption) userMessage = msg.message.imageMessage.caption.trim()
    else if (msg.message?.documentMessage?.caption) userMessage = msg.message.documentMessage.caption.trim()

    const order = {
      id: `ORD-${Date.now()}`,
      user: from,
      product: state.product || null,
      paymentMethod: state.paymentMethod || null,
      receiptFile: filepath,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    appendOrder(order)

    await respondToAdminAndUser(sock, from, order, filepath, userMessage)
  } catch (err) {
    console.error('[saveReceipt]', err)
    await sock.sendMessage(msg.key.remoteJid, {
      text: '❌ An error occurred while processing your payment receipt. Please try again.',
    })
  }
}