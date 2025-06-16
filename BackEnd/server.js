import app from './app.js'

import { getArtists } from './models/artist.model.js'
// const result = await getArtists()

app.listen(process.env.APP_PORT, () => {

  console.log(`Server running on http://${process.env.APP_HOST}:${process.env.APP_PORT}`)
})

