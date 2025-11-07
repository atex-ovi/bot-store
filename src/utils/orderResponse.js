import { sendToAdmin } from '../features/sendToAdmin.js'
import { userState } from '../data/userState.js'

export async function respondToAdminAndUser(sock, userJid, order, receiptFile = null, userMessage = '') {
  try {
    await sendToAdmin(sock, userJid, receiptFile, order, userMessage)

    const state = userState.get(userJid) || {}
    
    if (state.step === 'waiting_receipt') {
      if (userMessage) {
        await sock.sendMessage(userJid, {
          text: '✅ Thank you! Your payment proof and address have been received. Your order will be processed by the admin shortly.',
        })
        userState.set(userJid, { step: 'done', product: state.product, paymentMethod: state.paymentMethod })
      } else {
        await sock.sendMessage(userJid, {
          text: '✅ Thank you! Your payment proof has been received. Please send your full address here to speed up the delivery process.',
        })
        userState.set(userJid, { step: 'waiting_address', product: state.product, paymentMethod: state.paymentMethod })
      }
    } else if (state.step === 'waiting_address') {
      await sock.sendMessage(userJid, {
        text: '✅ Your full address has been forwarded to the admin. Your order will be processed soon.',
      })
      userState.set(userJid, { step: 'done', product: state.product, paymentMethod: state.paymentMethod })
    }
  } catch (err) {
    console.error('[respondToAdminAndUser]', err)
    await sock.sendMessage(userJid, { text: '❌ An error occurred while processing your order. Please try again later.' })
  }
}