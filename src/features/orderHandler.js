// src/features/orderHandler.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PRODUCTS = {
  tempe_original: {
    id: 'tempe_original',
    title: 'Tempe Crispy Original',
    price: 'Rp10.000',
    desc: 'Crispy and savory — a timeless classic loved by everyone.',
    image: path.join(__dirname, '../assets/tempe-original.jpg'),
  },
  tempe_balado: {
    id: 'tempe_balado',
    title: 'Tempe Crispy Balado',
    price: 'Rp12.000',
    desc: 'Sweet and spicy Balado flavor that will keep you coming back for more.',
    image: path.join(__dirname, '../assets/tempe-balado.jpg'),
  },
  tempe_pedas: {
    id: 'tempe_pedas',
    title: 'Tempe Crispy Pedas',
    price: 'Rp12.000',
    desc: 'For true spice lovers — a perfect mix of heat and crunch.',
    image: path.join(__dirname, '../assets/tempe-pedas.jpg'),
  },
}

export function getProduct(productId) {
  return PRODUCTS[productId] || null
}

export async function showProductDetail(sock, from, productId) {
  const product = getProduct(productId)
  if (!product) {
    await sock.sendMessage(from, { text: 'Product not found.' })
    return
  }

  const buffer = fs.existsSync(product.image) ? fs.readFileSync(product.image) : null
  const caption = `*${product.title}*\nPrice: ${product.price}\n\n${product.desc}\n\nPress the "Buy Now" button to continue.`

  const buyButton = [{ buttonId: 'buy_now', buttonText: { displayText: 'Buy Now' }, type: 1 }]

  if (buffer) {
    await sock.sendMessage(from, {
      image: buffer,
      caption,
      footer: '© Tempe Crispy Store — Atex Ovi',
      buttons: buyButton,
      headerType: 4,
    })
  } else {
    await sock.sendMessage(from, {
      text: caption,
      footer: '© Tempe Crispy Store — Atex Ovi',
      buttons: buyButton,
    })
  }
}