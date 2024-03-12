import express from 'express'
import { config } from 'dotenv'
import RotasPrestadores from './routes/prestador.js'

config() //Carregas as variáveis do .env

const app = express();
const {PORT} = process.env;

app.use(express.json()) // habilita o parse do JSON

//rota de conteúdo público 
app.use('/', express.static('public'))

//removendo o X-POWERED BY (dado que aparece ao apertar f12 > ir até network> seleciona api > e em seguida responsables)
app.disable('x-powered-by')

//Configurando o favicon
app.use('/favicon.ico', express.static('public/images/logo-api.png'))

//rota default
app.get('/api', (req, res)=> {
    res.status(200).json({
        message: 'API FATEC 100% FUNCIONAL 🚀',
        version: '1.0.0'
    })
})

//rotas da api
app.use('/api/prestadores', RotasPrestadores)


//Listen
app.listen(PORT, function(){
    console.log(`💻 Servidor rodando na porta ${PORT}`);
})