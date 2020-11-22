const devicesJSTemplate = ({
  name,
  popularity,
  release_date: releaseDate,
  os,
  resolution,
  aspect_ratio: aspectRatio,
  imageFileName
}) => {
  const androidOutput =
  `'${name}': {
    aspectRatio: '${aspectRatio}',
    browser: 'Chrome',
    cssName: '${imageFileName}',
    device: '${name}',
    imagePath: '${imageFileName}.png',
    loaderVideo1: '/videos/nexus-loader-1.webm',
    loaderVideo2: '/videos/nexus-loader-2.webm',
    os: '${os}',
    pinchInfo: {
      sleepMS: 10,
      steps: 15,
      stepSize: 20
    },
    popularity: ${popularity},
    realHeight: 6.2,
    realWidth: 2.94,
    release: '${releaseDate}',
    resolution: '${resolution}',
    scrollInfo: {
      x: {
        delta: 100,
        stepSize: 9,
        sleep: 2
      },
      y: {
        delta: 100,
        stepSize: 9,
        sleep: 2
      },
      scaleFactor: 1
    },
    screenSize: '5.5 in - 2.46 x 4.92 in',
    skinName: '${imageFileName}',
    share: '5',
    viewport: '393 x 786 dp'
  }`;

  const iosOutput = 
  `'${name}': {
    aspectRatio: '${aspectRatio}',
    cssName: '${imageFileName}',
    device: '${name}',
    imagePath: '${imageFileName}.png',
    loaderImage: 1,
    os: '${os}',
    popularity: ${popularity},
    realHeight: 5.45,
    realWidth: 2.65,
    release: '${releaseDate}',
    resolution: '${resolution}',
    screenSize: '5.5 in - 2.46 x 4.92 in',
    scrollInfo: {
      x: {
        scrollFactor: 0.3,
        scrollVelocity: 800
      },
      y: {
        scrollFactor: 0.2,
        scrollVelocity: 750
      }
    },
    skinName: '${imageFileName}',
    share: '5',
    viewport: '393 x 786 dp'
  }`;

  if (os=='android'){
    return androidOutput;
  } else {
    return iosOutput;
  }
};

module.exports = {
  devicesJSTemplate
};
