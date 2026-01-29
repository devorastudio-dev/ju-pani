"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/cart-provider";

type AddToCartButtonProps = {
  product: {
    productId: string;
    name: string;
    slug: string;
    image?: string | null;
    unitPrice: number;
  };
  quantity?: number;
  itemNotes?: string | null;
};

export const AddToCartButton = ({
  product,
  quantity = 1,
  itemNotes,
}: AddToCartButtonProps) => {
  const { addItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    try {
      setLoading(true);
      await addItem({ ...product, quantity, itemNotes });
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      className="px-3 py-1 text-xs"
      disabled={loading}
      onClick={handleAdd}
    >
      {added ? "Adicionado ✓" : loading ? "Adicionando..." : "Adicionar"}
    </Button>
  );
};
