"use client";
import { useEffect, useMemo, useState } from "react";

const money = n => new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n||0));

export default function Home() {
  const [products,setProducts]=useState([]);
  const [category,setCategory]=useState("All");
  const [query,setQuery]=useState("");
  const [cart,setCart]=useState([]);
  const [user,setUser]=useState(null);
  const [drawer,setDrawer]=useState(false);
  const [authOpen,setAuthOpen]=useState(false);
  const [authMode,setAuthMode]=useState("login");
  const [toast,setToast]=useState("");
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [busy,setBusy]=useState(false);
  const [wishlist,setWishlist]=useState([]);
  const [checkoutOpen,setCheckoutOpen]=useState(false);
  const [shipping,setShipping]=useState({customer_name:"",phone:"",shipping_address:"",notes:""});
  const [orders,setOrders]=useState([]);
  const [accountOpen,setAccountOpen]=useState(false);

  const notify = msg => { setToast(msg); setTimeout(()=>setToast(""),2600); };
  async function loadProducts(){const r=await fetch("/api/products");const d=await r.json();if(r.ok)setProducts(d.products||[]);}
  async function loadMe(){const r=await fetch("/api/auth/me");const d=await r.json();if(r.ok&&d.user){setUser(d.user);setShipping(s=>({...s,customer_name:d.user.name}));}}
  async function loadCart(){const r=await fetch("/api/cart");const d=await r.json();if(r.ok)setCart(d.items||[]);}
  useEffect(()=>{loadProducts();loadMe();},[]);
  useEffect(()=>{if(user)loadCart();else setCart([]);},[user]);
  useEffect(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll(".reveal").forEach(el=>io.observe(el));return()=>io.disconnect();},[products]);

  const filtered=useMemo(()=>products.filter(p=>(category==="All"||p.category===category)&&p.name.toLowerCase().includes(query.toLowerCase())),[products,category,query]);
  const cartCount=cart.reduce((s,x)=>s+x.quantity,0), subtotal=cart.reduce((s,x)=>s+Number(x.price)*x.quantity,0);
  async function addCart(p){if(!user){setAuthOpen(true);setAuthMode("login");notify("Login untuk menyimpan keranjang.");return;}const r=await fetch("/api/cart",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({product_id:p.id,quantity:1})});const d=await r.json();if(!r.ok)return notify(d.error||"Gagal menambahkan produk.");await loadCart();notify("Produk ditambahkan ke bag.");}
  async function changeQty(id,quantity){const r=await fetch("/api/cart",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({product_id:id,quantity})});const d=await r.json();if(!r.ok)notify(d.error||"Gagal mengubah keranjang.");await loadCart();}
  async function removeItem(id){await fetch("/api/cart",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({product_id:id})});await loadCart();}
  async function submitAuth(e){e.preventDefault();setBusy(true);try{const endpoint=authMode==="login"?"/api/auth/login":"/api/auth/register";const r=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.error);setUser(d.user);setAuthOpen(false);setForm({name:"",email:"",password:""});notify("Berhasil masuk. Selamat datang!");}catch(err){notify(err.message);}finally{setBusy(false);}}
  async function logout(){await fetch("/api/auth/logout",{method:"POST"});setUser(null);setCart([]);setAccountOpen(false);notify("Kamu sudah logout.");}
  async function submitCheckout(e){e.preventDefault();setBusy(true);try{const r=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...shipping,payment_method:"manual_transfer"})});const d=await r.json();if(!r.ok)throw new Error(d.error);setCheckoutOpen(false);setDrawer(false);setCart([]);notify(`Pesanan ${d.order.order_number} berhasil dibuat.`);setAccountOpen(true);await loadOrders();}catch(err){notify(err.message);}finally{setBusy(false);}}
  async function loadOrders(){const r=await fetch("/api/orders");const d=await r.json();if(r.ok)setOrders(d.orders||[]);}
  async function showAccount(){if(!user){setAuthOpen(true);return;}await loadOrders();setAccountOpen(true);}
  const toggleWish=id=>setWishlist(old=>old.includes(id)?old.filter(x=>x!==id):[...old,id]);

  return <><div className="announcement">NEW SEASON DROP — FREE SHIPPING FOR ORDERS OVER Rp500.000</div>
    <header className="navbar"><a className="brand" href="#"><span className="brand-mark">N</span> NOCTURNE<span className="brand-dot">.</span></a>
      <nav className="nav-links"><a href="#home">Home</a><a href="#shop">Shop</a><a href="#story">Our story</a></nav>
      <div className="nav-actions"><button className="icon-btn" onClick={()=>document.getElementById("search").focus()}>⌕</button><button className="icon-btn" onClick={()=>notify(`${wishlist.length} produk tersimpan di wishlist.`)}>♡</button><button className="icon-btn account-btn" onClick={showAccount}>{user?user.name.split(" ")[0]:"Account"}</button><button className="cart-trigger" onClick={()=>setDrawer(true)}>Bag <span>{cartCount}</span></button><button className="menu-toggle" onClick={()=>document.querySelector(".nav-links").classList.toggle("open")}>☰</button></div>
    </header>
    <main><section className="hero" id="home"><div className="hero-glow"/><div className="hero-grid"/>
      <div className="hero-copy reveal"><span className="eyebrow"><i/> THE NOVEMBER COLLECTION</span><h1>Make space<br/>for <em>better</em> things.</h1><p>Thoughtfully selected essentials for the way you live, create, and move through the world.</p><div className="hero-buttons"><a className="btn btn-primary" href="#shop">Explore collection <span>↗</span></a><a className="text-link" href="#story">Discover our story →</a></div><div className="hero-meta"><div><strong>01</strong><span>Curated design</span></div><div><strong>02</strong><span>Quality first</span></div><div><strong>03</strong><span>Made to last</span></div></div></div>
      <div className="hero-art reveal"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=90" alt="Studio headphones"/></div><div className="floating-tag tag-top">✦ EDITOR'S PICK</div><div className="floating-tag tag-bottom"><small>FEATURED OBJECT</small><strong>Studio Headphones</strong><span>Rp 1.249.000</span></div></div>
      <div className="scroll-note">SCROLL TO EXPLORE ↓</div></section>
      <section className="ticker"><div className="ticker-track"><span>LESS BUT BETTER</span> ✳ <span>DESIGNED TO LAST</span> ✳ <span>EVERYDAY OBJECTS</span> ✳ <span>LESS BUT BETTER</span> ✳ <span>DESIGNED TO LAST</span> ✳</div></section>
      <section className="shop-section section-pad" id="shop"><div className="section-heading reveal"><div><span className="eyebrow">THE GOOD STUFF</span><h2>Find your next <em>favorite.</em></h2></div><p>Useful things. Beautifully made.<br/>Chosen with intention.</p></div>
        <div className="shop-toolbar"><div className="filters">{["All","Tech","Lifestyle","Accessories"].map(c=><button key={c} className={`filter ${category===c?"active":""}`} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="search-box">⌕ <input id="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..."/></label></div>
        <div className="product-grid">{filtered.map((p,i)=><article className="product-card" key={p.id} style={{animationDelay:`${i*55}ms`}}><div className="product-image"><img src={p.image_url} alt={p.name}/>{p.tag&&<span className="product-tag">{p.tag}</span>}<button className={`heart ${wishlist.includes(p.id)?"liked":""}`} onClick={()=>toggleWish(p.id)}>{wishlist.includes(p.id)?"♥":"♡"}</button><button className="quick-add" onClick={()=>addCart(p)}>ADD TO BAG　＋</button></div><div className="product-info"><div><small>{p.category.toUpperCase()} · STOCK {p.stock}</small><h3>{p.name}</h3></div><span className="product-price">{money(p.price)}</span></div></article>)}</div>
        {!filtered.length&&<p className="empty-note">Produk tidak ditemukan.</p>}
      </section>
      <section className="editorial section-pad" id="story"><div className="editorial-image reveal"><img src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1200&q=85" alt="Interior minimalis"/><span className="image-caption">OBJECTS WITH PURPOSE — EST. 2024</span></div><div className="editorial-copy reveal"><span className="eyebrow">A DIFFERENT KIND OF STORE</span><h2>Buy less.<br/><em>Choose well.</em><br/>Live better.</h2><p>NOCTURNE is a collection of considered objects for everyday life. We believe great design should feel effortless, work beautifully, and stay with you for years.</p><a className="text-link" href="#shop">Shop the collection →</a><div className="editorial-number">N° 001 / OUR PHILOSOPHY</div></div></section>
      <section className="newsletter section-pad"><div><span className="eyebrow">THE NOCTURNE LETTER</span><h2>A little more <em>inspiration.</em></h2><p>New arrivals, thoughtful finds, and notes from our world. No noise.</p></div><form onSubmit={e=>{e.preventDefault();notify("Terima kasih sudah berlangganan!");e.target.reset();}}><input type="email" placeholder="Your email address" required/><button className="btn btn-primary">Subscribe ↗</button></form></section>
    </main><footer><a className="brand" href="#"><span className="brand-mark">N</span> NOCTURNE<span className="brand-dot">.</span></a><span>© 2026 NOCTURNE STUDIO</span><div><a href="#shop">Instagram</a><a href={`mailto:${process.env.NEXT_PUBLIC_STORE_EMAIL||"hello@example.com"}`}>Contact</a><a href="#home">Back to top ↑</a></div></footer>

    <div className={`overlay ${drawer||authOpen||checkoutOpen||accountOpen?"show":""}`} onClick={()=>{setDrawer(false);setAuthOpen(false);setCheckoutOpen(false);setAccountOpen(false)}}/>
    <aside className={`side-drawer ${drawer?"open":""}`}><div className="drawer-head"><div><span className="eyebrow">YOUR SELECTION</span><h3>Your bag ({cartCount})</h3></div><button className="close-btn" onClick={()=>setDrawer(false)}>×</button></div><div className="cart-items">{cart.length?cart.map(x=><div className="cart-row" key={x.product_id}><img src={x.image_url} alt=""/><div><h4>{x.name}</h4><p>{money(x.price)}</p><div className="qty"><button onClick={()=>changeQty(x.product_id,x.quantity-1)}>−</button>{x.quantity}<button onClick={()=>changeQty(x.product_id,x.quantity+1)}>＋</button></div></div><button className="remove" onClick={()=>removeItem(x.product_id)}>×</button></div>):<p className="empty-note">Your bag is waiting for something good.</p>}</div><div className="cart-bottom"><div className="subtotal"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><p>Biaya pengiriman dikonfirmasi saat pemrosesan pesanan.</p><button className="btn btn-primary checkout" disabled={!cart.length} onClick={()=>{if(!user){setAuthOpen(true);setDrawer(false);return;}setCheckoutOpen(true);setDrawer(false);}}>Continue to checkout ↗</button></div></aside>

    {authOpen&&<div className="modal"><button className="close-btn modal-close" onClick={()=>setAuthOpen(false)}>×</button><span className="eyebrow">WELCOME TO NOCTURNE</span><h3>{authMode==="login"?"Welcome back.":"Create your account."}</h3><p className="muted">Login untuk menyimpan keranjang dan melihat pesanan.</p><form onSubmit={submitAuth} className="stack-form">{authMode==="register"&&<input placeholder="Nama lengkap" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}<input type="email" placeholder="Email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input type="password" minLength="8" placeholder="Password (minimal 8 karakter)" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button className="btn btn-primary" disabled={busy}>{busy?"Please wait...":authMode==="login"?"Login":"Register"} ↗</button></form><p className="switch-auth">{authMode==="login"?"Belum punya akun?":"Sudah punya akun?"} <button onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>{authMode==="login"?"Daftar":"Login"}</button></p></div>}

    {checkoutOpen&&<div className="modal wide-modal"><button className="close-btn modal-close" onClick={()=>setCheckoutOpen(false)}>×</button><span className="eyebrow">SECURE CHECKOUT</span><h3>Shipping details</h3><p className="muted">Lengkapi informasi pengiriman. Pembayaran pada versi ini masih simulasi/manual.</p><form className="stack-form" onSubmit={submitCheckout}><input placeholder="Nama penerima" required value={shipping.customer_name} onChange={e=>setShipping({...shipping,customer_name:e.target.value})}/><input placeholder="Nomor telepon" required value={shipping.phone} onChange={e=>setShipping({...shipping,phone:e.target.value})}/><textarea placeholder="Alamat lengkap pengiriman" required value={shipping.shipping_address} onChange={e=>setShipping({...shipping,shipping_address:e.target.value})}/><textarea placeholder="Catatan (opsional)" value={shipping.notes} onChange={e=>setShipping({...shipping,notes:e.target.value})}/><div className="subtotal"><span>Total pesanan</span><strong>{money(subtotal)}</strong></div><button className="btn btn-primary" disabled={busy}>{busy?"Memproses...":"Buat pesanan ↗"}</button></form></div>}

    {accountOpen&&<div className="modal account-modal"><button className="close-btn modal-close" onClick={()=>setAccountOpen(false)}>×</button><span className="eyebrow">YOUR NOCTURNE ACCOUNT</span><h3>Hi, {user?.name}</h3><p className="muted">{user?.email} · {user?.role}</p><div className="order-list"><h4>Riwayat pesanan</h4>{orders.length?orders.map(o=><div className="order-card" key={o.id}><div><strong>{o.order_number}</strong><small>{new Date(o.created_at).toLocaleDateString("id-ID")}</small></div><div><b>{money(o.total)}</b><small>{o.status} · {o.payment_status}</small></div></div>):<p className="muted">Belum ada pesanan.</p>}</div>{user?.role==="admin"&&<a className="btn btn-outline" href="/admin">Buka dashboard admin ↗</a>}<button className="btn btn-primary logout-btn" onClick={logout}>Logout</button></div>}
    {toast&&<div className="toast">{toast}</div>}
  </>;
}
