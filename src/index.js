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
    //const task = await Task.findById('5ef80122a1c42a63983ff796')
    //await task.populate('owner').execPopulate()
    //console.log(task.owner)

    const user = await User.findById('5ef7fca6f23a596376eddb3a')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

main()

//const pet = {
//    name: 'Hal'
//}
//
//pet.toJSON = function(){
//    return {}
//}
//
//console.log(JSON.stringify(pet))


//const jwt = require('jsonwebtoken')
//const myFunction = async() => {
//    const token = jwt.sign({ _id: 'abc123' }, 'thisismynewcourse',{expiresIn: '7 days'})//第一引数はデータベースの中の一意な値。第二引数はなんでも良いので好きな文字.これが署名になる
//    console.log(token)
//
//    const data = jwt.verify(token, 'thisismynewcourse')
//    console.log(data)
//}
//
//myFunction()

//インクリプションアルゴリズムを使うと、ハッシュ化したものを元に戻せる
//mypsaa => brabra(元には戻せない仕様になっている。)
//インクリプションは、元の値をとっておいて、ハッシュ化したらそのハッシュと同じになるか確認している
