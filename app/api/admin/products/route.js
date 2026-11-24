import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
export async function GET(){const a=await requireAdmin();if(a.error)return NextResponse.json({error:a.error},{status:a.status});const {rows}=await pool.query("SELECT * FROM products ORDER BY created_at DESC");return NextResponse.json({products:rows});}
export async function POST(req){
 const a=await requireAdmin();if(a.error)return NextResponse.json({error:a.error},{status:a.status});
 try{const p=await req.json();const required=["name","slug","category","image_url"];if(required.some(k=>!String(p[k]||"").trim())||!Number.isFinite(Number(p.price))||Number(p.price)<0||!Number.isInteger(Number(p.stock))||Number(p.stock)<0)return NextResponse.json({error:"Data produk tidak lengkap atau tidak valid."},{status:400});
 const {rows}=await pool.query(`INSERT INTO products(name,slug,description,category,price,stock,image_url,tag) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,[p.name,p.slug,p.description||"",p.category,Number(p.price),Number(p.stock),p.image_url,p.tag||null]);return NextResponse.json({product:rows[0]},{status:201});
 }catch(e){if(e.code==="23505")return NextResponse.json({error:"Slug produk sudah digunakan."},{status:409});console.error(e);return NextResponse.json({error:"Gagal membuat produk."},{status:500});}
}
