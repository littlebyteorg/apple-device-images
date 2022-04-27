# apple-device-images

`https://img.appledb.dev/device@res/deviceIdentifier1,1/0.png`

Replace `res` with `256`, `512`, or `1024` to get an image which has a maximum horizontal pixel count of the respective value.
Replace `deviceIdentifier1,1` with the device you want an image of, e.g. `iPhone14,2` for iPhone 13 Pro  

To get an image with dark mode, append `_dark` to the filename: `/0_dark.png`  
To get a different colour, increment the number of the filename: `/1.png`

In the future I will publish a JSON with the site which lists which devices have dark mode, and how many colours each device has. For you will just have to look.

## Example images

`https://img.appledb.dev/device@512/MacBookAir10,1/0.png`

512x296, Space Grey, light mode

![Medium resolution image of a Space Grey MacBook Air, Late 2020](https://img.appledb.dev/device@512/MacBookAir10,1/0.png)

`https://img.appledb.dev/device@256/iPhone14,2/3_dark.png

256x517, Sierra Blue, dark mode

![Lower resolution image of a Sierra iPhone 13 Pro in dark mode](https://img.appledb.dev/device@256/iPhone14,2/3_dark.png)
