import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req) {
  try {
    const {name,email,password}=await req.json();
    if(!name?.trim()||!email?.trim()||!password||password.length<8) return NextResponse.json({error:"Nama, email, dan password minimal 8 karakter wajib diisi."},{status:400});
    const normalized=email.trim().toLowerCase();
    const hash=await bcrypt.hash(password,12);
    const {rows}=await pool.query("INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,role",[name.trim(),normalized,hash]);
    await createSession(rows[0]);
    return NextResponse.json({user:rows[0]},{status:201});
  } catch(e) {
    if(e.code==="23505") return NextResponse.json({error:"Email sudah terdaftar."},{status:409});
    console.error(e);return NextResponse.json({error:"Registrasi gagal."},{status:500});
  }
}
