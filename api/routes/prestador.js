import express from "express";
import { connectToDatabase } from "../utils/mongodb.js";

const router = express.Router()
const { db, ObjectId } = await connectToDatabase()
const nomeCollection = 'prestadores'


//GET /api/prestadores
//lista todos os prestadores de serviço
//parâmetros: limit, skip e order


router.get('/', async (req, res) => {
    const { limit, skip, order } = req.query
    try {
        const docs = []
        await db.collection(nomeCollection)
        .find()
        .limit(parseInt(limit) || 10)
        .skip(parseInt(skip) || 0)
        .sort({order: 1})
        .forEach((doc) => {
            docs.push(doc)
        })
        res.status(200).json(docs)
    } catch (err) {
        res.status(500).json({
            message: 'Erro ao obter a listagem dos prestadores'
        })
    }
})


export default router;