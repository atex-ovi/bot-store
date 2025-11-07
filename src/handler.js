import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { userState } from './data/userState.js'
import { sendProductMenu } from './features/storeMenu.js'
import { showProductDetail } from './features/orderHandler.js'
import { showPaymentMenu, handlePayment } from './features/paymentMenu.js'
import { saveReceipt } from './features/uploadReceipt.js'
import dotenv from 'dotenv'
import { respondToAdminAndUser } from './utils/orderResponse.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ADMIN_JID = process.env.ADMIN_JID

export async function handler(sock, msg) {
  if (!msg?.message) return
  const from = msg.key.remoteJid

  if (from === ADMIN_JID) return

  const state = userState.get(from) || { step: 'start' }

  let rowId = null
  try {
    if (msg.message?.interactiveResponseMessage?.nativeFlowResponseMessage) {
      rowId = JSON.parse(
        msg.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson
      ).id
    } else if (msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId) {
      rowId = msg.message.listResponseMessage.singleSelectReply.selectedRowId
    }
  } catch (err) {
    console.error('Gagal membaca respons interaktif:', err)
  }

  const btnId = msg.message?.buttonsResponseMessage?.selectedButtonId

  if (rowId && rowId.startsWith('tempe_')) {
    await showProductDetail(sock, from, rowId)
    userState.set(from, { step: 'product_selected', product: rowId })
    return
  }

  if (rowId && rowId.startsWith('pay_')) {
    await handlePayment(sock, from, rowId)
    return
  }

  if (btnId === 'buy_now') {
    const cur = userState.get(from) || {}
    await showPaymentMenu(sock, from, cur.product)
    return
  }

  if (state.step === 'waiting_receipt' || state.step === 'waiting_address') {
    if (msg.message?.imageMessage || msg.message?.documentMessage) {
      await saveReceipt(sock, msg)
      return
    }

    if (msg.message?.conversation) {
      const userMessage = msg.message.conversation.trim()
      const order = {
        id: state.orderId || `ORD-${Date.now()}`,
        user: from,
        product: state.product || null,
        paymentMethod: state.paymentMethod || null,
        receiptFile: null,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      await respondToAdminAndUser(sock, from, order, null, userMessage)
      userState.set(from, { step: 'done', product: state.product, paymentMethod: state.paymentMethod })
      return
    }
  }

  if (state.step === 'start' || state.step === 'menuMain') {
    await sendProductMenu(sock, from)
    userState.set(from, { step: 'menuMain' })
    return
  }
}