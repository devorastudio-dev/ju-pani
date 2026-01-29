export const PRODUCT_CATEGORIES = [
  { value: "bolos", label: "Bolos" },
  { value: "doces", label: "Doces" },
  { value: "tortas", label: "Tortas" },
  { value: "kits", label: "Kits" },
  { value: "salgados", label: "Salgados" },
  { value: "sem lactose", label: "Sem lactose" },
];

const titleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const getCategoryLabel = (value: string) => {
  const found = PRODUCT_CATEGORIES.find((item) => item.value === value);
  return found?.label ?? titleCase(value);
};
