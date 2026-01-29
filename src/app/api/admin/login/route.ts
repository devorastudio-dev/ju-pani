import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE } from "@/lib/admin";

const schema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { password } = schema.parse(await request.json());
    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: "ADMIN_PASSWORD não configurada." },
        { status: 500 }
      );
    }
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Senha inválida." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Erro ao autenticar." },
      { status: 400 }
    );
  }
}
