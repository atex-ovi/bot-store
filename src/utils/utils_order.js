// src/features/utils_order.js
import fs from 'fs'
import path from 'path'

const ORDERS_FILE = path.join(process.cwd(), 'src', 'data', 'orders.json')

export function appendOrder(order) {
  try {
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]')
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8')
    const arr = JSON.parse(raw || '[]')
    arr.push(order)
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(arr, null, 2))
  } catch (err) {
    console.error('[appendOrder]', err)
  }
}