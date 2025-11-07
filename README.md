<h1 align="center" style="font-size:72px;">
  WhatsApp Bot Store
</h1>
<br>

<p align="center">
  <!-- 🔹 Project Info -->
  <a href="https://www.npmjs.com/package/atexovi-baileys" target="_blank">
    <img src="https://img.shields.io/npm/v/atexovi-baileys?style=flat&logo=npm&logoColor=white&labelColor=CB3837&color=white" alt="npm version">
  </a>
  <a href="https://nodejs.org/en/" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-%3E%3D20-339933?style=flat&logo=node.js&logoColor=white" alt="Node.js version">
  </a>
  <a href="https://github.com/atex-ovi/bot-store/blob/main/LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat&logo=balance-scale&logoColor=black" alt="License MIT">
  </a>
</p>

<p align="center">
  <!-- 🔹 GitHub Stats -->
  <a href="https://github.com/atex-ovi/bot-store/stargazers" target="_blank">
    <img src="https://img.shields.io/github/stars/atex-ovi/bot-store?style=flat&logo=github&labelColor=181717&color=white" alt="GitHub Stars">
  </a>
  <a href="https://github.com/atex-ovi/bot-store/network/members" target="_blank">
    <img src="https://img.shields.io/github/forks/atex-ovi/bot-store?style=flat&logo=github&labelColor=181717&color=white" alt="GitHub Forks">
  </a>
  <a href="https://github.com/atex-ovi/bot-store/issues" target="_blank">
    <img src="https://img.shields.io/github/issues/atex-ovi/bot-store?style=flat&logo=github&labelColor=181717&color=white" alt="GitHub Issues">
  </a>
  <a href="https://github.com/atex-ovi/bot-store/commits/main" target="_blank">
    <img src="https://img.shields.io/github/last-commit/atex-ovi/bot-store?style=flat&logo=git&labelColor=181717&color=white" alt="Last Commit">
  </a>
</p>

<p align="center">
  <!-- 🔹 Donate & Contact -->
  <a href="https://github.com/sponsors/atex-ovi" target="_blank">
    <img src="https://img.shields.io/badge/Sponsor-%23f06?style=flat&logo=github-sponsors&logoColor=white" alt="GitHub Sponsors">
  </a>
  <a href="https://saweria.co/atexovi" target="_blank">
    <img src="https://img.shields.io/badge/Saweria-FFA726?style=flat&logo=ko-fi&logoColor=white" alt="Saweria">
  </a>
  <a href="https://t.me/atexovi" target="_blank">
    <img src="https://img.shields.io/badge/Telegram-29A9EB?style=flat&logo=telegram&logoColor=white" alt="Telegram">
  </a>
  <a href="https://facebook.com/atex.ovi" target="_blank">
    <img src="https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white" alt="Facebook">
  </a>
</p>

<br>

<p align="center">
  <strong style="font-size:24px;">
    An interactive WhatsApp store bot template.  
    Manage products, receive orders, and accept payments with interactive buttons.
  </strong>
</p>

## Features

* Interactive product menus with multiple options
* Order handling & receipt upload
* Multiple payment methods (OVO, DANA, GoPay, ShopeePay)
* Automatic notifications to admin
* Quick reply and CTA buttons
* State management for users during the ordering process
* Easily customizable product catalog

<br><br>

## Demo Screenshots

<table> 
<tr> 
<td><img src="https://raw.githubusercontent.com/atex-ovi/bot-store/main/src/assets/tempe-original.jpg" width="150"></td> 
<td><img src="https://raw.githubusercontent.com/atex-ovi/bot-store/main/src/assets/tempe-balado.jpg" width="150"></td> 
<td><img src="https://raw.githubusercontent.com/atex-ovi/bot-store/main/src/assets/tempe-pedas.jpg" width="150"></td> 
<td><img src="https://raw.githubusercontent.com/atex-ovi/img-assets/main/e-wallet.jpg" width="150"></td>
</tr>
</table>

<br><br>

## Quick Start

- **Termux Android**
```bash
pkg update && pkg upgrade
pkg install nodejs git
git clone git@github.com:atex-ovi/bot-store.git
cd bot-store
npm install
cp .env.example .env
nano .env  # edit ADMIN_JID and payment info
npm start

```
- **Windows / Linux
```bash
git clone git@github.com:atex-ovi/bot-store.git
cd bot-store
npm install
cp .env.example .env   # Windows: copy .env.example .env
nano .env               # edit ADMIN_JID and payment info
npm start

```
> [!TIP]
> After `npm start`, follow the pairing code in the terminal to connect WhatsApp.

## Directory Structure
```
bot-store/
├── README.md
├── .env.example
├── .gitignore
├── index.js
├── package.json
└── src
    ├── assets
    │   ├── e-wallet.jpg
    │   ├── tempe-original.jpg
    │   ├── tempe-balado.jpg
    │   └── tempe-pedas.jpg
    ├── data
    │   ├── orders.json
    │   ├── receipts/
    │   └── userState.js
    ├── features
    │   ├── orderHandler.js
    │   ├── paymentMenu.js
    │   ├── sendToAdmin.js
    │   ├── storeMenu.js
    │   └── uploadReceipt.js
    ├── handler.js
    └── utils
        ├── orderResponse.js
        ├── typing.js
        └── utils_order.js
```

## Environment Variables
Rename `.env.example` to `.env` and edit the following:
Salin kode
```
# Admin JID
ADMIN_JID=62xxxxxxxxxxx@s.whatsapp.net

# Payment account numbers
PAY_OVO=08xxxxxxxxxx
PAY_SHOPEEPAY=08xxxxxxxxxx
PAY_DANA=08xxxxxxxxxx
PAY_GOPAY=08xxxxxxxxxx

# Optional payment URLs
PAY_OVO_URL=https://ovo.id/payment/abcdef12345
PAY_SHOPEEPAY_URL=https://shopeepay.link/abcdef12345
PAY_DANA_URL=https://link.dana.id/minta/qr/123456abcdef
PAY_GOPAY_URL=https://gopay.link/u/abcdef12345

# Recipient name
PAY_RECIPIENT_NAME=Atex Ovi
```
> [!IMPORTANT]
> Do not commit `.env` to public repository.

> [!NOTE]
> - All product titles are placeholders; customize as needed.
> - Upload receipts images and include address to speed up order processing.
> - Admin will automatically receive notifications for new orders.
> - Supports multiple payment methods with CTA buttons.
