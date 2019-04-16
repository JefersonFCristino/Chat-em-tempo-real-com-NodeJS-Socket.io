const express = require('express')
const path = require('path')

const app = express()

// precisamos informar para o "app" que vai ter uma porta que vai ser acessada pelo websocket (websocket é um novo protocolo. Assim como temos o protocolo http, temos também o protocolo wss)

const server = require('http').createServer(app); // protocolo http

const io = require('socket.io')(server) // protocolo wss para o websocket. Isso retorna uma função, então já vamos chamar essa função direta mandando o nosso "server"

app.use(express.static(path.join(__dirname, 'public'))) // definindo a pasta onde vão ficar os nossos arquivos públicos/estáticos acessados pelo a aplicação

// por padrão, o Node utiliza as views ejs. Vamos fazer ele entender que estamos usando as views html

app.set('views', path.join(__dirname, 'public')) // definindo onde vão ficar as views
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.use('/', (req, res) => {
    res.render('index.html')
})

// definindo a forma de conexão do usuário com o nosso servidor de websocket
// io.on('connection', socket =>) = quer dizer que todas vez que um novo cliente se conectar ao nosso socket, vamos receber esse 'socket' que acabou de conectar

let messages = [] // array que vai armazenar todas as mensagens (já que não estamos trabalhando com banco de dados)

io.on('connection', socket => {
    console.log(`socket conectado: ${socket.id}`)

    socket.emit('previousMessage', messages) // Não perder as mensagens ao dar um refresh no browser. Como temos um array que está armazenando todas as mensagens, assim que um socket for conectado na nossa aplicação podemos enviar uma mensagem só pra ele. Vamos enviar todas as mensagens anteriores assim que ele conectar na aplicação. Também precisamos ouvir esse evento lá no frontend

    // recebedno os dados da mensagem lá do Frontend e fazendo a tratativa
    socket.on('sendMessage', data =>{
        messages.push(data) // colocamos os dados dentro do array que criamos

        socket.broadcast.emit('receivedMessage', data) // Vamos fazer aparecer as mensagens nas duas telas conforme elas são digitadas. socket.broadcast.emit = vai enviar para todo os sockets conectados na aplicação. agora lá no frontend precisamos ouvir esse 'receivedMessage'
    }) 
})

server.listen(3000);

// socket.on = ouvir uma mensagem
// socket.emit = enviar uma mensagem para o parâmetro "socket"