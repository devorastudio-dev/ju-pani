"use client";

import { useEffect, useRef, useState } from "react";
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
  ingredients: string;
  calories: number | null;
  prepTimeMinutes: number | null;
  yieldInfo: string;
  isFeatured: boolean;
  isFavorite: boolean;
  active: boolean;
  images: string[];
};

type AdminProductsClientProps = {
  initialProducts: AdminProduct[];
  initialQuery: string;
  initialCategory: string;
  initialPage: number;
  initialTotalPages: number;
  initialTotal: number;
};

const PAGE_SIZE = 10;

export const AdminProductsClient = ({
  initialProducts,
  initialQuery,
  initialCategory,
  initialPage,
  initialTotalPages,
  initialTotal,
}: AdminProductsClientProps) => {
  const [products, setProducts] = useState(initialProducts);
  const [creating, setCreating] = useState(false);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedRef = useRef(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    category: PRODUCT_CATEGORIES[0]?.value ?? "",
    images: [] as string[],
    ingredients: "",
    calories: "",
    prepTimeMinutes: "",
    yieldInfo: "",
  });
  const categories = [{ value: "all", label: "Todas" }, ...PRODUCT_CATEGORIES];
  const parseOptionalInt = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (!hasMountedRef.current && refreshKey === 0) {
      hasMountedRef.current = true;
      return;
    }
    hasMountedRef.current = true;
    const controller = new AbortController();
    const loadProducts = async () => {
      setLoadingList(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQuery) {
          params.set("q", debouncedQuery);
        }
        if (categoryFilter && categoryFilter !== "all") {
          params.set("category", categoryFilter);
        }
        params.set("page", String(page));
        params.set("pageSize", String(PAGE_SIZE));
        params.set("includeInactive", "1");
        const response = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message ?? data?.error ?? "Erro ao carregar produtos.");
        }
        setProducts(data.items ?? []);
        setTotalPages(data.totalPages ?? 1);
        setTotal(data.total ?? 0);
      } catch (error) {
        if (!controller.signal.aborted) {
          showToast(
            error instanceof Error ? error.message : "Erro ao carregar produtos.",
            "error"
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingList(false);
        }
      }
    };

    void loadProducts();

    return () => {
      controller.abort();
    };
  }, [categoryFilter, debouncedQuery, page, refreshKey]);

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
          ingredients: form.ingredients.trim() || undefined,
          yieldInfo: form.yieldInfo.trim() || undefined,
          calories: parseOptionalInt(form.calories),
          prepTimeMinutes: parseOptionalInt(form.prepTimeMinutes),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? "Erro ao criar produto.");
      }
      setRefreshKey((prev) => prev + 1);
      setForm({
        name: "",
        slug: "",
        description: "",
        price: "",
        category: PRODUCT_CATEGORIES[0]?.value ?? "",
        images: [],
        ingredients: "",
        calories: "",
        prepTimeMinutes: "",
        yieldInfo: "",
      });
      showToast("Produto criado com sucesso.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro inesperado.",
        "error"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (product: AdminProduct) => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? data?.error ?? "Erro ao atualizar produto.");
      }
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? data.product : item))
      );
      showToast("Produto atualizado.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao atualizar produto.",
        "error"
      );
    }
  };

  const handleQuickEdit = async (product: AdminProduct) => {
    setSavingProductId(product.id);
    try {
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
          ingredients: product.ingredients,
          calories: product.calories,
          prepTimeMinutes: product.prepTimeMinutes,
          yieldInfo: product.yieldInfo,
          isFeatured: product.isFeatured,
          isFavorite: product.isFavorite,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message ?? data?.error ?? "Erro ao atualizar produto.");
      }
      setProducts((prev) =>
        prev.map((item) => (item.id === product.id ? data.product : item))
      );
      showToast("Salvo com sucesso.", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Erro ao atualizar produto.",
        "error"
      );
    } finally {
      setSavingProductId(null);
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
      {toast && (
        <div className="fixed right-6 top-24 z-50">
          <div
            role="status"
            className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-soft ${
              toast.type === "success"
                ? "bg-[#3a231c] text-white"
                : "bg-red-100 text-red-700"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
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
          <Textarea
            className="md:col-span-2"
            rows={2}
            placeholder="Ingredientes"
            value={form.ingredients}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, ingredients: event.target.value }))
            }
          />
          <Input
            placeholder="Calorias (kcal)"
            value={form.calories}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, calories: event.target.value }))
            }
          />
          <Input
            placeholder="Tempo de preparo (min)"
            value={form.prepTimeMinutes}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                prepTimeMinutes: event.target.value,
              }))
            }
          />
          <Input
            placeholder="Rendimento (ex: 6 fatias)"
            value={form.yieldInfo}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, yieldInfo: event.target.value }))
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
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h2 className="font-display text-2xl text-[#3a231c]">
          Produtos cadastrados
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr_auto] md:items-end">
          <div>
            <label className="text-xs font-semibold text-[#7b3b30]">
              Buscar por nome
            </label>
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Ex: bolo, torta, brigadeiro"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#7b3b30]">
              Categoria
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-[#3a231c] shadow-sm focus:border-[#d59a73] focus:outline-none"
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#7b3b30] md:justify-end">
            <span>
              {loadingList ? "Carregando..." : `${total} produto(s)`}
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setPage(1);
              }}
            >
              Limpar filtros
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {loadingList ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="rounded-2xl border border-[#f3d6cc] bg-[#fff8f3] p-4"
              >
                <div className="h-4 w-40 animate-pulse rounded-full bg-[#f3d6cc]" />
                <div className="mt-3 h-3 w-24 animate-pulse rounded-full bg-[#f3d6cc]" />
                <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/60" />
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#f3d6cc] bg-[#fff8f3] p-6 text-center">
              <p className="text-sm font-semibold text-[#3a231c]">
                Nenhum produto encontrado.
              </p>
              <p className="mt-2 text-xs text-[#7b3b30]">
                Ajuste os filtros ou limpe a busca para ver todos.
              </p>
            </div>
          ) : (
            <>
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
                    <Textarea
                      rows={2}
                      className="md:col-span-2"
                      value={product.ingredients}
                      onChange={(event) =>
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === product.id
                              ? {
                                  ...item,
                                  ingredients: event.target.value,
                                }
                              : item
                          )
                        )
                      }
                    />
                    <Input
                      value={
                        product.calories === null ? "" : String(product.calories)
                      }
                      onChange={(event) =>
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === product.id
                              ? {
                                  ...item,
                                  calories:
                                    parseOptionalInt(event.target.value) ?? null,
                                }
                              : item
                          )
                        )
                      }
                      placeholder="Calorias (kcal)"
                    />
                    <Input
                      value={
                        product.prepTimeMinutes === null
                          ? ""
                          : String(product.prepTimeMinutes)
                      }
                      onChange={(event) =>
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === product.id
                              ? {
                                  ...item,
                                  prepTimeMinutes:
                                    parseOptionalInt(event.target.value) ?? null,
                                }
                              : item
                          )
                        )
                      }
                      placeholder="Tempo de preparo (min)"
                    />
                    <Input
                      value={product.yieldInfo}
                      onChange={(event) =>
                        setProducts((prev) =>
                          prev.map((item) =>
                            item.id === product.id
                              ? { ...item, yieldInfo: event.target.value }
                              : item
                          )
                        )
                      }
                      placeholder="Rendimento"
                    />
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-xs font-semibold text-[#7b3b30]">
                        Imagens do produto
                      </label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        multiple
                        onChange={(event) =>
                          handleAddProductImages(product.id, event)
                        }
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
                      disabled={savingProductId === product.id}
                      onClick={() => handleQuickEdit(product)}
                    >
                      {savingProductId === product.id ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#7b3b30]/40 border-t-[#7b3b30]" />
                          Salvando...
                        </span>
                      ) : (
                        "Salvar edições"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        {totalPages > 1 && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <Button
                  key={`page-${pageNumber}`}
                  type="button"
                  variant={pageNumber === page ? "primary" : "secondary"}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            )}
            <Button
              type="button"
              variant="secondary"
              disabled={page === totalPages}
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

