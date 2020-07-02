const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()


router.get('/test', (req, res) => {
  res.send('From a new file')
})

router.post('/tasks',auth, async (req, res) => {
  //const task = new Task(req.body)
  const task  = new Task({
      ...req.body,  //...で、指定したオブジェクトをコピー
      owner: req.user._id
  })

  try {
      await task.save()
      res.status(201).send(task)
  } catch (e) {
      res.status(400).send(e)
  }
})
//GET /tasks?complete=true /tasks?complete=false
//limitとsetを作る。　　GET /tasks?limit=10 10個ずつ見せる
//GET /tasks?limit=10&skip=10 ２ページ目からみる
//GET /tasks?sortBy=createdAt_desc (descendingの略)
router.get('/tasks',　auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.complete){
        match.complete = req.query.complete === 'true' //req.query.completedで取得できるのはString。match.completedはBooleanなので合わせる
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit), //req.query.limit は　/tasks?limit=10　で入力される数字
                skip: parseInt(req.query.skip),
                sort
                }
        }).execPopulate()
    
      res.send(req.user.tasks)
  } catch (e) {
      res.status(500).send()
  }
})

//Authenticateされるように。ログインユーザーが作成したタスクのみ取得できるように。
router.get('/tasks/:id',auth, async (req, res) => {
  const _id = req.params.id　///「:id」に入力した値

  try {
      //const task = await Task.findById(_id)
        const task = await Task.findOne({ _id, owner: req.user._id })//req.user._idで認証されているuserのidが取得できる。
        　　　　　　　　　　　　　　　　　　　　　　　//ownerが、認証されているuserのidであるものを取得

      if (!task) {
          return res.status(404).send()
      }

      res.send(task)
  } catch (e) {
      res.status(500).send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {
      const task = await Task.findOne({ _id: req.params.id, owner:req.user._id })
      //const task = await Task.findById(req.params.id)
      if (!task) {
          return res.status(404).send()
      }

      updates.forEach((update) => task[update] = req.body[update])
      await task.save()

      res.send(task)
  } catch (e) {
      res.status(400).send(e)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
      const task = await Task.findByIdAndDelete({ _id:req.params.id, owner:req.user._id })

      if (!task) {
          res.status(404).send()
      }

      res.send(task)
  } catch (e) {
      res.status(500).send()
  }
})


module.exports = router