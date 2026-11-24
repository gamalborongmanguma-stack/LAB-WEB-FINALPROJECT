import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET(){
  const auth=await requireUser();if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  try{const {rows}=await pool.query("SELECT id,order_number,total,status,payment_status,created_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC",[auth.user.id]);return NextResponse.json({orders:rows});}
  catch(e){console.error(e);return NextResponse.json({error:"Gagal mengambil pesanan."},{status:500});}
}
export async function POST(req){
  const auth=await requireUser();if(auth.error)return NextResponse.json({error:auth.error},{status:auth.status});
  const client=await pool.connect();
  try{
    const body=await req.json();const {customer_name,phone,shipping_address,notes,payment_method="manual_transfer"}=body;
    if(!customer_name?.trim()||!phone?.trim()||!shipping_address?.trim())return NextResponse.json({error:"Nama, nomor telepon, dan alamat wajib diisi."},{status:400});
    if(!["manual_transfer","cod"].includes(payment_method))return NextResponse.json({error:"Metode pembayaran tidak tersedia."},{status:400});
    await client.query("BEGIN");
    const cart=await client.query(`SELECT ci.product_id,ci.quantity,p.name,p.price,p.stock FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.user_id=$1 FOR UPDATE OF p`,[auth.user.id]);
    if(!cart.rows.length){await client.query("ROLLBACK");return NextResponse.json({error:"Keranjang masih kosong."},{status:400});}
    for(const item of cart.rows){if(item.quantity>item.stock){await client.query("ROLLBACK");return NextResponse.json({error:`Stok ${item.name} tidak mencukupi.`},{status:409});}}
    const subtotal=cart.rows.reduce((s,x)=>s+Number(x.price)*x.quantity,0),shipping=0,total=subtotal+shipping;
    const orderNumber=`NOC-${Date.now().toString(36).toUpperCase()}`;
    const created=await client.query(`INSERT INTO orders(user_id,order_number,customer_name,phone,shipping_address,notes,subtotal,shipping_cost,total,payment_method)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,order_number,total,status,payment_status,created_at`,
      [auth.user.id,orderNumber,customer_name.trim(),phone.trim(),shipping_address.trim(),notes||null,subtotal,shipping,total,payment_method]);
    for(const item of cart.rows){
      await client.query("INSERT INTO order_items(order_id,product_id,product_name,unit_price,quantity,line_total) VALUES($1,$2,$3,$4,$5,$6)",[created.rows[0].id,item.product_id,item.name,item.price,item.quantity,Number(item.price)*item.quantity]);
      await client.query("UPDATE products SET stock=stock-$1,updated_at=NOW() WHERE id=$2",[item.quantity,item.product_id]);
    }
    await client.query("DELETE FROM cart_items WHERE user_id=$1",[auth.user.id]);
    await client.query("COMMIT");
    return NextResponse.json({order:created.rows[0]},{status:201});
  }catch(e){await client.query("ROLLBACK");console.error(e);return NextResponse.json({error:"Pesanan gagal diproses."},{status:500});}
  finally{client.release();}
}
