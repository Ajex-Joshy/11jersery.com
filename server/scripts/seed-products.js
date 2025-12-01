import connectDB from "../config/db.js";
import Product from "../models/product.model.js";
import { teams, types, categoryIds } from "./constants.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const askCount = () =>
  new Promise((resolve) => {
    rl.question("How many products do you want to add? ", (answer) => {
      rl.close();
      resolve(parseInt(answer, 10));
    });
  });

const NO_OF_PRODUCTS_TO_ADD = await askCount();

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateProduct = () => {
  const team = getRandom(teams);
  const player = getRandom(team.players);
  const type = getRandom(types);
  const year = type === "Retro" ? getRandomInt(1990, 2010) : "2024/25";

  const title = `${team.name} – ${player} ${type} Jersey ${
    type === "Retro" ? year : ""
  }`;
  const slug = `${team.tag}-${player
    .toLowerCase()
    .replace(/\s+/g, "-")}-${type.toLowerCase()}-jersey-${getRandomInt(
    1000,
    9999
  )}`;

  const description = `Show your passion for ${team.name} with the official ${title}. Designed for the true fans, this jersey features ${player}’s iconic style and an authentic design inspired by the ${year} kit. Made with lightweight, breathable fabric, it keeps you cool and comfortable—whether you’re cheering at the stadium or playing on the field.`;
  const shortDescription = `Cheer for ${team.name} in style with the official ${player} ${type} Jersey. Lightweight, breathable, and made for ultimate comfort.`;

  const listPrice = getRandomInt(499, 899);

  const product = {
    title: title,
    slug: slug,
    categoryNames: [
      "top-selling",
      type === "Retro" ? "Retro-Kit" : "New-Arrival",
    ],
    description: description,
    shortDescription: shortDescription,
    price: {
      list: listPrice,
      sale: listPrice - getRandomInt(50, 150),
    },
    categoryIds: Array.from(
      { length: getRandomInt(1, 3) },
      () => categoryIds[Math.floor(Math.random() * categoryIds.length)]
    ),
    imageIds: [
      `${team.tag}-1.webp`,
      `${team.tag}-2.webp`,
      `${team.tag}-3.webp`,
    ].sort(() => Math.random() - 0.5),
    variants: [
      { size: "XS", stock: getRandomInt(0, 50) },
      { size: "S", stock: getRandomInt(0, 100) },
      { size: "M", stock: getRandomInt(10, 150) },
      { size: "L", stock: getRandomInt(10, 150) },
      { size: "XL", stock: getRandomInt(0, 80) },
      { size: "XXL", stock: getRandomInt(0, 30) },
    ],
    details: [
      { attribute: "Material", description: "100% Recycled Polyester" },
      {
        attribute: "Fit Type",
        description:
          "Regular (Fan Edition) / Slim Athletic Fit (Player Edition)",
      },
      {
        attribute: "Sleeve Type",
        description: "Short sleeves with mesh underarm panels for ventilation",
      },
    ],
    tags: [
      player.toLowerCase(),
      team.tag,
      type.toLowerCase(),
      "jersey",
      "football",
    ],
    rating: {
      average: parseFloat((Math.random() * (5.0 - 3.5) + 3.5).toFixed(1)),
    },
    isListed: Math.random() < 0.8,
  };

  return product;
};

const productGenerator = (num) => {
  let products = [];
  for (let i = 0; i < num; i++) {
    let prod = generateProduct();
    products.push(prod);
  }
  return products;
};

const data = productGenerator(NO_OF_PRODUCTS_TO_ADD);

await connectDB();

await Product.insertMany(data);

console.log(`${NO_OF_PRODUCTS_TO_ADD} Products inserted successfully`);
process.exit(0);

//  faqs: [
//       {
//         question: "Is this an official licensed jersey?",
//         answer:
//           "No, this is a high-quality fan version made with premium materials.",
//       },
//       {
//         question: "What are the washing instructions?",
//         answer: "Wash inside out with cold water. Do not tumble dry.",
//       },
//     ],
