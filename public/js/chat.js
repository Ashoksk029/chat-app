const socket = io()

//getting input from html
const $messageForm = document.querySelector('#msg-form')
const $formButton = $messageForm.querySelector('button')
const $inputForm = $messageForm.querySelector('input')
const $locButton = document.querySelector('#loc')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $LocationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


//Query string
const { username,room }= Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
    //New message element
    const $newMessage = $messages.lastElementChild


    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    //new Visible height
    const visibleHeight = $messages.offsetHeight


    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //how far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('Message',(message)=>{
    console.log(message)
    const html = Mustache.render($messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('LocationMessage',(message)=>{
    console.log(message)
    const html = Mustache.render($LocationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    $sidebar.innerHTML = html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    // const name = document.querySelector('#name').value

    $formButton.setAttribute('disabled','disabled')

    const name = e.target.elements.msg.value
    socket.emit('sendMsg',name,(error,msg)=>{
        // form functions like getting focus
        $formButton.removeAttribute('disabled')
        $inputForm.value=''
        $inputForm.focus()

        if(error){
            return console.log(error)
        }
        console.log("Hey dummy I sent the msg...",msg)
    })
})

$locButton.addEventListener('click',(e)=>{
    e.preventDefault()
    $locButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation){
        return alert('Your browser does not support Location')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        const coords= {
            latitude:position.coords.latitude,
            longitude:position.coords.longitude,
            Accuracy: position.coords.accuracy
        }
        socket.emit('sndLoc',coords,()=>{
            $locButton.removeAttribute('disabled')
            console.log("Location Shared")
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})
