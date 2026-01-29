import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Bolo Red Velvet da Casa",
    slug: "bolo-red-velvet-da-casa",
    description:
      "Massa aveludada com toque de cacau, camadas generosas de cream cheese e finalização com farelos vermelhos.",
    price: 8900,
    images: ["/images/products/bolo-red-velvet.svg"],
    category: "bolos",
    ingredients: "Farinha, açúcar, ovos, leite, cacau, manteiga, cream cheese.",
    calories: 420,
    prepTimeMinutes: 90,
    yieldInfo: "12 fatias",
    isFeatured: true,
    isFavorite: true,
    popularityScore: 92,
    active: true,
  },
  {
    name: "Bolo de Cenoura com Brigadeiro",
    slug: "bolo-de-cenoura-com-brigadeiro",
    description:
      "Massa fofinha de cenoura com cobertura cremosa de brigadeiro e granulado belga.",
    price: 7600,
    images: ["/images/products/bolo-cenoura.svg"],
    category: "bolos",
    ingredients: "Cenoura, ovos, açúcar, óleo, farinha, chocolate, leite condensado.",
    calories: 390,
    prepTimeMinutes: 75,
    yieldInfo: "10 fatias",
    isFeatured: true,
    isFavorite: false,
    popularityScore: 84,
    active: true,
  },
  {
    name: "Torta de Limão com Merengue",
    slug: "torta-de-limao-com-merengue",
    description:
      "Base crocante de biscoito, creme cítrico aveludado e merengue maçaricado na hora.",
    price: 6800,
    images: ["/images/products/torta-limao.svg"],
    category: "tortas",
    ingredients: "Limão siciliano, creme de leite, leite condensado, biscoito amanteigado.",
    calories: 360,
    prepTimeMinutes: 60,
    yieldInfo: "8 fatias",
    isFeatured: true,
    isFavorite: true,
    popularityScore: 88,
    active: true,
  },
  {
    name: "Cheesecake de Frutas Vermelhas",
    slug: "cheesecake-de-frutas-vermelhas",
    description:
      "Cheesecake cremoso com calda artesanal de frutas vermelhas e base amanteigada.",
    price: 8200,
    images: ["/images/products/cheesecake-frutas.svg"],
    category: "tortas",
    ingredients: "Cream cheese, açúcar, ovos, biscoito, frutas vermelhas.",
    calories: 410,
    prepTimeMinutes: 80,
    yieldInfo: "10 fatias",
    isFeatured: false,
    isFavorite: true,
    popularityScore: 79,
    active: true,
  },
  {
    name: "Brownie Belga Intenso",
    slug: "brownie-belga-intenso",
    description:
      "Brownie úmido com chocolate belga 70%, finalizado com nozes tostadas.",
    price: 3800,
    images: ["/images/products/brownie-belga.svg"],
    category: "doces",
    ingredients: "Chocolate belga, manteiga, ovos, açúcar, nozes.",
    calories: 320,
    prepTimeMinutes: 45,
    yieldInfo: "6 unidades",
    isFeatured: false,
    isFavorite: true,
    popularityScore: 90,
    active: true,
  },
  {
    name: "Brigadeiro Gourmet 4 Leites",
    slug: "brigadeiro-gourmet-4-leites",
    description:
      "Docinho cremoso de chocolate ao leite com toque de flor de sal.",
    price: 350,
    images: ["/images/products/brigadeiro-gourmet.svg"],
    category: "doces",
    ingredients: "Leite condensado, creme de leite, chocolate ao leite, manteiga.",
    calories: 120,
    prepTimeMinutes: 30,
    yieldInfo: "1 unidade",
    isFeatured: true,
    isFavorite: true,
    popularityScore: 98,
    active: true,
  },
  {
    name: "Macarons Sortidos Ju.pani",
    slug: "macarons-sortidos-ju-pani",
    description:
      "Caixa com 8 macarons em sabores sazonais: framboesa, pistache e baunilha.",
    price: 5200,
    images: ["/images/products/macarons.svg"],
    category: "doces",
    ingredients: "Farinha de amêndoas, claras, açúcar, recheios naturais.",
    calories: 210,
    prepTimeMinutes: 70,
    yieldInfo: "8 unidades",
    isFeatured: false,
    isFavorite: false,
    popularityScore: 70,
    active: true,
  },
  {
    name: "Kit Festa Mini",
    slug: "kit-festa-mini",
    description:
      "Mix de mini cupcakes, brownies e docinhos para celebrações íntimas.",
    price: 12900,
    images: ["/images/products/kit-festa.svg"],
    category: "kits",
    ingredients: "Variedade de massas, chocolates e coberturas.",
    calories: 520,
    prepTimeMinutes: 120,
    yieldInfo: "20 unidades variadas",
    isFeatured: true,
    isFavorite: false,
    popularityScore: 75,
    active: true,
  },
  {
    name: "Quiche de Alho-Poró e Queijos",
    slug: "quiche-de-alho-poro-e-queijos",
    description:
      "Massa amanteigada com recheio cremoso de alho-poró e mix de queijos.",
    price: 6400,
    images: ["/images/products/quiche-alho-poro.svg"],
    category: "salgados",
    ingredients: "Farinha, manteiga, alho-poró, queijo, creme de leite.",
    calories: 330,
    prepTimeMinutes: 55,
    yieldInfo: "6 fatias",
    isFeatured: false,
    isFavorite: false,
    popularityScore: 62,
    active: true,
  },
  {
    name: "Empadão de Frango Cremoso",
    slug: "empadao-de-frango-cremoso",
    description:
      "Empadão dourado com recheio de frango desfiado, requeijão e ervas.",
    price: 7200,
    images: ["/images/products/empadao-frango.svg"],
    category: "salgados",
    ingredients: "Frango, requeijão, farinha, manteiga, temperos naturais.",
    calories: 370,
    prepTimeMinutes: 65,
    yieldInfo: "8 fatias",
    isFeatured: false,
    isFavorite: true,
    popularityScore: 73,
    active: true,
  },
];

async function main() {
  await Promise.all(
    products.map((product) =>
      prisma.product.upsert({
        where: { slug: product.slug },
        update: product,
        create: product,
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed error:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
