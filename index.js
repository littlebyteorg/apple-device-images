const path = require('path')
const fs = require('fs')
const sharp = require("sharp")
const { create } = require('domain')

const resizeArr = [32,64,128,256,512,1024,'main','preview']

const imgPath = path.resolve(__dirname, 'out')
const deviceDirPath = path.resolve(__dirname, "device")
const lowResDirPath = path.resolve(__dirname, "device-lowres")
const imageDirPath = path.resolve(__dirname, "image")

const argDevices = process.argv.slice(2)

function getDirContents(p) {
  return fs.readdirSync(p, function (err, files) {
    var retArr = []
    files.forEach(f => retArr.push(f))
    return retArr
  })
}

function getPngs(p) {
  let key = undefined
  const dirArr = getDirContents(p).map(x => {
    const recursePath = path.join(dirPath, x)
    
    if (x.endsWith('.png')) return {
      key: path.basename(x,'.png'),
      imageArr: false
    }
    else if (fs.statSync(recursePath).isDirectory()) return {
      key: x,
      imageArr: getDirContents(recursePath).filter(x => x.endsWith('.png'))
    }
  }).filter(x => x).filter(x => {
    if (argDevices.length) return argDevices.includes(x.key)
    return true
  })
  return dirArr
}

function mkDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p) }

const deviceDirArr = getPngs(deviceDirPath)
const lowResDirArr = getPngs(lowResDirPath).filter(x => !deviceDirArr.map(y => y.key).includes(x.key))
const imageDirArr = getPngs(imageDirPath)

async function createImg(img, res, dir, outputFormat, outputDir) {
  try {
    const outDirArr = [imgPath, `${outputDir}@${res}`, img.key]
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

    function outputSharpImage(inputPath, options, outputPath, outputFormat) {
      let img = sharp(inputPath).resize(options)

      if (outputFormat == 'png') img.png()
      else if (outputFormat == 'webp') img.webp()
      else if (outputFormat == 'avif') img.avif({
        quality: 70
      })

      img.toFile(outputPath, (err,) => {
        if (err) console.log(err)
      })
    }

    if (img.imageArr) for (const i of img.imageArr) {
      const inputPath = path.join(dir, img.key, i)
      const outputPath = path.join(outDir, path.basename(inputPath, '.png') + '.' + outputFormat)

      outputSharpImage(inputPath, options, outputPath, outputFormat)
    } else {
      const inputPath = path.join(dir, img.key + '.png')
      const outputPath = path.join(outDir, '0.' + outputFormat)

      outputSharpImage(inputPath, options, outputPath, outputFormat)
    }
  } catch (err) {
    console.log(img, err)
    process.exit()
  }
}

for (const res of resizeArr) for (const imgType of ['png','webp','avif']) {
  for (const img of deviceDirArr) createImg(img, res, dirPath,       imgType, 'device')
  for (const img of lowResDirArr) createImg(img, res, lowResDirPath, imgType, 'device')
  for (const img of imageDirArr)  createImg(img, res, imageDirPath,  imgType, 'image')
}
