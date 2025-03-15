import { readdirSync, existsSync, mkdirSync, writeFileSync, statSync } from 'fs'

const keyArr = new Set(...[
    [
        ...readdirSync('device'),
        ...readdirSync('device-lowres')
    ].filter(x => x != '.DS_Store')
    .map(x => x.includes('.') ? x.split('.').slice(0,-1).join('.') : x) // Remove file extension
])

let retArr = []

for (const key of keyArr) {
    let lowresExists = existsSync(`device-lowres/${key}.png`)
    let pngExists = existsSync(`device/${key}.png`)
    let folderExists = existsSync(`device/${key}/`) && statSync(`device/${key}/`).isDirectory()
    
    if (folderExists) {
        const folderContents = readdirSync(`device/${key}`)
        let images = []

        for (const folderItem of folderContents) {
            if (folderItem.endsWith("_dark.png")) continue
            if (!folderItem.endsWith(".png")) continue
            const baseName = folderItem.replace(".png", "")
            images.push({
                id: baseName,
                dark: folderContents.includes(`${baseName}_dark.png`)
            })
        }

        retArr.push({
            key: key,
            count: images.length,
            dark: images.filter(x => x.dark).length > 0,
            index: images
        })
    }

    else if (pngExists || lowresExists) {
        retArr.push({
            key: key,
            count: 1,
            dark: false,
            index: [{
                id: 0,
                dark: false
            }]
        })
    }
}

if (!existsSync('out')) mkdirSync('out')
writeFileSync('out/main.json', JSON.stringify(retArr))