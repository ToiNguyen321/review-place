// const path = require('node:path')

const uEmail = require("./email");
const uPhone = require("./phone");
const uPlace = require("./place");
const uUser = require("./user");
const uResponse = require("./response");
const uParams = require("./param");
const uQueryInfo = require("./queryInfo");

// const util = {}

// const proxy = new Proxy(util, {
//     get(target, prop) {
//         const name = prop.slice(0, -1)

//         // Load non-existent module to 'util'
//         if (target[name] === undefined) {
//             target[name] = require(path.join(__dirname, name))
//         }

//         return target[name]
//     },
// })

// module.exports = proxy

module.exports = {
  uPlace,
  uPhone,
  uEmail,
  uUser,
  uResponse,
  uParams,
  uQueryInfo,
};
