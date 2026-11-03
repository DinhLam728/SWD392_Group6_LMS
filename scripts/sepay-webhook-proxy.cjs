const http = require('node:http')

const webhookPath = '/api/v1/registrations/webhooks/sepay'
const server = http.createServer((request, response) => {
  if (request.method !== 'POST' || request.url !== webhookPath) {
    response.writeHead(404).end()
    return
  }
  const upstream = http.request({
    hostname: '127.0.0.1',
    port: 8080,
    path: webhookPath,
    method: 'POST',
    headers: { ...request.headers, host: 'localhost:8080' },
    timeout: 15000,
  }, (result) => {
    response.writeHead(result.statusCode, result.headers)
    result.pipe(response)
  })
  upstream.on('timeout', () => upstream.destroy())
  upstream.on('error', () => {
    if (!response.headersSent) response.writeHead(502)
    response.end('Backend unavailable')
  })
  request.on('aborted', () => upstream.destroy())
  request.pipe(upstream)
})
server.listen(18081, '127.0.0.1')
