import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'

export async function createTestApp() {
  const dev = process.env.NODE_ENV !== 'production'
  const app = next({ dev, dir: process.cwd() })
  const handle = app.getRequestHandler()

  await app.prepare()

  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  return new Promise((resolve) => {
    server.listen(0, () => {
      const address = server.address()
      const port = typeof address === 'string' ? address : address?.port

      // Create test app wrapper for supertest compatibility
      const testApp = {
        address: () => ({ port }),
        close: () => new Promise<void>((resolve) => {
          server.close(() => resolve())
        }),
        callback: () => server,
        // Add supertest compatibility
        listen: server.listen.bind(server),
        set: () => testApp,
        get: () => testApp,
      }

      resolve(testApp)
    })
  })
}
