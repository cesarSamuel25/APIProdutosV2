const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');


const server = express();
server.use(express.json());

const corsOption = {
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

server.use(cors(corsOption));

// Dados mongoDB
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
const url = config.dbConnectionString;

const client = new MongoClient(url);
const dbName = config.dbName;
const collectionName = config.collectionName;

//READ TOTAL
server.get('/produtos', async (req, res) => {

  try{
    await client.connect();
    console.log("Conectado ao banco de dados.");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const produtos = await collection.find({}).toArray();

    let arrayProdutos = [];

    for(let i = 0; i < produtos.length; i++){
      arrayProdutos[i] = produtos[i];
    }

    console.log("Produtos encontrados:")
    console.log(arrayProdutos);

    const jsonProdutos = JSON.stringify(arrayProdutos, null, 2);
    res.send(jsonProdutos);   

  } catch (err) {
    console.log('Erro ao consultar produtos', err)
    return 'Erro ao consultar produtos'   
    
  } finally {

    await client.close()
    console.log("Conexão ao servidor MongoDB Encerrada!")
  }
});

//READ UNICO
server.get('/produtos/:desc', async (req, res) => {
  const desc = req.params.desc;

  try{
    await client.connect();
    console.log("Conectado ao banco de dados.");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const produto = await collection.find({descricao: desc}).toArray();

    console.log("Produto encontrados:")
    console.log(produto);

    const jsonProduto = JSON.stringify(produto, null, 2);
    res.send(jsonProduto);   

  } catch (err) {
    console.log('Erro ao consultar produtos', err)
    return 'Erro ao consultar produtos'   
    
  } finally {

    await client.close()
    console.log("Conexão ao servidor MongoDB Encerrada!")
  }
});

//POST
server.post('/produtos', async (req, res) => {
  console.log(req.body)
  const body = req.body;

  try{
    await client.connect();
    console.log("Conectado ao banco de dados.");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.insertOne(body);

    res.send(`Produto inserido com sucesso!`)

  } catch (err) {
    console.log('Erro ao criar produtos', err)
    return 'Erro ao criar produtos'   
    
  } finally {

    await client.close()
    console.log("Conexão ao servidor MongoDB Encerrada!")
  }  
})

//UPDATE
server.patch('/produtos/:id', async (req, res) => {
  const idString = req.params.id;
  const body = req.body;

  const id = new ObjectId(idString); 

  try{
    await client.connect();
    console.log("Conectado ao banco de dados.");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const result = await collection.updateOne(
      {_id: id},
      {$set: body}
    );

    if (result.matchedCount === 0){ 
      res.status(404).send('Produto não encontrado'); 
    }else{
      res.status(200).send(`Produto atualizado com sucesso`);
    }

  } catch (err) {
    console.log('Erro ao atualizar produtos', err)
    return 'Erro ao atualizar produtos'   
    
  } finally {

    await client.close()
    console.log("Conexão ao servidor MongoDB Encerrada!")
  }  
})

// DELETE
server.delete('/produtos/:id', async (req, res) => {
  // 1. Pegue o ID da URL (ele está como string)
  const idString = req.params.id; 

  try{
    await client.connect();
    console.log("Conectado ao banco de dados.");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // 2. Converta a string do ID para um ObjectId do MongoDB
    const id = new ObjectId(idString); 

    const result = await collection.deleteOne({ _id: id }); // Use o ObjectId

    if (result.deletedCount === 0) {
        res.status(404).send("Produto não encontrado.");
    } else {
        res.send("Produto deletado com sucesso!");
    }
  }catch (err) {
    console.log('Erro ao remover produtos', err)
    res.status(500).send('Erro ao remover produtos');
  } finally {
    await client.close()
    console.log("Conexão ao servidor MongoDB Encerrada!")
  }
});


server.listen(3333);
