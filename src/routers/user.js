const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')

const { sendWelcomeEmail, sendGoodbyeEmail } = require('../emails/account')

const router = new express.Router()

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
      await user.save()
      sendWelcomeEmail(user.email, user.name) //sgMail.sendは非同期処理だが、これ以降の処理をする前にこの処理を終えている必要がないので、async,awaitは使わない
      const token = await user.generateAuthToken()
      res.status(201).send({user, token})
  } catch (e) {
      res.status(400).send(e)
  }
})

//自分のアカウントにログインする
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password) //User.findByCredentials()はEメール、パスワードを引数にとり、userをemailによって検索し、パスワードをverifyする
        const token = await user.generateAuthToken()
        res.send({ user, token }) //ログインに成功した時の処理  
    }catch(e){
        res.status(400).send()
    }
})

//ログアウトする
router.post('/users/logout', auth, async (req, res) => {
    //認証用トークンを確認してログアウトする→authの中にtokenを作る（auth.js)
    try {
        //userデータベースのtokens配列の中身を変更。
        //filter処理を使い、トークンプロパティと、_idを持つものにアクセス？
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    }catch(e){
        res.status(500).send()

    }
})

router.post('/users/logoutAll', auth, async(req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }
  
    try {
      //const user = await User.findById(req.params._id)
      //'/users/me'にしたのでもう必要ない。req.userから、直にuserにアクセスできる.
      //以下のコードのuser変数を全てreq.userに置き換え
  
      updates.forEach((update) =>  req.user[update] = req.body[update])
      await req.user.save()
    　　res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
  })

router.delete('/users/me', auth, async (req, res) => {
    try {  
        await req.user.remove()
        sendGoodbyeEmail(req.user.email, req.user.name)
        res.send(req.user) //res.send(user)だとuserは既にコメントアウトしてるので動かない
    } catch (e) {
        res.status(500).send()
    }
  })

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
            return cb (new Error('Please upload image'))
        }
    cb(undefined, true)
    }
})

router.post('/users/me/avatar',auth, upload.single('avatar'),async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer() //sharpは非同期なのでawait
    req.user.avatar = buffer
    await req.user.save()
    res.send()
},(error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


router.get('/users/:id/avatar', async(req, res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')//'users/me/avatar'で　sharpを使ってファイル形式をpngにしてるのでこれはいつでも成立
        res.send(user.avatar)
    }catch(e){
        res.status(404).send()
    }
})

module.exports = router
