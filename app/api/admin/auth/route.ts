import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, signToken } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { cookies } from "next/headers";

const utf8Headers = { "Content-Type": "application/json; charset=utf-8" };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const password = body?.password ? String(body.password) : "";

    // Preferred path: authenticated admin session
    const sessionUser = await getSessionUser(request);

    if (!sessionUser || sessionUser.role !== "ADMIN") {
      // Fallback path: bootstrap admin session with ADMIN_PASSWORD
      const adminPassword = process.env.ADMIN_PASSWORD || "";
      if (!adminPassword || !password || password !== adminPassword) {
        return NextResponse.json(
          { error: "Unauthorized - Admin access required" },
          { status: 403, headers: utf8Headers }
        );
      }

      const adminUser = await queryOne<{ id: string; phone: string | null; role: string }>(
        `SELECT id, phone, role FROM "User" WHERE role = 'ADMIN' ORDER BY "createdAt" ASC LIMIT 1`
      );

      if (!adminUser) {
        return NextResponse.json(
          { error: "No admin user found in database" },
          { status: 500, headers: utf8Headers }
        );
      }

      const token = await signToken({
        userId: adminUser.id,
        phone: adminUser.phone || undefined,
        role: "ADMIN",
      });

      const cookieStore = await cookies();
      cookieStore.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json(
        { success: true, message: "Admin session established" },
        { status: 200, headers: utf8Headers }
      );
    }

    // Already authenticated as admin
    return NextResponse.json(
      { success: true, message: "Admin access verified" },
      { status: 200, headers: utf8Headers }
    );
  } catch (error) {
    console.error("Admin auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500, headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  }
}

