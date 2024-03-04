use('Estoque');

//Exemplo de insert//

db.produtos.insertOne({
    "codBarras":"1234567890123",
    "nome": "Arroz Agulhinha",
    "preco": 26.9
});

//Exemplo de select//
//SELECT * FROM PRODUTOS//

use('Estoque');

db.produtos.find()

//Exemplo com insertMany
use('Estoque')
db.produtos.insertMany([{
    "codBarras":"9876543210987",
    "nome": "Feijão",
    "preco": 8.5
},{
    "codBarras":"88888888888888",
    "nome": "Fraldinha 🥓",
    "preco": 29.99}
])

//SELECT nome, preco FROM PRODUTOS
use('Estoque');
db.produtos.find({},{_id:0, nome:1, preco:1}) //forma de selecionar de modo booleano o que será exibido com: true = 1, false = 0

use('Estoque');
db.produtos.find({codBarras:'1234567890123'}, {_id:0, codBarras:1, nome:1})

//SELECT codBarras, nome 
//FROM PRODUTOS
//WHERE nome
//LIKE '%ARROZ%'

use('Estoque')
db.produtos.find({nome: /arroz/i}, {_id:0, codBarras:1, nome:1})