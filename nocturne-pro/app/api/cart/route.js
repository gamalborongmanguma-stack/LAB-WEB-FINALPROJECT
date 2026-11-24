import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(){
  const auth=await requireUser();if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  try{const {rows}=await pool.query(`SELECT ci.product_id,ci.quantity,p.name,p.price,p.stock,p.image_url FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.user_id=$1 AND p.is_active=TRUE ORDER BY ci.created_at DESC`,[auth.user.id]);return NextResponse.json({items:rows});}
  catch(e){console.error(e);return NextResponse.json({error:"Gagal mengambil keranjang."},{status:500});}
}
export async function POST(req){
  const auth=await requireUser();if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  try{const {product_id,quantity=1}=await req.json();const qty=Number(quantity);if(!Number.isInteger(qty)||qty<1||qty>20)return NextResponse.json({error:"Jumlah produk tidak valid."},{status:400});
    const p=await pool.query("SELECT id,stock,is_active FROM products WHERE id=$1",[product_id]);if(!p.rows[0]||!p.rows[0].is_active)return NextResponse.json({error:"Produk tidak tersedia."},{status:404});
    const existing=await pool.query("SELECT quantity FROM cart_items WHERE user_id=$1 AND product_id=$2",[auth.user.id,product_id]);const next=(existing.rows[0]?.quantity||0)+qty;if(next>p.rows[0].stock)return NextResponse.json({error:"Jumlah melebihi stok tersedia."},{status:409});
    await pool.query(`INSERT INTO cart_items(user_id,product_id,quantity) VALUES($1,$2,$3) ON CONFLICT(user_id,product_id) DO UPDATE SET quantity=EXCLUDED.quantity`,[auth.user.id,product_id,next]);return NextResponse.json({ok:true},{status:201});
  }catch(e){console.error(e);return NextResponse.json({error:"Gagal menambahkan produk."},{status:500});}
}
export async function PATCH(req){
  const auth=await requireUser();if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  try{const {product_id,quantity}=await req.json();const qty=Number(quantity);if(!Number.isInteger(qty)||qty<0||qty>20)return NextResponse.json({error:"Jumlah tidak valid."},{status:400});
    if(qty===0)await pool.query("DELETE FROM cart_items WHERE user_id=$1 AND product_id=$2",[auth.user.id,product_id]);
    else {const p=await pool.query("SELECT stock FROM products WHERE id=$1",[product_id]);if(!p.rows[0]||qty>p.rows[0].stock)return NextResponse.json({error:"Stok tidak mencukupi."},{status:409});await pool.query("UPDATE cart_items SET quantity=$1 WHERE user_id=$2 AND product_id=$3",[qty,auth.user.id,product_id]);}
    return NextResponse.json({ok:true});
  }catch(e){console.error(e);return NextResponse.json({error:"Gagal mengubah keranjang."},{status:500});}
}
export async function DELETE(req){
  const auth=await requireUser();if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  try{const {product_id}=await req.json();await pool.query("DELETE FROM cart_items WHERE user_id=$1 AND product_id=$2",[auth.user.id,product_id]);return NextResponse.json({ok:true});}
  catch(e){console.error(e);return NextResponse.json({error:"Gagal menghapus produk."},{status:500});}
}
