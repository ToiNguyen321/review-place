// const path = require('node:path')

import uEmail from "./email.js";
import uPhone from "./phone.js";
import uPlace from "./place.js";
import uUser from "./user.js";
import uResponse from "./response.js";
import uParams from "./param.js";
import uQueryInfo from "./queryInfo.js";

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

// export default proxy

export { uPlace, uPhone, uEmail, uUser, uResponse, uParams, uQueryInfo };
