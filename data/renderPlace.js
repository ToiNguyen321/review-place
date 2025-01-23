var fs = require("fs");
const {
  randImg,
  randNumber,
  randProductDescription,
} = require("@ngneat/falso");

const categories = [
  {
    title: "Nhà hàng",
    _id: "676b83dadde4860c3e3b9b95",
  },
  {
    title: "Ăn vặt",
    _id: "676b8421dde4860c3e3b9b97",
  },
  {
    title: "Cà phê",
    _id: "676b843bdde4860c3e3b9b99",
  },
  {
    title: "Trà sữa",
    _id: "676b8450dde4860c3e3b9b9b",
  },
  {
    title: "Quán nhậu",
    _id: "676b8468dde4860c3e3b9b9d",
  },
  {
    title: "Tiệm bánh",
    _id: "676b84bbdde4860c3e3b9b9f",
  },
  {
    title: "Kem",
    _id: "676b84d2dde4860c3e3b9ba1",
  },
  {
    title: "Buffet",
    _id: "676b84eadde4860c3e3b9ba3",
  },
  {
    title: "Đồ chay",
    _id: "676b8508dde4860c3e3b9ba5",
  },
  {
    title: "Hải sản",
    _id: "676b851adde4860c3e3b9ba7",
  },
];

const users = [
  "678e0096b605cff058c70d77",
  "67909eeb76e2cd5dea180d64",
  "67909eeb76e2cd5dea180d65",
  "67909eeb76e2cd5dea180d66",
  "67909eeb76e2cd5dea180d67",
  "67909eeb76e2cd5dea180d69",
  "67909eeb76e2cd5dea180d6b",
  "67909eeb76e2cd5dea180d6e",
  "67909eeb76e2cd5dea180d6f",
  "67909eeb76e2cd5dea180d72",
  "67909eeb76e2cd5dea180d75",
  "67909eeb76e2cd5dea180d78",
  "67909eeb76e2cd5dea180d7a",
  "67909eeb76e2cd5dea180d7e",
  "67909eeb76e2cd5dea180d81",
  "67909eeb76e2cd5dea180d82",
  "67909eeb76e2cd5dea180d87",
  "67909eeb76e2cd5dea180d89",
  "67909eeb76e2cd5dea180d8a",
  "67909eeb76e2cd5dea180d8b",
  "67909eeb76e2cd5dea180d8c",
  "67909eeb76e2cd5dea180d8d",
  "67909eeb76e2cd5dea180d8e",
  "67909eeb76e2cd5dea180d90",
  "67909eeb76e2cd5dea180d91",
  "67909eeb76e2cd5dea180d92",
  "67909eeb76e2cd5dea180d93",
  "67909eeb76e2cd5dea180d94",
];

const places = [];
for (let i = 0; i < 99; i++) {
  const categories_ = [
    categories[Math.floor(Math.random() * categories.length)],
    categories[Math.floor(Math.random() * categories.length)],
  ];
  const place = {
    title: "Buffet Hàn Quốc",
    descriptions: randProductDescription({ length: 10 }).join(" "),
    userLikes: [],
    userReviews: [],
    images: [],
    userId: users[Math.floor(Math.random() * users.length)],
    categories: categories_,
    priceRange: {
      start: randNumber(),
      end: randNumber(),
    },
    address: "",
    province: {
      code: "01",
      name: "Hà Nội",
      nameEn: "Ha Noi",
      fullName: "Thành phố Hà Nội",
      fullNameEn: "Ha Noi City",
      _id: "676b66e66b1d8ce8137acd1c",
    },
    district: {
      code: "001",
      name: "Ba Đình",
      nameEn: "Ba Dinh",
      fullName: "Quận Ba Đình",
      fullNameEn: "Ba Dinh District",
      _id: "676b66c16b1d8ce8137aca60",
    },
    ward: null,
    location: null,
    point: Math.floor(Math.random() * 10),
    rating: 0,
    totalRating: 0,
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    images: randImg({ random: true, width: 475, height: 300, length: 3 }).map(
      (i) => {
        return {
          url: i,
          width: 475,
          height: 300,
        };
      }
    ),
  };

  places.push(place);
}

fs.writeFile("places.json", JSON.stringify(places), function (err) {
  if (err) throw err;
  console.log("complete");
});

console.log(places[0]);
