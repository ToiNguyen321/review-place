// const path = require('node:path')

const email = require("./email");
const phone = require("./phone");
const place = require("./place");
const userUtils = require("./user");

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

module.exports = { place, phone, email, userUtils };
