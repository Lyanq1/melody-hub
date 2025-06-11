import app from './app.js'
import { env } from './config/environment.js'
import { getArtists } from './models/artist.model.js'

// const result = await getArtists()
app.listen(env.APP_PORT, () => {
  // console.log(result)
  console.log(`Server running on http://${env.APP_HOST}:${env.APP_PORT}`)
})
