import express from 'express'
import { getAllDiscs, getDiscById, clearCache, countVinylByIso2 } from '../controllers/disc.controller.js'

const router = express.Router()

router.get('/countVinylByIso2', countVinylByIso2)
router.get('/', getAllDiscs)
router.get('/:id', getDiscById)
router.delete('/cache', clearCache)

export default router
