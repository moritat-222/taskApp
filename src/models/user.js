const mongoose = require('mongoose')
const validator = require('validator');
const bcrypt = require('bcryptjs') 
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name: {
      type: String,  //データ型の設定
      required: true,
      trim: true
  },
  email: {
      type: String,
      unique: true, //データベース上のemailの値を一意にする›
      required: true,
      trim: true,
      lowercase: true,
      validate(value){
        if(!validator.isEmail(value)){
          throw new Error ('Email is invalid')
        }
      }
  },
  password:{
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(value){
        //toLowerCaseによって、小文字も大文字も小文字と認識される
        if(value.toLowerCase().includes('password')){
          throw new Error ('Do not use "password" to password')
        }
      }
  },
  age:{
      type: Number,
      default: 0,
      validate(value){
        if(value < 0){
          throw new Error ('Age must be a positive number')
        }
    }
  },
  tokens: [{
    token: {
      type: String,
      require: true
    }
  }],
  avatar: {
    type: Buffer
  }
},{
  timestamps: true

})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id', 
  foreignField: 'owner' //外部キー
})

//インスタンスにはmethodを使う
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({ token: token })
  await user.save()

  return token 
}

userSchema.methods.toJSON = function(){
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

//モデルにはstaticsを使う
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email }) //emailの値が、引数のemailに一致

  if(!user){  //入力したEメールがデータベースにない
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password)

  if(!isMatch){　//入力したパスワードがデータベースにない
    throw new Error('Unable to login')
  }

  return user
}

//middlewareを記述。saveする前にプレーンテキストをハッシュする
userSchema.pre('save', async function(next){ //アローファンクションは使わない。このbindingは大事な役割を果たすものだから
  const user = this

  console.log('Middleware is working')

  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8)
  }//ここで値がハッシュされる

  next()
})

//ユーザーが消えた時に、ユーザーのタスクも消す
userSchema.pre('remove', async function (next){
  const user = this
  await Task.deleteMany({owner: user._id})

  next()
})


//モデルを定義 Userドキュメントの定義
const User = mongoose.model('User', userSchema)


module.exports = User
