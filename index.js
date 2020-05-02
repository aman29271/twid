const request = require("request");
const path = require("path");
const dotenv = require("dotenv");
const url = require("url");
const fs = require("fs");
const { getMedia, getLastId } = require("./getMedia");

dotenv.config();

function generateURI(screen_name, max_id) {
  const uri =
    "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=screen_name&trim_user=true&exclude_replies=true&include_rts=false&count=200";
  const { protocol, query, host, pathname } = url.parse(uri, true);
  query.screen_name = screen_name;
  max_id ? (query.max_id = max_id) : delete query.max_id;
  const options = {
    protocol,
    host,
    pathname,
    query
  };
  const newURI = url.format(options);
  return newURI;
}
// function generateOption(url) {
//   const options = {
//     method: "GET",
//     url: generateURI(process.argv[1]),
//     headers: {
//       Authorization: `Bearer ${process.env.access_token}`
//     }
//   };
//   return options;
// }

function recursiveLoop(max_id) {
  const options = {
    method: "GET",
    url: generateURI(process.argv[2], max_id - 1),
    headers: {
      Authorization: `Bearer ${process.env.access_token}`
    }
  };
  request(options, (err, response) => {
    if (err) throw err;
    const { body } = response;
    const parsedBody = JSON.parse(body);
    if (parsedBody.length !== "undefined") {
      if (parsedBody.length > 0) {
        getMedia(parsedBody)
          .then(() => {
            const max_id_local = getLastId(parsedBody) - 1;
            recursiveLoop(max_id_local);
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        // process.on("exit", () => {
        //   console.log(
        //     "All image has been downloaded. Node is terminating Now..."
        //   );
        // });
      }
    } else {
      console.error("AN Error has been detected.");
    }
  });
}

const options = {
  method: "GET",
  url: generateURI(process.argv[2]),
  headers: {
    Authorization: `Bearer ${process.env.access_token}`
  }
};
request(options, (err, response) => {
  if (err) throw err;
  const { body } = response;
  const parsedBody = JSON.parse(body);
  
  //   check that response is not null
  if (parsedBody.length !== "undefined") {
    if (parsedBody.length > 0) {
      if (!fs.existsSync(process.argv[2])) {
        fs.mkdir(process.argv[2], err => {
          if (err) throw err;
        });
      }
      getMedia(parsedBody)
        .then(res => {
          const max_id = getLastId(parsedBody) - 1;
          recursiveLoop(max_id);
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      process.on("exit", () => {
        console.log(
          "All image has been downloaded. Node is terminating Now..."
        );
      });
    }
  } else {
    console.error("AN Error has been detected.");
  }
});
