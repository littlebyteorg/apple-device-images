const path = require('path')
const fs = require('fs')
const sharp = require("sharp")
const { create } = require('domain')

const resizeArr = [128,256,512,1024,'main','preview']

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

async function createImg(img, res, dir, outputFormat) {
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

    function outputSharpImage(inputPath, options, outputPath, outputFormat) {
      let img = sharp(inputPath).resize(options)

      if (outputFormat == 'png') img.png()
      else if (outputFormat == 'webp') img.webp()

      img.toFile(outputPath, (err,) => {
        if (err) console.log(err)
      })
    }

    if (img.imageArr) for (const i of img.imageArr) {
      const inputPath = path.join(dir, img.identifier, i)
      const outputPath = path.join(outDir, path.basename(inputPath, '.png') + '.' + outputFormat)

      outputSharpImage(inputPath, options, outputPath, outputFormat)
    } else {
      const inputPath = path.join(dir, img.identifier + '.png')
      const outputPath = path.join(outDir, '0.' + outputFormat)

      outputSharpImage(inputPath, options, outputPath, outputFormat)
    }
  } catch (err) {
    console.log(img, err)
    process.exit()
  }
}

for (const res of resizeArr) for (const imgType of ['png','webp']) {
  for (const img of dirArr) createImg(img, res, dirPath, imgType)
  for (const img of lowResDirArr) createImg(img, res, lowResDirPath, imgType)
}