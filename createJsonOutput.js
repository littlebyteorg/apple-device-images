const fs = require('fs')

function getDirContents(p) {
    return fs.readdirSync(p, function (err, files) {
        var retArr = []
        files.forEach(f => retArr.push(f))
        return retArr
    })
}

const keyArr = new Set(...[
        [
        ...getDirContents('device'),
        ...getDirContents('device-lowres')
    ].filter(x => x != '.DS_Store')
    .map(x => x.includes('.') ? x.split('.').slice(0,-1).join() : x) // Remove file extension
])

let retArr = []

for (const key of keyArr) {
    let lowresExists = false
    let pngExists = false
    let folderExists = false

    if (fs.existsSync(`device-lowres/${key}.png`))  lowresExists    = true
    if (fs.existsSync(`device/${key}.png`))         pngExists       = true
    if (fs.existsSync(`device/${key}/0.png`))       folderExists    = true
    
    if (folderExists) {
        const folderContents = getDirContents(`device/${key}`)
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
            dark: images.map(x => x.dark).filter(x => x).length > 0,
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

        continue
    }
}

if (!fs.existsSync('out')) fs.mkdirSync('out')
fs.writeFile('out/main.json', JSON.stringify(retArr), (err) => {
    if (err) console.log(err)
})