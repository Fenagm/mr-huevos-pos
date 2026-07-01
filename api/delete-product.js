import { handler } from '../netlify/functions/delete-product.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
