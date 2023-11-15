const crypto = require('crypto')
const path = require('path')
const multer = require('multer')

const userimagesstorage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './public/images/uploads/userimages')
    },
    filename:function(req, file, cb){
        crypto.randomBytes(14, function(err, buff){
            let fnn = buff.toString('hex')+path.extname(file.originalname);
            cb(null, fnn)
        })
    }
})


const hospitalimagesstorage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './public/images/uploads/hospitalpr')
    },
    filename:function(req, file, cb){
        crypto.randomBytes(14, function(err, buff){
            let fnn = buff.toString('hex')+path.extname(file.originalname);
            cb(null, fnn)
        })
    }
})

const hospitalstorage = multer.diskStorage({
    destination:function(req, file, cb){
        cb(null, './public/images/uploads/hospitalimages')
    },
    filename:function(req, file, cb){
        crypto.randomBytes(14, function(err, buff){
            let fnn = buff.toString('hex')+path.extname(file.originalname);
            cb(null, fnn)
        })
    }
})




module.exports = {userimagesstorage, hospitalstorage,hospitalimagesstorage}