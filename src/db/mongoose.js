const mongoose = require('mongoose')

//mongodbのポートの読み込みと、mongoDBのコレクション名をつける
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useFindAndModify: false
});



////.save()でPromiseオブジェクトを作成し、インスタンスをデータベースに保存
//me.save().then(() => {
//  console.log(me)
//}).catch((error) => {
//  console.log('Error!', error)
//})



