import { app } from './app'
import { config } from './lib/config'

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${config.port}`)
})
