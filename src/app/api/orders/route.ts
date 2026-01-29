import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { CART_COOKIE, getEmptyCart, parseCart, serializeCart } from "@/lib/cart";
import { calculateShipping, type ShippingMethod } from "@/lib/shipping";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const orderSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(6),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressDistrict: z.string().optional(),
  addressCity: z.string().optional(),
  addressState: z.string().optional(),
  addressZip: z.string().optional(),
  addressReference: z.string().optional(),
  paymentMethod: z.string().min(2),
  shippingMethod: z.enum(["DELIVERY", "PICKUP"]),
});

const formatAddress = ({
  street,
  number,
  district,
  city,
  state,
  zip,
}: {
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  zip: string;
}) =>
  `${street}, ${number} - ${district}, ${city} / ${state} - ${zip}`;

export async function POST(request: Request) {
  try {
    const { prisma } = await import("@/lib/db");
    const payload = orderSchema.parse(await request.json());
    const cookieStore = await cookies();
    const cart = parseCart(cookieStore.get(CART_COOKIE)?.value);

    if (!cart.items.length) {
      return NextResponse.json(
        { message: "Carrinho vazio." },
        { status: 400 }
      );
    }

    if (payload.shippingMethod === "DELIVERY") {
      const missingAddress =
        !payload.addressStreet ||
        !payload.addressNumber ||
        !payload.addressDistrict ||
        !payload.addressCity ||
        !payload.addressState ||
        !payload.addressZip;

      if (missingAddress) {
        return NextResponse.json(
          { message: "Endereço incompleto para entrega." },
          { status: 400 }
        );
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const shippingFee = calculateShipping({
      city: payload.addressCity ?? "Minas Gerais",
      district: payload.addressDistrict ?? "Outros",
      method: payload.shippingMethod as ShippingMethod,
    });

    const total = subtotal + shippingFee;

    const addressStreet =
      payload.shippingMethod === "PICKUP"
        ? "Retirada no ateliê Ju.pani"
        : payload.addressStreet ?? "";
    const addressNumber =
      payload.shippingMethod === "PICKUP" ? "-" : payload.addressNumber ?? "";
    const addressDistrict =
      payload.shippingMethod === "PICKUP"
        ? "Retirada"
        : payload.addressDistrict ?? "";
    const addressCity =
      payload.shippingMethod === "PICKUP"
        ? "Minas Gerais"
        : payload.addressCity ?? "";
    const addressState =
      payload.shippingMethod === "PICKUP" ? "MG" : payload.addressState ?? "";
    const addressZip =
      payload.shippingMethod === "PICKUP" ? "35536-000" : payload.addressZip ?? "";

    const order = await prisma.order.create({
      data: {
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        addressStreet,
        addressNumber,
        addressDistrict,
        addressCity,
        addressState,
        addressZip,
        addressReference: payload.addressReference ?? null,
        paymentMethod: payload.paymentMethod,
        shippingMethod: payload.shippingMethod,
        notes: cart.notes ?? null,
        subtotal,
        shippingFee,
        total,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productSnapshotName: item.name,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            itemNotes: item.itemNotes ?? null,
          })),
        },
      },
      include: { items: true },
    });

    const message = buildWhatsAppMessage({
      items: cart.items,
      subtotal,
      shippingFee,
      total,
      paymentMethod: payload.paymentMethod,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      address: formatAddress({
        street: addressStreet,
        number: addressNumber,
        district: addressDistrict,
        city: addressCity,
        state: addressState,
        zip: addressZip,
      }),
      addressReference: payload.addressReference ?? null,
      notes: cart.notes ?? null,
    });

    const whatsappUrl = buildWhatsAppUrl(message);

    cookieStore.set(CART_COOKIE, serializeCart(getEmptyCart()), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return NextResponse.json({ orderId: order.id, whatsappUrl });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao criar pedido." },
      { status: 400 }
    );
  }
}
