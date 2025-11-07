// src/features/sendToAdmin.js
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()

const PRODUCT_NAMES = {
  tempe_original: 'Original',
  tempe_balado: 'Balado',
  tempe_pedas: 'Pedas',
}

export async function sendToAdmin(sock, userJid, filePath = null, order = null, userMessage = '') {
  const admin = process.env.ADMIN_JID
  if (!admin) {
    console.error('ADMIN_JID is not set in the .env file — unable to forward message to admin.')
    return
  }

  const cleanNumber = userJid.replace('@s.whatsapp.net', '')
  const productName = PRODUCT_NAMES[order?.product] || order?.product || 'Not specified'

  if (!filePath && userMessage) {
    const addressMsg = [
      `📍 Address from +${cleanNumber}:`,
      userMessage,
    ].join('\n')
    await sock.sendMessage(admin, { text: addressMsg })
    return
  }

  if (order) {
    const summary = [
      `🔔 *New Order Received*`,
      `From: +${cleanNumber}`,
      `Order ID: ${order.id}`,
      `Product: ${productName}`,
      `Payment Method: ${order.paymentMethod}`,
      `Time: ${order.createdAt}`,
    ].join('\n')
    await sock.sendMessage(admin, { text: summary })
  }

  if (userMessage && filePath) {
    await sock.sendMessage(admin, { text: `📍 Shipping Address:\n${userMessage}` })
  }

  if (filePath && fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath)
    await sock.sendMessage(admin, {
      image: buffer,
      caption: '📜 Payment receipt from buyer attached.',
    })
  }
}