const express = require('express')
require('./db/mongoose')

const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
//process.env.PORTはherokuで動かす時のポート
const port = process.env.PORT 

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

//const router = new express.Router()
//
////新しいルーターを作成
//router.get('/test', (req, res) => {
//  res.send('This is from my other router')
//})
//
////routerをモジュールとして登録
//app.use(router)


app.listen(port, () => {
    console.log('Server is up on port ' + port)
})

const Task = require('./models/task')
const User = require('./models/user')

const main = async() => {

    const user = await User.findById('5ef7fca6f23a596376eddb3a')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

main()
