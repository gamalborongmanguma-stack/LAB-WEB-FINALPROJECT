import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const values=[]; let where="WHERE is_active = TRUE";
    if(category && category!=="All"){values.push(category);where+=` AND category=$${values.length}`;}
    if(q){values.push(`%${q}%`);where+=` AND name ILIKE $${values.length}`;}
    const {rows}=await pool.query(`SELECT id,name,slug,description,category,price,stock,image_url,tag FROM products ${where} ORDER BY created_at DESC`,values);
    return NextResponse.json({products:rows});
  } catch (e) { console.error(e); return NextResponse.json({error:"Gagal mengambil produk."},{status:500}); }
}
