"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";
import { PRODUCT_CATEGORIES, getCategoryLabel } from "@/lib/categories";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  isFeatured: boolean;
  isFavorite: boolean;
  active: boolean;
  images: string[];
};

type AdminProductsClientProps = {
  initialProducts: AdminProduct[];
};

export const AdminProductsClient = ({
  initialProducts,
}: AdminProductsClientProps) => {
  const [products, setProducts] = useState(initialProducts);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    category: PRODUCT_CATEGORIES[0]?.value ?? "",
    images: [] as string[],
  });
  const [message, setMessage] = useState<string | null>(null);

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Erro ao ler a imagem."));
      reader.readAsDataURL(file);
    });

  const handleCreateImages = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }
    const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...dataUrls] }));
    event.target.value = "";
  };

  const removeCreateImage = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleCreate = async () => {
    setCreating(true);
    setMessage(null);
    try {
      const images = form.images.length
        ? form.images
        : ["/images/products/bolo-red-velvet.svg"];
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          images,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Erro ao criar produto.");
      }
      setProducts((prev) => [data.product, ...prev]);
      setForm({
        name: "",
        slug: "",
        description: "",
        price: "",
        category: "",
        images: [],
      });
      setMessage("Produto criado com sucesso.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro inesperado.");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active }),
    });
    const data = await response.json();
    if (response.ok) {
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? data.product : item))
      );
    } else {
      setMessage(data?.message ?? "Erro ao atualizar produto.");
    }
  };

  const handleQuickEdit = async (product: AdminProduct) => {
    const response = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        category: product.category,
        images: product.images,
        isFeatured: product.isFeatured,
        isFavorite: product.isFavorite,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? data.product : item))
      );
      setMessage("Produto atualizado.");
    } else {
      setMessage(data?.message ?? "Erro ao atualizar produto.");
    }
  };

  const handleAddProductImages = async (
    productId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }
    const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, images: [...item.images, ...dataUrls] }
          : item
      )
    );
    event.target.value = "";
  };

  const handleRemoveProductImage = (productId: string, index: number) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, images: item.images.filter((_, idx) => idx !== index) }
          : item
      )
    );
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl text-[#3a231c]">
          Criar novo produto
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input
            placeholder="Nome"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
          />
          <Input
            placeholder="Slug (sem espacos)"
            value={form.slug}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, slug: event.target.value }))
            }
          />
          <select
            value={form.category}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, category: event.target.value }))
            }
            className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-[#3a231c] shadow-sm focus:border-[#d59a73] focus:outline-none"
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          <Input
            placeholder="Preco em centavos (ex: 8900)"
            value={form.price}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, price: event.target.value }))
            }
          />
          <Textarea
            className="md:col-span-2"
            rows={3}
            placeholder="Descricao"
            value={form.description}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, description: event.target.value }))
            }
          />
        </div>
        <div className="mt-4 space-y-3">
          <label className="text-xs font-semibold text-[#7b3b30]">
            Adicionar imagens (PNG, JPEG, JPG)
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            multiple
            onChange={handleCreateImages}
            className="block w-full text-sm text-[#7b3b30]"
          />
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {form.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative h-20 w-20 overflow-hidden rounded-2xl border border-[#f3d6cc] bg-white"
                >
                  <img
                    src={image}
                    alt="Previa"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#7b3b30]"
                    onClick={() => removeCreateImage(index)}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          className="mt-4"
          disabled={creating}
          onClick={handleCreate}
        >
          {creating ? "Salvando..." : "Criar produto"}
        </Button>
        {message && <p className="mt-3 text-sm text-[#7b3b30]">{message}</p>}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl text-[#3a231c]">
          Produtos cadastrados
        </h2>
        <div className="mt-4 grid gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-2xl border border-[#f3d6cc] bg-[#fff8f3] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#3a231c]">
                    {product.name}
                  </p>
                  <p className="text-xs text-[#7b3b30]">
                    {getCategoryLabel(product.category)} -{" "}
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleToggleActive(product)}
                  >
                    {product.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Input
                  value={product.name}
                  onChange={(event) =>
                    setProducts((prev) =>
                      prev.map((item) =>
                        item.id === product.id
                          ? { ...item, name: event.target.value }
                          : item
                      )
                    )
                  }
                />
                <Input
                  value={product.slug}
                  onChange={(event) =>
                    setProducts((prev) =>
                      prev.map((item) =>
                        item.id === product.id
                          ? { ...item, slug: event.target.value }
                          : item
                      )
                    )
                  }
                />
                <select
                  value={product.category}
                  onChange={(event) =>
                    setProducts((prev) =>
                      prev.map((item) =>
                        item.id === product.id
                          ? { ...item, category: event.target.value }
                          : item
                      )
                    )
                  }
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-[#3a231c] shadow-sm focus:border-[#d59a73] focus:outline-none"
                >
                  {PRODUCT_CATEGORIES.some(
                    (category) => category.value === product.category
                  ) ? null : (
                    <option value={product.category}>
                      {getCategoryLabel(product.category)}
                    </option>
                  )}
                  {PRODUCT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <Input
                  value={String(product.price)}
                  onChange={(event) =>
                    setProducts((prev) =>
                      prev.map((item) =>
                        item.id === product.id
                          ? { ...item, price: Number(event.target.value) || 0 }
                          : item
                      )
                    )
                  }
                />
                <Textarea
                  rows={2}
                  className="md:col-span-2"
                  value={product.description}
                  onChange={(event) =>
                    setProducts((prev) =>
                      prev.map((item) =>
                        item.id === product.id
                          ? { ...item, description: event.target.value }
                          : item
                      )
                    )
                  }
                />
                <div className="md:col-span-2 space-y-3">
                  <label className="text-xs font-semibold text-[#7b3b30]">
                    Imagens do produto
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    onChange={(event) => handleAddProductImages(product.id, event)}
                    className="block w-full text-sm text-[#7b3b30]"
                  />
                  {product.images.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {product.images.map((image, index) => (
                        <div
                          key={`${product.id}-${index}`}
                          className="relative h-20 w-20 overflow-hidden rounded-2xl border border-[#f3d6cc] bg-white"
                        >
                          <img
                            src={image}
                            alt="Previa"
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#7b3b30]"
                            onClick={() =>
                              handleRemoveProductImage(product.id, index)
                            }
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-[#7b3b30]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={product.isFeatured}
                      onChange={(event) =>
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === product.id
                              ? { ...item, isFeatured: event.target.checked }
                              : item
                          )
                        )
                      }
                    />
                    Destaque
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={product.isFavorite}
                      onChange={(event) =>
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === product.id
                              ? { ...item, isFavorite: event.target.checked }
                              : item
                          )
                        )
                      }
                    />
                    Favorito
                  </label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleQuickEdit(product)}
                >
                  Salvar edicao
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
