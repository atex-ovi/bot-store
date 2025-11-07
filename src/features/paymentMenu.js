// src/features/paymentMenu.js
import { userState } from '../data/userState.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ACC = {
  OVO: process.env.PAY_OVO || '085612345678 (OVO)',
  SHOPEEPAY: process.env.PAY_SHOPEEPAY || '085612345678 (ShopeePay)',
  DANA: process.env.PAY_DANA || '085612345678 (DANA)',
  GOPAY: process.env.PAY_GOPAY || '085612345678 (GoPay)',
}

const CTA_URLS = {
  OVO: process.env.PAY_OVO_URL || null,
  SHOPEEPAY: process.env.PAY_SHOPEEPAY_URL || null,
  DANA: process.env.PAY_DANA_URL || null,
  GOPAY: process.env.PAY_GOPAY_URL || null,
}

export async function showPaymentMenu(sock, from, productId) {
  const productLine = productId
    ? `You have selected *${productId.replace('tempe_', '').toUpperCase()}*.\n\n`
    : ''

  const listPayload = {
    title: 'Payment Methods',
    sections: [
      {
        title: 'Available options:',
        rows: [
          { title: 'DANA', description: '', id: 'pay_dana' },
          { title: 'GoPay', description: '', id: 'pay_gopay' },
          { title: 'OVO', description: '', id: 'pay_ovo' },
          { title: 'ShopeePay', description: '', id: 'pay_shopeepay' },
        ],
      },
    ],
  }

  const bannerPath = path.join(__dirname, '../assets/e-wallet.jpg')
  const buffer = fs.existsSync(bannerPath) ? fs.readFileSync(bannerPath) : null

  const message = {
    footer: '© Tempe Crispy Store — Atex Ovi',
    interactiveButtons: [{ name: 'single_select', buttonParamsJson: JSON.stringify(listPayload) }],
  }

  const captionText = productLine + 'Please select one of the available payment methods below:'

  if (buffer) {
    await sock.sendMessage(from, {
      image: buffer,
      caption: captionText,
      ...message,
    })
  } else {
    await sock.sendMessage(from, {
      text: captionText,
      ...message,
    })
  }

  // Save user state
  const state = userState.get(from) || {}
  if (productId) state.product = productId
  userState.set(from, state)
}

export async function handlePayment(sock, from, payId) {
  const method = payId.replace('pay_', '').toUpperCase()
  const account = ACC[method]
  const url = CTA_URLS[method] || null

  const state = userState.get(from) || {}
  state.paymentMethod = method
  state.step = 'waiting_receipt'
  userState.set(from, state)

  const recipientName = process.env.PAY_RECIPIENT_NAME || 'Placeholder'

  const text = `💳 *Payment Instructions*

Method: ${method}
Send to: ${account} (Recipient: ${recipientName})

After completing the payment:
1. Send a photo of your payment receipt.
2. Include your full shipping address here to speed up the process.`

  if (url) {
    await sock.sendMessage(from, {
      text,
      footer: '© Tempe Crispy Store — Atex Ovi',
      interactiveButtons: [
        {
          name: 'cta_url',
          buttonParamsJson: JSON.stringify({
            display_text: 'Pay Now',
            url,
          }),
        },
      ],
    })
  } else {
    await sock.sendMessage(from, {
      text: text + '\n\n(Auto-payment link is not available for this method.)',
      footer: '© Tempe Crispy Store — Atex Ovi',
    })
  }
}