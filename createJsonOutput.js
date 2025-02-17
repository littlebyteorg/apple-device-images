import { readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs'

const keyArr = new Set(...[
    [
        ...readdirSync('device'),
        ...readdirSync('device-lowres')
    ].filter(x => x != '.DS_Store')
    .map(x => x.includes('.') ? x.split('.').slice(0,-1).join('.') : x) // Remove file extension
])

let retArr = []

for (const key of keyArr) {
    let lowresExists = false
    let pngExists = false
    let folderExists = false

    if (existsSync(`device-lowres/${key}.png`))  lowresExists    = true
    if (existsSync(`device/${key}.png`))         pngExists       = true
    if (existsSync(`device/${key}/0.png`))       folderExists    = true
    
    if (folderExists) {
        const folderContents = readdirSync(`device/${key}`)
        let images = []

        for (let i = 0;; i++) {
            if (folderContents.includes(`${i}.png`)) images.push({
                id: i,
                dark: folderContents.includes(`${i}_dark.png`)
            })
            else break
        }

        retArr.push({
            key: key,
            count: images.length,
            dark: images.filter(x => x.dark).length > 0,
            index: images
        })

        continue
    }

    if (pngExists || lowresExists) {
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