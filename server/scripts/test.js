const teams = [
  {
    name: "FC Barcelona",
    tag: "barcelona",
    players: ["Pedri", "Lewandowski", "Gavi", "Yamal"],
  },
  {
    name: "Real Madrid",
    tag: "real-madrid",
    players: ["Bellingham", "Vinicius Jr", "Modric", "Mbappe"],
  },
  {
    name: "Manchester City",
    tag: "man-city",
    players: ["Haaland", "De Bruyne", "Foden", "Rodri"],
  },
  {
    name: "Manchester United",
    tag: "man-utd",
    players: ["Rashford", "Fernandes", "Garnacho", "Mainoo"],
  },
  {
    name: "Liverpool",
    tag: "liverpool",
    players: ["Salah", "Van Dijk", "Szoboszlai", "Trent"],
  },
  {
    name: "Arsenal",
    tag: "arsenal",
    players: ["Saka", "Odegaard", "Rice", "Martinelli"],
  },
  {
    name: "Bayern Munich",
    tag: "bayern",
    players: ["Kane", "Musiala", "Kimmich", "Sané"],
  },
  {
    name: "PSG",
    tag: "psg",
    players: ["Dembele", "Hakimi", "Vitinha", "Marquinhos"],
  },
  {
    name: "Inter Miami",
    tag: "inter-miami",
    players: ["Messi", "Suarez", "Busquets", "Alba"],
  },
  {
    name: "Al Nassr",
    tag: "al-nassr",
    players: ["Ronaldo", "Mane", "Laporte", "Otavio"],
  },
];

const types = ["Home", "Away", "Third", "Retro"];

// --- HELPER FUNCTIONS ---
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// --- GENERATOR ---
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
    images: [`${team.tag}-1`, `${team.tag}-2`, `${team.tag}-3`],
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
    faqs: [
      {
        question: "Is this an official licensed jersey?",
        answer:
          "No, this is a high-quality fan version made with premium materials.",
      },
      {
        question: "What are the washing instructions?",
        answer: "Wash inside out with cold water. Do not tumble dry.",
      },
    ],
  };

  return product;
};

const data = generateProduct();
console.log(data);
