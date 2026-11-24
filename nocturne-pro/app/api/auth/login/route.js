import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { pool } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req) {
  try {
    const {email,password}=await req.json();
    if(!email||!password)return NextResponse.json({error:"Email dan password wajib diisi."},{status:400});
    const {rows}=await pool.query("SELECT id,name,email,password_hash,role FROM users WHERE email=$1",[email.trim().toLowerCase()]);
    if(!rows[0]||!(await bcrypt.compare(password,rows[0].password_hash)))return NextResponse.json({error:"Email atau password salah."},{status:401});
    const user={id:rows[0].id,name:rows[0].name,email:rows[0].email,role:rows[0].role};
    await createSession(user);return NextResponse.json({user});
  }catch(e){console.error(e);return NextResponse.json({error:"Login gagal."},{status:500});}
}
