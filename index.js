const fs = require('fs-extra');
const path = require('path');
const isVideo = require('is-video');
const { getVideoDurationInSeconds } = require('get-video-duration');
const { program } = require('commander');

program.option('-p, --paths <paths>', 'paths to videos file', []).parse(process.argv);

async function readdir(pathname) {
  const dirs = await fs.readdir(pathname);
  const results = [];
  for (const dir of dirs) {
    const dirPath = path.resolve(pathname, dir);
    if ((await fs.stat(dirPath)).isDirectory()) {
      results.push(...(await readdir(dirPath)));
    }
    if (isVideo(dirPath)) {
      results.push(dirPath);
    }
  }
  return results;
}

function sum(arr) {
  return arr.reduce((a, b) => a + b);
}

(async function () {
  const paths = program.paths.split(',');
  for (const pathname of paths) {
    const videos = await readdir(pathname);
    const tasks = [];
    let videosCount = 0;
    videos.forEach((video) => {
      videosCount++;
      tasks.push(getVideoDurationInSeconds(video));
    });
    Promise.all(tasks)
      .then(sum)
      .then((sum) => {
        console.log('Number of videos:', videosCount);
        console.log('Total duration:', sum);
      });
  }
})();
