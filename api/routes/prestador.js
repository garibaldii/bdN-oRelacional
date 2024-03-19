import express, { Router } from "express";
import { connectToDatabase } from "../utils/mongodb.js";
import { check, validationResult } from 'express-validator'

const router = express.Router()
const { db, ObjectId } = await connectToDatabase()
const nomeCollection = 'prestadores'

const validaPrestador = [
    check('cnpj')
        .not().isEmpty().trim().withMessage('É obrigatório informar o cnpj')
        .isNumeric().withMessage('O Cnpj deve ter apenas números')
        .isLength({ min: 14, max: 14 }).withMessage('O CNPJ deve ter 14 números')
        .custom(async (cnpj) => {
            const contaPrestador = await db.collection(nomeCollection)
                .countDocuments({ 'cnpj': cnpj })
                if(contaPrestador > 0){
                    throw new Error('O CNPJ informado já está cadastrado!');
                }
        })




    ,
    check('razao_social')
        .not().isEmpty().trim().withMessage('A Razão social é obrigatória')
        .isLength({ min: 5 }).withMessage('A Razão é muito curta. Mínimo de 5')
        .isLength({ max: 200 }).withMessage('A Razão informada é muito longa. Máximo de 200 caracteres')
        .isAlphanumeric('pt-BR', { ignore: '/. ' }).withMessage('A razão social não pode conter caracteres especiais'),
    check('cep')
        .isLength({ min: 8, max: 8 }).withMessage('O CEP informado é inválido')
        .isNumeric().withMessage('O cep deve ter apenas números')
        .not().isEmpty().trim().withMessage('É obrigatório informar o CEP'),
    check('endereco.logradouro')
        .notEmpty().withMessage('O Logradouro é obrigatório'),
    check('endereco.bairro')
        .notEmpty().withMessage('O bairro é obrigatório'),
    check('endereco.localidade')
        .notEmpty().withMessage('Localidade é obrigatória'),
    check('endereco.uf')
        .isLength({ min: 2, max: 2 }).withMessage('UF é inválida'),
    check('cnae_fiscal')
        .isNumeric().withMessage('O CNAE deve ser um número'),
    check('nome_fantasia')
        .optional({ nullable: true }),
    check('data_inicio_atividade')
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('O formato de data é inválido.Informe yyyy-mm-dd'),
    check('localizacao.type')
        .equals('Point').withMessage('Tipo inválido'),
    check('localizacao.coordinates')
        .isArray().withMessage('Coordenadas inválidas'),
    check('localizacao.coordinates.*')
        .isFloat().withMessage('Os valores das coordenadas devem ser números')



]

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
            .sort({ order: 1 })
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

//GET /api/prestadores/id/:id
//lista o prestador de serviço pelo id
//parâmetros: id

router.get('/id/:id', async (req, res) => {
    try {
        const docs = []
        await db.collection(nomeCollection)
            .find({ '_id': { $eq: new ObjectId(req.params.id) } }, {})
            .forEach((doc) => {
                docs.push(doc)
            })
        res.status(200).json(docs)
    } catch (err) {
        res.status(500).json()
        errors: [{
            value: `${err.message}`,
            msg: 'Erro ao obter o prestador pelo ID',
            param: '/id/:id'
        }]
    }
})



//GET /api/prestadores/razao/:filtor
//lista o prestador de serviço pelo id
//parâmetros: id

router.get('/razao/:filtro', async (req, res) => {
    try {
        const filtro = req.params.filtro.toString()
        const docs = []
        await db.collection(nomeCollection)
            .find({
                $or: [
                    { 'razao_social': { $regex: filtro, $options: 'i' } },
                    { 'nome_fantasia': { $regex: filtro, $options: 'i' } }
                ]
            })
            .forEach((doc) => {
                docs.push(doc)
            })
        res.status(200).json(docs)

    } catch (err) {
        errors: [{
            value: `${err.message}`,
            msg: 'Erro ao obter o prestador pela razão social',
            param: '/razao/:filtro'
        }]
    }
})

//DELETE /api/prestadores/razao/:filtor
//remove o prestador de serviço pelo id
//parâmetros: id

router.delete('/:id', async (req, res) => {
    const result = await db.collection(nomeCollection).deleteOne({
        "_id": { $eq: new ObjectId(req.params.id) }
    })
    if (result.deletedCount === 0) {
        res.status(404).json({
            errors: [{
                value: `Não há nenhum prestador com o id ${req.params.id}`,
                msg: `Erro ao excluir o prestador`,
                param: '/:id'
            }]
        })
    } else {
        res.status(200).send(result)
    }
})

//DELETE /api/prestadores/razao/:filtor
//insere um novo prestador de serviço
//parâmetros: Objeto Prestador

router.post('/', validaPrestador, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        const prestador = await db.collection(nomeCollection).insertOne(req.body)
        res.status(201).json(prestador)//201 é o status created

    } catch (err) {
        res.status(500).json({ message: `${err.message} Erro no server` })
    }
})

export default router;