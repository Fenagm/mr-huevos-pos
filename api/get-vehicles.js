import { handler } from '../netlify/functions/get-vehicles.js'
import { toVercelHandler } from '../lib/netlify-adapter.js'

export default toVercelHandler(handler)
