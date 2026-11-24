import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
export async function GET(){const a=await requireAdmin();if(a.error)return NextResponse.json({error:a.error},{status:a.status});const {rows}=await pool.query(`SELECT o.*,u.email FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC LIMIT 200`);return NextResponse.json({orders:rows});}
