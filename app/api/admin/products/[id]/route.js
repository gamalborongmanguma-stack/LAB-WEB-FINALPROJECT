import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
export async function PATCH(req,{params}){
 const a=await requireAdmin();if(a.error)return NextResponse.json({error:a.error},{status:a.status});
 try{const p=await req.json();const {rows}=await pool.query(`UPDATE products SET name=COALESCE($1,name),description=COALESCE($2,description),category=COALESCE($3,category),price=COALESCE($4,price),stock=COALESCE($5,stock),image_url=COALESCE($6,image_url),tag=$7,is_active=COALESCE($8,is_active),updated_at=NOW() WHERE id=$9 RETURNING *`,[p.name??null,p.description??null,p.category??null,p.price??null,p.stock??null,p.image_url??null,p.tag??null,p.is_active??null,params.id]);if(!rows[0])return NextResponse.json({error:"Produk tidak ditemukan."},{status:404});return NextResponse.json({product:rows[0]});}
 catch(e){console.error(e);return NextResponse.json({error:"Gagal memperbarui produk."},{status:500});}
}
