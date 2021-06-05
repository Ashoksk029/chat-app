const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('../src/utils/message')
const { addUser, getUser, removeUser, getUsersInRoom } = require('../src/utils/users')


const app = express()
const server = http.createServer(app)
const port = process.env.PORT||3000
const io = socketio(server)


const publicpath = path.join(__dirname,'../public')

app.use(express.static(publicpath))



io.on('connection',(socket)=>{
    console.log("New websocket Connection")
    
    socket.on('join',(options, callback)=>{

        const { error,user } = addUser({id:socket.id, ...options})//options = {username,room}

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('Message',generateMessage('Admin',`Welcome!, ${user.username}`))

        //this will deliver the message that user has joined
        socket.broadcast.to(user.room).emit('Message',generateMessage('Admin',`${user.username} has joined`))

        // socket.emit, io.emit, socket.broadcast.emit
        //io.to.emit, socket.broadcast.to.emit

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })


    socket.on('sendMsg',(message, callback)=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Profanity Leads to ban!!")
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('Message',generateMessage(user.username,message))
        callback(undefined,"Received Bruh")
    })
    
    socket.on('sndLoc',(coords,callback)=>{
        const user = getUser(socket.id)
        const url = `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
        io.to(user.room).emit('LocationMessage',generateLocationMessage(user.username,url))
        callback()
    })

    //this will deliver the message that user has left
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('Message',generateMessage('Admin',`${user.username} has left...`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })
})

server.listen(port,()=>{
    console.log("Listening on port",port)
})