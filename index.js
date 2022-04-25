const path = require('path')
const fs = require('fs')
const sharp = require("sharp")
const { create } = require('domain')

const resizeArr = [256,512,1024]

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
      identifier: x.split('.')[0],
      imageArr: false
    }
    else if (fs.statSync(recursePath).isDirectory()) return {
      identifier: x,
      imageArr: getDirContents(recursePath).filter(x => x.endsWith('.png'))
    }
  }).filter(x => x)
  return dirArr
}

/*function getPngs(p, recursive = false, identifier = undefined) {
  const dirArr = fs.readdirSync(p, function (err, files) {
    var retArr = []
    files.forEach(f => retArr.push(f))

    return retArr
  }).map(x => {
    if (x.endsWith('png')) {
      identifier = (identifier && recursive) ? identifier : x.split('.')[0]
      return {
        identifier: identifier,
        image: x
      }
    }
    const recursePath = path.join(dirPath, x)
    if (fs.statSync(recursePath).isDirectory()) return getPngs(recursePath, true, x)
    return undefined
  }).filter(x => x)

  var retArr = {}
  console.log(dirArr)
  /*for (const d of dirArr) {
    if (retArr.hasOwnProperty(d.identifier)) retArr[d.identifier].imageArr.push(d.image)
    else retArr[d.identifier] = {
      imageArr: [d.image]
    }
  }*/

  /*return retArr
}*/

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

    const outDir = path.join(...outDirArr)

    if (img.imageArr) for (const i of img.imageArr) {
      const inputPath = path.join(dir, img.identifier, i)
      const fileName = path.basename(inputPath)

      await sharp(inputPath)
        .resize(res)
        .toFile(path.join(outDir, fileName))
    } else {
      const inputPath = path.join(dir, img.identifier + '.png')
      const fileName = '0.png'

      await sharp(inputPath)
        .resize(res)
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