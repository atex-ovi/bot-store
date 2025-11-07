// src/features/storeMenu.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function sendProductMenu(sock, from) {
  const bannerPath = path.join(__dirname, '../assets/tempe-brand.jpg')
  const buffer = fs.existsSync(bannerPath) ? fs.readFileSync(bannerPath) : null

  const listPayload = {
    title: 'Tempe Crispy Store',
    sections: [
      {
        title: 'Choose Your Flavor Variant:',
        rows: [
          { title: 'Original', description: 'Classic savory flavor — Rp10.000', id: 'tempe_original' },
          { title: 'Balado', description: 'Sweet and spicy Indonesian flavor — Rp12.000', id: 'tempe_balado' },
          { title: 'Pedas', description: 'Extra spicy sensation — Rp12.000', id: 'tempe_pedas' },
        ],
      },
    ],
  }

  const message = {
    footer: '© Tempe Crispy Store — Atex Ovi',
    interactiveButtons: [
      { name: 'single_select', buttonParamsJson: JSON.stringify(listPayload) },
    ],
  }

  const welcomeText = 
    'Welcome to *Tempe Crispy Store!*\n\nPlease choose your favorite flavor variant from the list below:'

  if (buffer) {
    await sock.sendMessage(from, {
      image: buffer,
      caption: welcomeText,
      ...message,
    })
  } else {
    await sock.sendMessage(from, {
      text: welcomeText,
      ...message,
    })
  }
}