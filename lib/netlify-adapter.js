// Adapts an existing Netlify-style handler `(event) => { statusCode, headers, body }`
// into a Vercel Node serverless function `(req, res)`.
// This lets us reuse all the functions in `netlify/functions/` unchanged on Vercel.
export function toVercelHandler(handler) {
  return async function (req, res) {
    // Normalize the request into the Netlify `event` shape the handlers expect.
    let rawBody = ''
    if (req.body != null) {
      rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    }

    const event = {
      httpMethod: req.method,
      headers: req.headers || {},
      queryStringParameters: req.query || {},
      body: rawBody,
      path: req.url,
    }

    try {
      const result = (await handler(event, {})) || {}
      const { statusCode = 200, headers = {}, body = '' } = result

      for (const [key, value] of Object.entries(headers)) {
        res.setHeader(key, value)
      }

      res.status(statusCode).send(body)
    } catch (err) {
      console.error('[v0] netlify-adapter error:', err)
      res.status(500).json({ success: false, error: err?.message || 'Internal Server Error' })
    }
  }
}
