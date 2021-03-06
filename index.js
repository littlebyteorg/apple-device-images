const path = require('path')
const fs = require('fs')
const sharp = require("sharp")
const { create } = require('domain')

const resizeArr = [128,256,512,1024,'preview','main']

const imgPath = path.resolve(__dirname, 'out')
const dirPath = path.resolve(__dirname, "images")
const lowResDirPath = path.resolve(__dirname, "images-lowres")

function getDirContents(p) {
  return fs.readdirSync(p, function (err, files) {
    var retArr = []
    files.forEach(f => retArr.push(f))
    return retArr
  })
}

function getPngs(p) {
  let identifier = undefined
  const dirArr = getDirContents(p).map(x => {
    const recursePath = path.join(dirPath, x)
    
    if (x.endsWith('.png')) return {
      identifier: path.basename(x,'.png'),
      imageArr: false
    }
    else if (fs.statSync(recursePath).isDirectory()) return {
      identifier: x,
      imageArr: getDirContents(recursePath).filter(x => x.endsWith('.png'))
    }
  }).filter(x => x)
  return dirArr
}

function mkDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p) }

const dirArr = getPngs(dirPath)
const lowResDirArr = getPngs(lowResDirPath).filter(x => !dirArr.map(y => y.identifier).includes(x.identifier))

async function createPng(img, res, dir) {
  try {
    const outDirArr = [imgPath, `device@${res}`, img.identifier]
    for (const o in outDirArr) mkDir(
      path.join(...
        outDirArr.filter((x, index) => {
          return index <= o
        })
      )
    )

    let options = {
      width: res,
      height: res,
      fit: sharp.fit.inside
    }

    if (res == 'preview') options = { height: 256 }
    else if (res == 'main') options = { height: 352 }

    const outDir = path.join(...outDirArr)

    if (img.imageArr) for (const i of img.imageArr) {
      const inputPath = path.join(dir, img.identifier, i)
      const fileName = path.basename(inputPath)

      await sharp(inputPath)
        .resize(options)
        .toFile(path.join(outDir, fileName))
    } else {
      const inputPath = path.join(dir, img.identifier + '.png')
      const fileName = '0.png'

      await sharp(inputPath)
        .resize(options)
        .toFile(path.join(outDir, fileName))
    }
    
  } catch (err) {
    console.log(img, err)
    process.exit()
  }
}

for (const res of resizeArr) {
  for (const img of dirArr) createPng(img, res, dirPath)
  for (const img of lowResDirArr) createPng(img, res, lowResDirPath)
}