import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "@/lib/users";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, name, role } = body;

  if (!email || !password || !name || !role) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (role !== "recruiter" && role !== "candidate") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = `user-${Date.now()}`;

  await createUser({ userId, email, name, role, passwordHash });

  return NextResponse.json({ success: true });
}