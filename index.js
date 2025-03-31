import { resolve, join, basename } from 'path'
import { readdirSync, statSync, mkdirSync } from 'fs'
import sharp from "sharp"

// const resizeArr = [32,64,128,256,512,1024,'main','preview']
const resizeArr = [64,256,'main','preview']

const __dirname = import.meta.dirname

const imgPath = resolve(__dirname, 'out')
const deviceDirPath = resolve(__dirname, "device")
const lowResDirPath = resolve(__dirname, "device-lowres")
const imageDirPath = resolve(__dirname, "images")

const argDevices = process.argv.slice(2)

function getPngs(p, dirPath) {
  return readdirSync(p).map(x => {
    const recursePath = join(dirPath, x)
    
    if (x.endsWith('.png')) return {
      key: basename(x,'.png'),
      imageArr: false
    }
    else if (statSync(recursePath).isDirectory()) return {
      key: x,
      imageArr: readdirSync(recursePath).filter(x => x.endsWith('.png'))
    }
  }).filter(x => {
    if (!x) return false
    if (argDevices.length) return argDevices.includes(x.key)
    return true
  })
}

const deviceDirArr = getPngs(deviceDirPath, deviceDirPath)
const lowResDirArr = getPngs(lowResDirPath, deviceDirPath).filter(x => !deviceDirArr.map(y => y.key).includes(x.key))
const imageDirArr = getPngs(imageDirPath, imageDirPath)

async function createImg(img, res, dir, outputFormat, outputDir) {
  try {
    let options = {
      width: res,
      height: res,
      fit: sharp.fit.inside
    }

    if (res == 'preview') options = { height: 256 }
    else if (res == 'main') options = { height: 352 }

    const outDir = join(...[imgPath, `${outputDir}@${res}`, img.key])
    mkdirSync(outDir, {recursive: true})

    async function outputSharpImage(inputPath, options, outputPath, outputFormat) {
      let conversionOptions = {}
      if (outputFormat == 'avif') conversionOptions['quality'] = 70
      await sharp(inputPath).resize(options)[outputFormat](conversionOptions).toFile(outputPath)
    }

    let promises = []
    if (img.imageArr) for (const i of img.imageArr) {
      const inputPath = join(dir, img.key, i)
      const outputPath = join(outDir, basename(inputPath, '.png') + '.' + outputFormat)

      promises.push(outputSharpImage(inputPath, options, outputPath, outputFormat))
    } else {
      const inputPath = join(dir, img.key + '.png')
      const outputPath = join(outDir, '0.' + outputFormat)

      promises.push(outputSharpImage(inputPath, options, outputPath, outputFormat))
    }
    await Promise.all(promises)
  } catch (err) {
    console.log(img, err)
    process.exit()
  }
}

let parentPromises = []
for (const res of resizeArr) for (const imgType of ['png','webp','avif']) {
  for (const img of deviceDirArr) parentPromises.push(createImg(img, res, deviceDirPath, imgType, 'device'))
  for (const img of lowResDirArr) parentPromises.push(createImg(img, res, lowResDirPath, imgType, 'device'))
  for (const img of imageDirArr)  parentPromises.push(createImg(img, res, imageDirPath,  imgType, 'images'))
}
await Promise.all(parentPromises)