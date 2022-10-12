var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')

app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

var dbUrl = 'mongodb+srv://m001-student:m001-mongodb-basics@cluster0.xzmgc.mongodb.net/?retryWrites=true&w=majority'

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

app.get('/messages', (req, resp) => {
    Message.find({}, (err, messages) => {
        resp.send(messages)
    })
})

app.get('/messages/:user', (req, resp) => {
    var user = req.params.user
    Message.find({name: user}, (err, messages) => {
        resp.send(messages)
    })
})

app.post('/messages', async (req, res) => {

    try {
        var message = new Message(req.body)

        var savedMessage = await message.save()
    
        console.log('Saved')
    
        var censored = await Message.findOne({message: 'badword'})
           
        if (censored) 
            await Message.deleteOne({_id: censored.id})
        else
            io.emit('message', req.body)
        res.sendStatus(200)
    } catch (error) {
        res.sendStatus(500)
        return console.error(error)

    } finally {
        //logger.log('message post called)'
        console.log("message post called")
        //close connection
    }

})

io.on('connection', (socket) => {
    console.log("User Connected")
})

mongoose.connect(dbUrl, (err) => {
    console.log('mongo db connection', err)
})

var server = http.listen(3000, ()=> {
    console.log('Server is listening on port ', server.address().port)
})

