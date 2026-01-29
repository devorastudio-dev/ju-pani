import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { ProductCard } from "@/lib/types";
import { getCategoryLabel } from "@/lib/categories";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

type ProductCardProps = {
  product: ProductCard;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const image = product.images?.[0] ?? "/images/products/bolo-red-velvet.svg";
  const isDataImage = image.startsWith("data:");

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition hover:-translate-y-1">
      <Link href={`/pedidos/${product.slug}`} className="relative block h-44">
        <Image
          src={image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
          unoptimized={isDataImage}
        />
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{getCategoryLabel(product.category)}</Badge>
          {product.isFeatured && <Badge variant="featured">Destaque</Badge>}
          {product.isFavorite && <Badge variant="favorite">Favorito</Badge>}
        </div>
        <div className="space-y-2">
          <Link href={`/pedidos/${product.slug}`}>
            <h3 className="text-lg font-semibold text-[#3a231c] transition hover:text-[#d37d64]">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-[#7b3b30]">{product.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-base font-semibold text-[#3a231c]">
            {formatCurrency(product.price)}
          </span>
          <AddToCartButton
            product={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              image,
              unitPrice: product.price,
            }}
          />
        </div>
      </div>
    </div>
  );
};
