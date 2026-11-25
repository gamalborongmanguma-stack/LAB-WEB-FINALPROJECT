import {cookies} from 'next/headers';
import {SignJWT,jwtVerify} from 'jose';
const secret=new TextEncoder().encode(process.env.JWT_SECRET||'development-secret-change-this-before-deploying-123');
export async function createSession(user){const token=await new SignJWT({id:user.id,email:user.email,name:user.name,role:user.role,status:user.status}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('7d').sign(secret);(await cookies()).set('nexa_session',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*7});}
export async function getUser(){try{const token=(await cookies()).get('nexa_session')?.value;if(!token)return null;const {payload}=await jwtVerify(token,secret);return payload}catch{return null}}
export async function logout(){(await cookies()).delete('nexa_session')}
