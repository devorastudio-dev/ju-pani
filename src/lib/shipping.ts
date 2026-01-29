export type ShippingMethod = "DELIVERY" | "PICKUP";

export type ShippingRule = {
  city: string;
  district: string;
  fee: number;
};

export const SHIPPING_METHODS: {
  id: ShippingMethod;
  label: string;
  description: string;
}[] = [
  {
    id: "DELIVERY",
    label: "Entrega",
    description: "Taxa calculada conforme bairro.",
  },
  {
    id: "PICKUP",
    label: "Retirar no ateliê",
    description: "Sem taxa de entrega.",
  },
];

export const SHIPPING_RULES: ShippingRule[] = [
  { city: "São Paulo", district: "Pinheiros", fee: 900 },
  { city: "São Paulo", district: "Vila Madalena", fee: 1000 },
  { city: "São Paulo", district: "Perdizes", fee: 1100 },
  { city: "São Paulo", district: "Outros", fee: 1500 },
];

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

export const calculateShipping = ({
  city,
  district,
  method,
}: {
  city: string;
  district: string;
  method: ShippingMethod;
}) => {
  if (method === "PICKUP") {
    return 0;
  }

  const normalizedCity = normalize(city);
  const normalizedDistrict = normalize(district);

  const rule =
    SHIPPING_RULES.find(
      (item) =>
        normalize(item.city) === normalizedCity &&
        normalize(item.district) === normalizedDistrict
    ) ??
    SHIPPING_RULES.find(
      (item) =>
        normalize(item.city) === normalizedCity &&
        normalize(item.district) === normalize("Outros")
    );

  return rule ? rule.fee : 1500;
};
