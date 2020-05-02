const fs = require("fs");
const path = require("path");
const request = require("request");
const URL = require("url");

// let count = 0;

function getMedia(body) {
  return new Promise(function(resolve, reject) {
    const length = body.length;
    const photoURI = [];
    const videoURI = [];
    for (let i = 0; i < length; i++) {
      if (body[i].extended_entities) {
        const { media } = body[i].extended_entities;
        // check if it's a photo or video
        const media_length = media.length;
        for (let j = 0; j < media_length; j++) {
          // check if it's  a photo
          if (media[j].type === "photo") {
            photoURI.push(media[j].media_url);
          }
          // check if it's a video
          if (media[j].type === "video") {
            const length = media[j].video_info.variants.length;
            videoURI.push(media[j].video_info.variants[length - 2].url);
          }
        }
      }
    }
    const media = [...photoURI, ...videoURI];
    let count = 0;
    const plength = Math.ceil(media.length / 5);
    function downloadQueue(i, n) {
      getSingleMedia(media[i])
        .then(() => {
          if (count === media.length - 1) {
            resolve("All Image Downloaded");
          } else {
            if (i < n - 1) {
              downloadQueue(i + 1, n);
            }
            count = count + 1;
            console.log(count);
          }
        })
        .catch(err => {
          if (err !== "xINVALIDURL") {
            reject(err);
          }
        });
    }
    downloadQueue(0, plength);
    downloadQueue(plength, 2 * plength);
    downloadQueue(2 * plength, 3 * plength);
    downloadQueue(3 * plength, 4 * plength);
    downloadQueue(4 * plength, media.length);
  });
  function getSingleMedia(url) {
    return new Promise(function(resolve, reject) {
      if (typeof url !== "undefined") {
        const pathName = URL.parse(url).pathname;
        const filename = path.basename(pathName);
        wstream = fs.createWriteStream(`${process.argv[2]}/${filename}`);
        request(url)
          .pipe(wstream)
          .on("close", function() {
            resolve("Downloaded");
          })
          .on("error", function() {
            reject("xERROR");
          });
      } else {
        console.log(`Invalid Url found ${url}`);
        reject("xINVALIDURL");
      }
    });
  }
}
function getLastId(body) {
  const length = body.length;
  return body[length - 1].id;
}
module.exports = { getMedia, getLastId };
