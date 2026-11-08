const fs = require('node:fs')
const path = require('node:path')

const [paymentCode, amount, backend = 'http://localhost:8080'] = process.argv.slice(2)
if (!paymentCode || !amount) {
  console.log('Usage: node scripts/simulate-sepay-payment.cjs <paymentCode> <amount> [backendUrl]')
  console.log('Copy the payment code (LMS...) and the amount from the payment QR page.')
  process.exit(1)
}

const env = {}
const envFile = path.join(__dirname, '..', 'backend', '.env')
for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (match) env[match[1]] = match[2].trim()
}

const pad = (n) => String(n).padStart(2, '0')
const now = new Date()
const transactionDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

fetch(`${backend}/api/v1/registrations/webhooks/sepay`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Apikey ${env.SEPAY_WEBHOOK_API_KEY}` },
  body: JSON.stringify({
    id: Date.now(),
    accountNumber: env.SEPAY_ACCOUNT_NUMBER,
    subAccount: env.SEPAY_SUB_ACCOUNT || null,
    content: `${paymentCode} chuyen tien`,
    transferType: 'in',
    transferAmount: Number(amount),
    transactionDate,
  }),
})
  .then(async (response) => console.log(`Webhook sent: HTTP ${response.status} ${await response.text()}`))
  .catch((error) => console.error('Cannot reach the backend:', error.message))
