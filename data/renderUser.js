var fs = require("fs");

const {
  randEmail,
  randFullName,
  randAvatar,
  randProductDescription,
} = require("@ngneat/falso");

const dataList = [];
for (let i = 0; i < 50; i++) {
  const data = {
    email: randEmail({
      firstName: "review",
      lastName: "",
      nameSeparator: ".",
      provider: "gmail",
      suffix: "com",
    }),
    fullName: randFullName(),
    avatar: {
      url: `${randAvatar()}?${Math.random()}`,
    },
    slogan: randProductDescription(),
    password: "$2b$10$KJ5JZgCUlh33VFMFBXzCceAUWt7ZeCDgDx/p2EJlrJDcSxnqxacU.",
    rating: 0,
    address: "",
    role: "user",
  };
  dataList.push(data);
}

fs.writeFile("users.json", JSON.stringify(dataList), function (err) {
  if (err) throw err;
  console.log("complete");
});
