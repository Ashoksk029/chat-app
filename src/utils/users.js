const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room})=>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()


    if(!username || !room){
        return{
            error:"Username and room are required"
        }
    }

    //check for existing User
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate Username
    if(existingUser){
        return{
            error:"Username is in Use"
        }
    }

    //store User
    const user = {id, username, room}
    users.push(user)
    return{ user }
}

//remove User
const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)

    if(index!=-1){
        return users.splice(index,1)[0]
    }
}

//getUser
const getUser = (id)=>{
    return users.find((user)=>user.id === id)
}

const getUsersInRoom = (room)=>{
    room.trim().toLowerCase()
    return users.filter((user)=>user.room === room)
}


module.exports = {
    addUser,
    getUser,
    removeUser,
    getUsersInRoom
}