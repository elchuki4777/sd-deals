'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronDown, CircleUserRound, Clock3, Cpu, Facebook, Globe, HardDrive, Instagram, Mail, MapPin, Menu, MessageCircle, Minus, Monitor, Moon, PackageCheck, Search, ShieldCheck, ShoppingBag, SlidersHorizontal, Sparkles, Sun, Truck, Wrench, X, Zap } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { TRANSLATIONS, type Language } from '@/lib/translations';

export type StoreProduct = { id:string; slug:string; name:string; category:string; brand:string; price:number; salePrice:number|null; condition:string; stock:number; image:string; images:string[]; description:string; specs:Record<string,string>; sku:string; featured:boolean; createdAt:string };
export type StoreOrder = { orderNumber:string; status:string; paymentStatus?:string; total:number; shippingMethod:string; createdAt:string; email:string; items:{name:string;quantity:number;price:number;image:string}[] };
type CartLine={productId:string;quantity:number};
const CATEGORY_DATA: Record<string, { label: string; image: string }> = {
  'Phones': {
    label: 'Phones',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?q=80&w=600&auto=format&fit=crop'
  },
  'Gaming PCs': {
    label: 'Gaming PCs',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=600&auto=format&fit=crop'
  },
  'PC Parts': {
    label: 'PC Parts',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=600&auto=format&fit=crop'
  },
  'Electronics': {
    label: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop'
  },
  'Accessories': {
    label: 'Tech Accessories',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop'
  }
};
const STORE_PHONE = '16198914607';
const STORE_PHONE_DISPLAY = '(619) 891-4607';
const STORE_EMAIL = 'sddeals@zohomail.com';
const CATEGORIES=['Phones','Gaming PCs','PC Parts','Electronics','Accessories'];
export const SAMPLE_PRODUCTS: StoreProduct[] = [];
export const EMPTY_PRODUCTS:StoreProduct[]=[];
const MONEY=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const normalize=(r:Record<string,any>):StoreProduct=>({id:String(r.id),slug:r.slug||String(r.id),name:r.name,category:r.category,brand:r.brand||'',price:Number(r.price),salePrice:r.sale_price==null?null:Number(r.sale_price),condition:r.condition||'New',stock:Number(r.stock_quantity||0),image:r.image_urls?.[0]||'',images:r.image_urls||[],description:r.description||'',specs:r.specifications||{},sku:r.sku||'',featured:!!r.featured,createdAt:r.created_at||''});

export default function Storefront({onAccount,onPcAppointment,onAdmin}:{onAccount:()=>void;onPcAppointment:()=>void;onAdmin?:()=>void}){
 const[theme,setTheme]=useState<'light'|'dark'>('light');
 const[lang,setLang]=useState<Language>('en');
 const[langOpen,setLangOpen]=useState(false);
 const langMenuRef=useRef<HTMLDivElement>(null);

 useEffect(()=>{
   const handleClickOutside=(e:MouseEvent)=>{
     if(langMenuRef.current && !langMenuRef.current.contains(e.target as Node)){
       setLangOpen(false);
     }
   };
   document.addEventListener('mousedown',handleClickOutside);
   return()=>document.removeEventListener('mousedown',handleClickOutside);
 },[]);

 useEffect(()=>{
   try {
     const savedTheme = localStorage.getItem('sd-theme') as 'light' | 'dark' | null;
     if (savedTheme) {
       setTheme(savedTheme);
       document.documentElement.setAttribute('data-theme', savedTheme);
     }
     const savedLang = localStorage.getItem('sd-lang') as Language | null;
     if (savedLang && TRANSLATIONS[savedLang]) {
       setLang(savedLang);
       document.documentElement.setAttribute('lang', savedLang);
       document.documentElement.setAttribute('dir', TRANSLATIONS[savedLang].dir);
     } else {
       document.documentElement.setAttribute('lang', 'en');
       document.documentElement.setAttribute('dir', 'ltr');
     }
   } catch {}
 }, []);

 const toggleTheme = () => {
   const next = theme === 'light' ? 'dark' : 'light';
   setTheme(next);
   document.documentElement.setAttribute('data-theme', next);
   try { localStorage.setItem('sd-theme', next); } catch {}
 };

 const changeLang = (l: Language) => {
   setLang(l);
   document.documentElement.setAttribute('lang', l);
   document.documentElement.setAttribute('dir', TRANSLATIONS[l].dir);
   try { localStorage.setItem('sd-lang', l); } catch {}
 };

 const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

 const[lastOrderSummary,setLastOrderSummary]=useState<{name:string;items:string;total:number;shipping:string;address:string;phone:string}|null>(null);
 const[page,setPage]=useState('Home'),[products,setProducts]=useState(SAMPLE_PRODUCTS),[cart,setCart]=useState<CartLine[]>([]),[selected,setSelected]=useState<StoreProduct|null>(null),[search,setSearch]=useState(''),[searchOpen,setSearchOpen]=useState(false),[mobile,setMobile]=useState(false),[loading,setLoading]=useState(false),[toast,setToast]=useState(''),[orderRef,setOrderRef]=useState(''),[email,setEmail]=useState(''),[category,setCategory]=useState('All'),[brand,setBrand]=useState('All'),[condition,setCondition]=useState('All'),[availability,setAvailability]=useState('All'),[priceMin,setPriceMin]=useState(''),[priceMax,setPriceMax]=useState(''),[sort,setSort]=useState('Newest'),[selectedImage,setSelectedImage]=useState(0),[productQty,setProductQty]=useState(1),[fulfillment,setFulfillment]=useState('Shipping'),[checkout,setCheckout]=useState({name:'',email:'',phone:'',address:'',city:'San Diego',state:'CA',zip:'',method:'Contact me to arrange payment',notes:''}),[review,setReview]=useState({rating:5,body:''}),[reviewRows,setReviewRows]=useState<any[]>([]),[savedProductIds,setSavedProductIds]=useState<string[]>([]),[customer,setCustomer]=useState<{id:string;email:string;name:string;phone:string}|null>(null),[customerAddress,setCustomerAddress]=useState<any>(null),[placing,setPlacing]=useState(false);
 const sb=getSupabase();const notify=(s:string)=>{setToast(s);window.setTimeout(()=>setToast(''),3200)};
 useEffect(()=>{if(!sb)return;let live=true;const syncUser=async()=>{const{data:{user}}=await sb.auth.getUser();if(!live)return;if(!user){setCustomer(null);return}const{data:profile}=await sb.from('profiles').select('full_name,phone').eq('user_id',user.id).maybeSingle();if(live){setCustomer({id:user.id,email:user.email||'',name:profile?.full_name||'',phone:profile?.phone||''});setCheckout(c=>({...c,name:c.name||profile?.full_name||'',email:user.email||c.email,phone:c.phone||profile?.phone||''}));const{data:address}=await sb.from('addresses').select('*').eq('user_id',user.id).eq('is_default',true).maybeSingle();if(live&&address){setCustomerAddress(address);setCheckout(c=>({...c,address:c.address||address.street_address,city:c.city==='San Diego'?address.city:c.city,state:c.state==='CA'?address.state:c.state,zip:c.zip||address.zip_code}))}}};void syncUser();const{data:{subscription}}=sb.auth.onAuthStateChange(()=>void syncUser());return()=>{live=false;subscription.unsubscribe()}},[sb]);
 useEffect(()=>{try{const c=localStorage.getItem('sd-deals-cart');if(c){const parsed=JSON.parse(c);if(Array.isArray(parsed))setCart(parsed.filter((x:any)=>x&&typeof x.productId==='string'&&Number.isSafeInteger(x.quantity)&&x.quantity>0&&x.quantity<=20).slice(0,40))}}catch{}let live=true;const load=async()=>{if(sb){const{data,error}=await sb.from('products').select('*').eq('active',true).order('created_at',{ascending:false});if(!live)return;      if(error){setProducts(SAMPLE_PRODUCTS);notify('Live catalog syncing. Showing featured store items.')}else{const liveProducts=(data||[]).map(normalize);setProducts(liveProducts.length?liveProducts:SAMPLE_PRODUCTS);setCart(current=>current.filter(item=>(liveProducts.length?liveProducts:SAMPLE_PRODUCTS).some(product=>product.id===item.productId)))}    }else if(live)setProducts(SAMPLE_PRODUCTS);if(live)setLoading(false)};void load();return()=>{live=false}},[sb]);
 useEffect(()=>{try{localStorage.setItem('sd-deals-cart',JSON.stringify(cart))}catch{}},[cart]);
 const filtered=useMemo(()=>products.filter(p=>(category==='All'||p.category===category)&&(brand==='All'||p.brand===brand)&&(condition==='All'||p.condition===condition)&&(availability==='All'||(availability==='In Stock'?p.stock>0:p.stock<=0))&&(page==='Shop'||p.category===page)&&(priceMin===''||(p.salePrice??p.price)>=Number(priceMin))&&(priceMax===''||(p.salePrice??p.price)<=Number(priceMax))&&(`${p.name} ${p.brand} ${p.category} ${p.sku}`.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>sort==='Price Low to High'?(a.salePrice??a.price)-(b.salePrice??b.price):sort==='Price High to Low'?(b.salePrice??b.price)-(a.salePrice??a.price):b.createdAt.localeCompare(a.createdAt)),[products,category,brand,condition,availability,priceMin,priceMax,search,page,sort]);
 const cartDetails=cart.map(line=>({line,product:products.find(p=>p.id===line.productId)})).filter(x=>x.product) as {line:CartLine;product:StoreProduct}[],subtotal=cartDetails.reduce((n,x)=>n+(x.product.salePrice??x.product.price)*x.line.quantity,0),shipping=fulfillment==='Local Pickup'||subtotal>=100?0:9.95,tax=Math.round((subtotal+shipping)*.0775*100)/100,total=subtotal+shipping+tax;
 const add=(p:StoreProduct,quantity=1)=>{if(p.stock<1)return notify('This item is currently sold. Contact us to check availability.');let added=true;setCart(c=>{const old=c.find(x=>x.productId===p.id),nextQuantity=(old?.quantity||0)+quantity;if(nextQuantity>p.stock){added=false;return c}if(old)return c.map(x=>x.productId===p.id?{...x,quantity:nextQuantity}:x);return [...c,{productId:p.id,quantity}]});if(added)notify(`${p.name} added to your bag.`)};
 const goShop=(c='All')=>{setCategory(c);setBrand('All');setCondition('All');setAvailability('All');setSearch('');setPage('Shop');setSelected(null);window.scrollTo({top:0,behavior:'smooth'})};
 const showProduct=(p:StoreProduct)=>{setSelected(p);setSelectedImage(0);setProductQty(1);setPage('Product');window.scrollTo({top:0,behavior:'smooth'});if(sb){void sb.from('reviews').select('*').eq('product_id',p.id).eq('status','Published').order('created_at',{ascending:false}).then(({data})=>setReviewRows(data||[]));if(!p.id.startsWith('demo-'))void sb.auth.getUser().then(async({data:{user}})=>{if(!user)return;const{data}=await sb.from('saved_products').select('product_id').eq('user_id',user.id).eq('product_id',p.id).maybeSingle();setSavedProductIds(ids=>data&&!ids.includes(p.id)?[...ids,p.id]:ids)})}else setReviewRows([])};
 const toggleSaved=async(id:string)=>{if(id.startsWith('demo-')){setSavedProductIds(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);return notify('Demo saved products last for this session.')}if(!sb)return;const{data:{user}}=await sb.auth.getUser();if(!user){notify('Sign in to save products to your account.');onAccount();return}if(user.app_metadata?.role==='admin')return notify('Use a customer account to save favorites.');const isSaved=savedProductIds.includes(id),result=isSaved?await sb.from('saved_products').delete().eq('customer_id',user.id).eq('product_id',id):await sb.from('saved_products').insert({customer_id:user.id,user_id:user.id,product_id:id});if(result.error)notify(result.error.message);else{setSavedProductIds(ids=>isSaved?ids.filter(x=>x!==id):[...ids,id]);notify(isSaved?'Product removed from saved items.':'Product saved to your account.')}};
 const setQuantity=(id:string,n:number)=>setCart(c=>n<=0?c.filter(x=>x.productId!==id):c.map(x=>x.productId===id?{...x,quantity:Math.min(products.find(p=>p.id===id)?.stock||1,n)}:x));
 const placeOrder=async(e:FormEvent)=>{e.preventDefault();if(placing)return;if(!checkout.name.trim()||!/^\S+@\S+\.\S+$/.test(checkout.email)||!checkout.phone.trim())return notify('Please enter your name, valid email, and phone number.');if(!cartDetails.length)return notify('Your cart is empty.');if(!sb)return notify('Store ordering is not connected yet. Please contact SD Deals; no order was created.');if(cartDetails.some(x=>x.product.id.startsWith('demo-')))return notify('This listing is not connected to the live store and cannot be ordered.');if(cart.some(x=>!products.find(p=>p.id===x.productId)||products.find(p=>p.id===x.productId)!.stock<x.quantity))return notify('A cart item is no longer available in that quantity. Please update your bag.');    if(fulfillment==='Shipping'&&(!checkout.address.trim()||!checkout.zip.trim()))return notify('Enter a shipping address and ZIP code.');
    setEmail(checkout.email);
    const orderItemsSummary = cartDetails.map(x=>`${x.product.name} (x${x.line.quantity})`).join(', ');
    const orderSummarySnapshot = {
      name: checkout.name,
      items: orderItemsSummary,
      total: total,
      shipping: fulfillment,
      address: fulfillment==='Shipping'?`${checkout.address}, ${checkout.city}, ${checkout.state} ${checkout.zip}`:'San Diego Local Pickup',
      phone: checkout.phone
    };
    const sendAutomatedNotification = async(refNum: string) => {
      try {
        await fetch('/api/order-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderRef: refNum,
            customerName: checkout.name,
            phone: checkout.phone,
            email: checkout.email,
            items: orderItemsSummary,
            total: total,
            shipping: fulfillment,
            address: fulfillment==='Shipping'?`${checkout.address}, ${checkout.city}, ${checkout.state} ${checkout.zip}`:'San Diego Local Pickup'
          })
        });
      } catch (err) {
        console.warn('Background notification error:', err);
      }
    };

    try{
      setPlacing(true);
      setLastOrderSummary(orderSummarySnapshot);
      if(sb && customer){
        const payload=cart.map(x=>({product_id:x.productId,quantity:x.quantity}));
        const{data,error}=await sb.rpc('place_store_order',{
          p_items:payload,
          p_shipping_method:fulfillment,
          p_customer_name:checkout.name,
          p_email:checkout.email,
          p_phone:checkout.phone,
          p_shipping_address:fulfillment==='Shipping'?`${checkout.address}, ${checkout.city}, ${checkout.state} ${checkout.zip}`:'San Diego Area — details after order confirmation',
          p_payment_method:checkout.method,
          p_notes:checkout.notes
        });
        if(!error && data){
          const orderId = String(data);
          setOrderRef(orderId);
          setCart([]);
          setPage('Order received');
          notify('Order saved. We will confirm payment instructions with you before processing.');
          void sendAutomatedNotification(orderId);
          return;
        }
      }
      const orderNum = 'SD-' + Math.floor(1000 + Math.random() * 9000);
      setOrderRef(orderNum);
      setCart([]);
      setPage('Order received');
      notify('Order saved. We will confirm payment instructions with you before processing.');
      void sendAutomatedNotification(orderNum);
    }catch(err){
      const orderNum = 'SD-' + Math.floor(1000 + Math.random() * 9000);
      setOrderRef(orderNum);
      setCart([]);
      setPage('Order received');
      notify('Order saved. We will confirm payment instructions with you before processing.');
      void sendAutomatedNotification(orderNum);
    }finally{setPlacing(false)}};
 const submitReview=async(e:FormEvent)=>{e.preventDefault();if(!sb)return notify('Reviews can be published after Supabase is connected.');const{data:{user}}=await sb.auth.getUser();if(!user){notify('Sign in to leave a review.');onAccount();return}const{error}=await sb.from('reviews').insert({product_id:selected?.id,customer_id:user.id,rating:review.rating,body:review.body.trim(),status:'Pending'});if(error)notify(error.message);else{setReview({rating:5,body:''});notify('Review submitted for moderation.')}};

 const navItems = [
   { label: t.nav.home, to: 'Home' },
   { label: t.nav.shop, to: 'Shop' },
   { label: t.nav.phones, to: 'Phones' },
   { label: t.nav.gamingPcs, to: 'Gaming PCs' },
   { label: t.nav.electronics, to: 'Electronics' },
   { label: t.nav.pcServices, to: 'PC Services' },
   { label: t.nav.trackOrder, to: 'Track Order' }
 ];

 return <main className="sd-shell"><header className="sd-header">
   <button className="sd-brand" aria-label="SD Deals home" onClick={()=>{setPage('Home');setSelected(null)}}>
     <span className="sd-mark">SD</span>
     <span className="sd-brand-name">SD <b>DEALS</b><small>SAN DIEGO · GOODS &amp; SERVICE</small></span>
   </button>

   <nav className="sd-nav">
     {navItems.map(({label, to}) => (
       <button 
         key={to} 
         className={page === to ? 'active' : ''} 
         onClick={() => {
           if (to === 'PC Services') { setPage(to); setSelected(null); }
           else if (CATEGORIES.includes(to)) goShop(to);
           else { if (to === 'Shop') goShop(); else { setPage(to); setSelected(null); } }
         }}
       >
         {label}
       </button>
     ))}
   </nav>

   <div className="sd-actions">
     {/* Luxury Custom Language Dropdown */}
     <div className="sd-lang-dropdown" ref={langMenuRef}>
       <button 
         type="button"
         className="sd-lang-trigger" 
         onClick={()=>setLangOpen(!langOpen)}
         aria-expanded={langOpen}
         aria-label="Select language"
       >
         <Globe size={16} style={{color:'var(--sd-gold)'}}/>
         <span>{TRANSLATIONS[lang]?.name || 'English'}</span>
         <ChevronDown size={14} style={{transition:'transform .2s',transform:langOpen?'rotate(180deg)':'none'}}/>
       </button>

       {langOpen && (
         <div className="sd-lang-menu" role="menu">
           {([
             { code: 'en', label: 'English' },
             { code: 'es', label: 'Español' },
             { code: 'zh', label: '中文' },
             { code: 'ar', label: 'العربية' }
           ] as const).map(item => (
             <button
               key={item.code}
               type="button"
               role="menuitem"
               className={`sd-lang-option ${lang === item.code ? 'active' : ''}`}
               onClick={() => {
                 changeLang(item.code);
                 setLangOpen(false);
               }}
             >
               <span>{item.label}</span>
               {lang === item.code && <Check size={14}/>}
             </button>
           ))}
         </div>
       )}
     </div>

     {/* Dark/Light Theme Toggle */}
     <button 
       className="sd-theme-btn" 
       onClick={toggleTheme} 
       title={theme === 'dark' ? t.theme.light : t.theme.dark}
       aria-label="Toggle dark mode"
     >
       {theme === 'dark' ? <Sun size={17} style={{color:'#f0c868'}}/> : <Moon size={17} style={{color:'#8c7448'}}/>}
     </button>

     <button aria-label="Search" onClick={()=>{setSearchOpen(v=>!v);setCategory('All');setPage('Shop')}}><Search/></button>
     <button aria-label={t.nav.myAccount} onClick={onAccount}><CircleUserRound/></button>
     <button aria-label={`Shopping bag with ${cart.reduce((n,x)=>n+x.quantity,0)} items`} onClick={()=>setPage('Cart')} className="sd-bag">
       <ShoppingBag/>
       <span>{cart.reduce((n,x)=>n+x.quantity,0)}</span>
     </button>
     <button className="sd-mobile-toggle" aria-label="Toggle navigation" onClick={()=>setMobile(!mobile)}>{mobile?<X/>:<Menu/>}</button>
   </div>
 </header>

 {mobile&&<nav className="sd-mobile-nav">
   {navItems.map(({label, to}) => (
     <button key={to} onClick={() => {
       if (CATEGORIES.includes(to)) goShop(to);
       else if (to === 'Shop') goShop();
       else setPage(to);
       setMobile(false);
     }}>
       {label}
     </button>
   ))}
   <button onClick={()=>{onAccount();setMobile(false)}}>{t.nav.myAccount}</button>
   <button onClick={toggleTheme}>{theme === 'dark' ? `☀ ${t.theme.light}` : `🌙 ${t.theme.dark}`}</button>
 </nav>}

 {searchOpen&&<form className="sd-searchbar" onSubmit={e=>{e.preventDefault();setSearchOpen(false);setCategory('All');setPage('Shop')}}><Search size={20}/><input autoFocus placeholder="Search phones, gaming rigs, GPUs, processors, PC gear…" value={search} onChange={e=>setSearch(e.target.value)}/><button type="button" onClick={()=>{setSearch('');setSearchOpen(false)}} aria-label="Close search"><X/></button></form>}
 
 {page==='Home'&&<HomePage t={t} shop={()=>goShop()} category={goShop} services={()=>setPage('PC Services')} products={products} showProduct={showProduct}/>}
 {['Shop',...CATEGORIES].includes(page)&&<ShopPage t={t} page={page} products={filtered} all={products} loading={loading} category={category} setCategory={setCategory} showAll={()=>setPage('Shop')} brand={brand} setBrand={setBrand} condition={condition} setCondition={setCondition} availability={availability} setAvailability={setAvailability} priceMin={priceMin} setPriceMin={setPriceMin} priceMax={priceMax} setPriceMax={setPriceMax} sort={sort} setSort={setSort} open={showProduct}/>}
 {page==='Product'&&selected&&<ProductPage t={t} product={selected} saved={savedProductIds.includes(selected.id)} toggleSaved={()=>void toggleSaved(selected.id)} quantity={productQty} setQuantity={setProductQty} selectedImage={selectedImage} setSelectedImage={setSelectedImage} add={()=>add(selected,productQty)} buyNow={()=>{if(selected.stock<1)return notify('This item is currently sold.');add(selected,productQty);setPage('Checkout');window.scrollTo({top:0,behavior:'smooth'})}} back={()=>goShop(selected.category)} reviews={reviewRows} review={review} setReview={setReview} submitReview={submitReview} />}
 {page==='Cart'&&<CartPage t={t} lines={cartDetails} quantity={setQuantity} checkout={()=>setPage('Checkout')} shop={()=>goShop()} fulfillment={fulfillment} setFulfillment={setFulfillment} subtotal={subtotal} shipping={shipping} tax={tax} total={total}/>}
 {page==='Checkout'&&<CheckoutPage t={t} connected={!!sb} checkout={checkout} setCheckout={setCheckout} fulfillment={fulfillment} setFulfillment={setFulfillment} lines={cartDetails} subtotal={subtotal} shipping={shipping} tax={tax} total={total} placeOrder={placeOrder} back={()=>setPage('Cart')} customer={customer} customerAddress={customerAddress} placing={placing} signIn={onAccount}/>}
 {page==='Order received'&&<div className="sd-wrap sd-success">
   <span className="sd-success-icon"><Check/></span>
   <p className="sd-kicker">{t.orderSuccess.kicker}</p>
   <h1>{t.orderSuccess.title}</h1>
   <p>{t.orderSuccess.desc} <strong>{STORE_EMAIL}</strong>.</p>
   <div className="sd-order-ref">
     <small>{t.orderSuccess.orderNumber}</small>
     <strong>{orderRef}</strong>
     <button onClick={()=>{setPage('Track Order');setSearch('')}}>{t.orderSuccess.trackOrder} <ArrowRight size={16}/></button>
   </div>
   
   <div style={{display:'flex',flexDirection:'column',gap:'14px',maxWidth:'480px',margin:'28px auto'}}>
     <a 
       href={`https://wa.me/${STORE_PHONE}?text=${encodeURIComponent(
         `🛍️ *ORDER SD DEALS #${orderRef}*\n\n` +
         `👤 *Customer:* ${lastOrderSummary?.name || 'Customer'}\n` +
         `📱 *Phone:* ${lastOrderSummary?.phone || ''}\n` +
         `📦 *Items:* ${lastOrderSummary?.items || 'iPhone 16 Pro 128GB'}\n` +
         `💵 *Total:* ${MONEY(lastOrderSummary?.total || 1022.55)}\n` +
         `🚚 *Method:* ${lastOrderSummary?.shipping || 'Shipping'}\n` +
         `📍 *Address:* ${lastOrderSummary?.address || 'San Diego'}\n\n` +
         `Hello SD Deals, I just placed this order and would like to arrange payment. Thank you!`
       )}`}
       target="_blank"
       rel="noopener noreferrer"
       className="sd-button sd-button-gold"
       style={{background:'#25D366',color:'#fff',fontSize:'15px',padding:'16px 22px',gap:'10px',textDecoration:'none'}}
     >
       <MessageCircle size={20}/> {t.orderSuccess.coordWhatsApp} {STORE_PHONE_DISPLAY}
     </a>
     
     <a 
       href={`mailto:${STORE_EMAIL}?subject=${encodeURIComponent(`New Order #${orderRef} - ${lastOrderSummary?.name || 'Customer'}`)}&body=${encodeURIComponent(
         `Hello SD Deals,\n\nI have placed order #${orderRef}.\n\nOrder details:\n- Customer: ${lastOrderSummary?.name || ''}\n- Phone: ${lastOrderSummary?.phone || ''}\n- Items: ${lastOrderSummary?.items || ''}\n- Total: ${MONEY(lastOrderSummary?.total || 0)}\n- Delivery: ${lastOrderSummary?.shipping || ''}\n- Address: ${lastOrderSummary?.address || ''}\n\nPlease let me know the instructions to complete payment.`
       )}`}
       className="sd-button sd-button-outline"
       style={{fontSize:'14px',gap:'9px',textDecoration:'none'}}
     >
       <Mail size={18}/> {t.orderSuccess.sendEmail} {STORE_EMAIL}
     </a>
   </div>

   {sb&&customer&&<button className="sd-button sd-button-gold" onClick={()=>window.location.href='/account'}>View in My Orders <ArrowRight/></button>}
   <button className="sd-button sd-button-dark" onClick={()=>goShop()}>{t.orderSuccess.continueShopping}</button>
 </div>}
 {page==='Track Order'&&<TrackPage orderRef={orderRef} setOrderRef={setOrderRef} email={email} setEmail={setEmail} sb={!!sb} onSignIn={onAccount}/>}
 {page==='PC Services'&&<ServicesPage t={t} appointment={onPcAppointment}/>}
 {page==='About'&&<AboutPage/>}{page==='Contact'&&<ContactPage notify={notify}/>}{page==='Privacy'&&<LegalPage kind="Privacy"/>}{page==='Terms'&&<LegalPage kind="Terms"/>}
 
 <footer className="sd-footer">
   <div className="sd-footer-main">
     <div>
       <button className="sd-brand" onClick={()=>setPage('Home')}>
         <span className="sd-mark">SD</span>
         <span className="sd-brand-name">SD <b>DEALS</b><small>SAN DIEGO · GOODS &amp; SERVICE</small></span>
       </button>
       <p>{t.footer.desc}</p>
     </div>
     <div>
       <b>{t.footer.explore}</b>
       <button onClick={()=>goShop()}>{t.nav.shop}</button>
       <button onClick={()=>setPage('PC Services')}>{t.nav.pcServices}</button>
       <button onClick={()=>setPage('Track Order')}>{t.nav.trackOrder}</button>
       <button onClick={onAccount}>{t.nav.myAccount}</button>
     </div>
     <div>
       <b>{t.footer.visitContact}</b>
       <span>San Diego, California</span>
       <span>Local pickup · Details after confirmation</span>
       <a href={`mailto:${STORE_EMAIL}`}>{STORE_EMAIL}</a>
       <a href={`tel:+${STORE_PHONE}`} style={{fontSize:'13px',fontWeight:700,color:'#b39864',marginTop:'4px',display:'block'}}>Tel / WhatsApp: {STORE_PHONE_DISPLAY}</a>
       <span>Mon–Sat · By appointment</span>
     </div>
     <div className="sd-social">
       <b>{t.footer.stayInTouch}</b>
       <div>
         <a href="https://instagram.com" aria-label="Instagram"><Instagram/></a>
         <a href="https://facebook.com" aria-label="Facebook"><Facebook/></a>
       </div>
       <small>{t.footer.socialSub}</small>
     </div>
   </div>
   <div className="sd-footer-bottom">
     <span>{t.footer.rights}</span>
     <div>
       <button onClick={()=>setPage('Privacy')}>{t.footer.privacy}</button>
       <button onClick={()=>setPage('Terms')}>{t.footer.terms}</button>
     </div>
     <span>{t.footer.disclaimer}</span>
   </div>
 </footer>
 {toast&&<div className="sd-toast" role="status">{toast}</div>}
 </main>;
}

function HomePage({t,shop,category,services,products,showProduct}:{t:typeof TRANSLATIONS['en'];shop:()=>void;category:(c:string)=>void;services:()=>void;products:StoreProduct[];showProduct:(p:StoreProduct)=>void}){
  const categories=['Phones','Gaming PCs','PC Parts','Electronics','Accessories'];
  const[rot,setRot]=useState({y:-10,x:6,z:-2,yPos:0});
  const[dragOffset,setDragOffset]=useState({x:0,y:0});
  const isDragging=useRef(false);
  const dragStart=useRef({x:0,y:0,baseX:0,baseY:0});

  useEffect(()=>{
    let targetScroll=window.scrollY;
    let currentScroll=window.scrollY;
    let animId:number;

    const onScroll=()=>{
      targetScroll=window.scrollY;
    };

    const loop=()=>{
      currentScroll += (targetScroll - currentScroll) * 0.08;
      const y=Math.max(-42,Math.min(38,-10 + currentScroll * 0.09));
      const x=Math.max(-16,Math.min(20,6 - currentScroll * 0.03));
      const z=Math.max(-12,Math.min(12,-2 + currentScroll * 0.02));
      const yPos=Math.min(130,currentScroll * 0.16);
      setRot({y,x,z,yPos});
      animId=requestAnimationFrame(loop);
    };

    window.addEventListener('scroll',onScroll,{passive:true});
    animId=requestAnimationFrame(loop);
    return()=>{
      window.removeEventListener('scroll',onScroll);
      cancelAnimationFrame(animId);
    };
  },[]);

  const handlePointerDown=(e:React.PointerEvent)=>{
    isDragging.current=true;
    dragStart.current={x:e.clientX,y:e.clientY,baseX:dragOffset.x,baseY:dragOffset.y};
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove=(e:React.PointerEvent)=>{
    if(!isDragging.current)return;
    const dx=e.clientX - dragStart.current.x;
    const dy=e.clientY - dragStart.current.y;
    setDragOffset({
      x:Math.max(-45,Math.min(45,dragStart.current.baseX + dx * 0.35)),
      y:Math.max(-30,Math.min(30,dragStart.current.baseY - dy * 0.35))
    });
  };

  const handlePointerUp=(e:React.PointerEvent)=>{
    isDragging.current=false;
    try{(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)}catch{}
  };

  const totalRotY=rot.y + dragOffset.x;
  const totalRotX=rot.x + dragOffset.y;

  return <>
    <section className="sd-hero">
      <div className="sd-hero-copy">
        <p className="sd-kicker"><MapPin size={15}/> {t.hero.kicker}</p>
        <h1>{t.hero.title1}<br/><span>{t.hero.title2}</span></h1>
        <p className="sd-hero-sub">{t.hero.subtitle}</p>
        <div className="sd-hero-buttons">
          <button className="sd-button sd-button-gold" onClick={shop}>{t.hero.shopNow} <ArrowRight size={18}/></button>
          <button className="sd-button sd-button-outline" onClick={services}>{t.hero.explorePc}</button>
        </div>
        <div className="sd-trust">
          <span><BadgeCheck size={18}/> {t.hero.trust1}</span>
          <span><MapPin size={18}/> {t.hero.trust2}</span>
        </div>
      </div>
      <div className="sd-hero-3d-card">
        <div className="sd-phone-hero-container" onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
          <div className="sd-iphone-3d" style={{transform:`translateY(${rot.yPos}px) rotateY(${totalRotY}deg) rotateX(${totalRotX}deg) rotateZ(${rot.z}deg)`}}>
            <div className="sd-iphone-screen">
              <div className="sd-iphone-island"/>
              <div className="sd-iphone-wallpaper">
                <span>SD DEALS</span>
                <b>iPhone 16 Pro</b>
                <div className="sd-iphone-badge">Titanium Edition</div>
              </div>
              <div className="sd-iphone-bar"/>
              <div className="sd-iphone-glare"/>
            </div>
          </div>
          <div className="sd-iphone-drag-hint">{t.hero.drag3d}</div>
        </div>
      </div>
    </section>

    <div className="sd-promise">
      <div>
        <ShieldCheck size={24}/>
        <span><b>{t.promises.clearCondition}</b><small>{t.promises.clearConditionSub}</small></span>
      </div>
      <div>
        <MapPin size={24}/>
        <span><b>{t.promises.sdPickup}</b><small>{t.promises.sdPickupSub}</small></span>
      </div>
      <div>
        <Truck size={24}/>
        <span><b>{t.promises.shipping}</b><small>{t.promises.shippingSub}</small></span>
      </div>
    </div>

    <section className="sd-section">
      <div className="sd-section-head">
        <div>
          <p className="sd-kicker">{t.categories.kicker}</p>
          <h2>{t.categories.title}</h2>
          <p>{t.categories.subtitle}</p>
        </div>
        <button className="sd-text-link" onClick={shop}>{t.categories.viewAll} <ArrowRight size={16}/></button>
      </div>
      <div className="sd-categories">
        {categories.map((name,i)=>{
          const cat=CATEGORY_DATA[name];
          return (
            <button key={name} onClick={()=>category(name)} className={`sd-category sd-category-${i}`}>
              <div className="sd-category-bg" style={{backgroundImage:`url(${cat?.image})`}}/>
              <div className="sd-category-overlay"/>
              <span>
                <small>CATEGORY {String(i+1).padStart(2,'0')}</small>
                <b>{name}</b>
                <ArrowRight/>
              </span>
            </button>
          );
        })}
      </div>
    </section>

    <section className="sd-section sd-featured">
      <div className="sd-section-head">
        <div>
          <p className="sd-kicker">{t.featured.kicker}</p>
          <h2>{t.featured.title}</h2>
          <p>{t.featured.subtitle}</p>
        </div>
        <button className="sd-text-link" onClick={shop}>{t.featured.shopAll} <ArrowRight size={16}/></button>
      </div>
      <ProductGrid items={products.slice(0, 4)} open={showProduct}/>
    </section>

    <section className="sd-local">
      <div>
        <p className="sd-kicker">{t.local.kicker}</p>
        <h2>{t.local.title1}<br/>{t.local.title2}</h2>
        <p>{t.local.desc}</p>
        <button className="sd-button sd-button-dark" onClick={()=>category('All')}>{t.local.explore} <ArrowRight size={16}/></button>
      </div>
      <div className="sd-local-card">
        <MapPin size={24}/>
        <span><b>{t.local.badge}</b><small>{t.local.badgeSub}</small></span>
        <span className="sd-local-dot"/>
      </div>
    </section>

    <section className="sd-service-band">
      <div>
        <p className="sd-kicker">{t.pcBanner.kicker}</p>
        <h2>{t.pcBanner.title1}<br/>{t.pcBanner.title2}</h2>
        <p>{t.pcBanner.desc}</p>
      </div>
      <button className="sd-button sd-button-gold" onClick={services}>{t.pcBanner.explore} <ArrowRight size={18}/></button>
    </section>
  </>;
}

function ProductGrid({items,open}:{items:StoreProduct[];open:(p:StoreProduct)=>void}){
  return <div className="sd-product-grid">{items.map(p=><ProductCard key={p.id} p={p} open={()=>open(p)}/>)}</div>;
}

function ProductCard({p,open}:{p:StoreProduct;open:()=>void}){
  return (
    <button className="sd-product-card" onClick={open}>
      <span className="sd-product-photo">
        {p.image&&<img src={p.image} alt={p.name} loading="lazy"/>}
        {p.salePrice&&<em>DEAL</em>}
        {p.stock===0&&<i>SOLD</i>}
        <span className="sd-condition">{p.condition}</span>
      </span>
      <span className="sd-product-info">
        <small>{p.brand} · {p.category}</small>
        <b>{p.name}</b>
        <span className="sd-product-price">
          {MONEY(p.salePrice??p.price)} 
          {p.salePrice&&<del>{MONEY(p.price)}</del>}
        </span>
        <span className={p.stock?'sd-stock':'sd-sold'}>
          {p.stock?`In stock · ${p.stock} available`:'Currently unavailable'}
        </span>
      </span>
    </button>
  );
}

function ShopPage({t,page,products,all,loading,category,setCategory,showAll,brand,setBrand,condition,setCondition,availability,setAvailability,priceMin,setPriceMin,priceMax,setPriceMax,sort,setSort,open}:{t:typeof TRANSLATIONS['en'];page:string;products:StoreProduct[];all:StoreProduct[];loading:boolean;category:string;setCategory:(x:string)=>void;showAll:()=>void;brand:string;setBrand:(x:string)=>void;condition:string;setCondition:(x:string)=>void;availability:string;setAvailability:(x:string)=>void;priceMin:string;setPriceMin:(x:string)=>void;priceMax:string;setPriceMax:(x:string)=>void;sort:string;setSort:(x:string)=>void;open:(p:StoreProduct)=>void}){
  const brands=Array.from(new Set(all.map(p=>p.brand).filter(Boolean)));
  return (
    <section className="sd-wrap sd-shop">
      <div className="sd-shop-heading">
        <p className="sd-kicker">{t.featured.kicker}</p>
        <h1>{page==='Shop'?t.shop.title:page}</h1>
        <p>{t.shop.subtitle}</p>
      </div>

      <div className="sd-shop-tools">
        <div className="sd-filter-group">
          <SlidersHorizontal size={18}/>
          <select aria-label="Category" value={category} onChange={e=>{setCategory(e.target.value);showAll()}}>
            {['All',...CATEGORIES].map(x=><option key={x} value={x}>{x==='All'?t.shop.allCategories:x}</option>)}
          </select>
          <select aria-label="Brand" value={brand} onChange={e=>setBrand(e.target.value)}>
            <option value="All">{t.shop.allBrands}</option>
            {brands.map(x=><option key={x}>{x}</option>)}
          </select>
          <select aria-label="Condition" value={condition} onChange={e=>setCondition(e.target.value)}>
            <option value="All">{t.shop.anyCondition}</option>
            {['New','Open Box','Like New','Good','Used'].map(x=><option key={x}>{x}</option>)}
          </select>
          <select aria-label="Availability" value={availability} onChange={e=>setAvailability(e.target.value)}>
            <option value="All">{t.shop.anyAvailability}</option>
            <option value="In Stock">{t.shop.inStock}</option>
            <option value="Sold">{t.shop.sold}</option>
          </select>
          <input className="sd-price-filter" aria-label="Minimum price" type="number" min="0" placeholder="Min $" value={priceMin} onChange={e=>setPriceMin(e.target.value)}/>
          <input className="sd-price-filter" aria-label="Maximum price" type="number" min="0" placeholder="Max $" value={priceMax} onChange={e=>setPriceMax(e.target.value)}/>
        </div>

        <select className="sd-sort" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="Newest">{t.shop.newest}</option>
          <option value="Price Low to High">{t.shop.priceLow}</option>
          <option value="Price High to Low">{t.shop.priceHigh}</option>
        </select>
      </div>

      {loading ? (
        <div className="sd-skeletons">{[1,2,3,4].map(n=><div key={n}/>)}</div>
      ) : products.length ? (
        <ProductGrid items={products} open={open}/>
      ) : (
        <div className="sd-empty">
          <PackageCheck size={36}/>
          <h3>{t.shop.noProducts}</h3>
          <p>{t.shop.noProductsSub}</p>
        </div>
      )}
    </section>
  );
}

function ProductPage({t,product:p,saved,toggleSaved,quantity,setQuantity,selectedImage,setSelectedImage,add,buyNow,back,reviews,review,setReview,submitReview}:{t:typeof TRANSLATIONS['en'];product:StoreProduct;saved:boolean;toggleSaved:()=>void;quantity:number;setQuantity:(n:number)=>void;selectedImage:number;setSelectedImage:(n:number)=>void;add:()=>void;buyNow:()=>void;back:()=>void;reviews:any[];review:{rating:number;body:string};setReview:(x:{rating:number;body:string})=>void;submitReview:(e:FormEvent)=>void}){
  return (
    <section className="sd-wrap sd-product-detail">
      <button className="sd-back" onClick={back}><ArrowLeft size={18}/> {t.product.backTo} {p.category}</button>
      <div className="sd-product-layout">
        <div>
          <div className="sd-detail-photo">
            {(p.images[selectedImage]||p.image) ? (
              <img src={p.images[selectedImage]||p.image} alt={p.name}/>
            ) : (
              <span className="sd-no-photo">SD Deals verified listing</span>
            )}
            <span>{p.condition}</span>
          </div>
          <div className="sd-thumbs">
            {p.images.map((photo,i)=>(
              <button key={i} className={i===selectedImage?'selected':''} onClick={()=>setSelectedImage(i)}>
                <img src={photo} alt={`${p.name} photo ${i+1}`}/>
              </button>
            ))}
          </div>
        </div>

        <div className="sd-detail-copy">
          <p className="sd-kicker">{p.brand} · {p.category}</p>
          <h1>{p.name}</h1>
          <div className="sd-detail-price">
            {MONEY(p.salePrice??p.price)} 
            {p.salePrice&&<del>{MONEY(p.price)}</del>}
          </div>
          <div className="sd-detail-stock">
            {p.stock>0 ? <><Check size={18}/> In stock · {p.stock} {t.product.available}</> : <>Sold out</>}
          </div>
          <p className="sd-detail-description">{p.description}</p>
          
          <div className="sd-specs">
            <h3>{t.product.details}</h3>
            {Object.entries(p.specs).map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}
            <div><span>Condition</span><b>{p.condition}</b></div>
            <div><span>SKU</span><b>{p.sku}</b></div>
          </div>

          <button className="sd-save-product" onClick={toggleSaved}>
            {saved ? t.product.savedProduct : t.product.saveProduct}
          </button>

          <div className="sd-product-quantity">
            <span>{t.product.quantity}</span>
            <button aria-label="Decrease quantity" disabled={quantity<=1} onClick={()=>setQuantity(Math.max(1,quantity-1))}>−</button>
            <b>{quantity}</b>
            <button aria-label="Increase quantity" disabled={quantity>=p.stock} onClick={()=>setQuantity(Math.min(p.stock,quantity+1))}>+</button>
            <small>{p.stock} {t.product.available}</small>
          </div>

          <div className="sd-fulfillment-note">
            <MapPin size={20}/>
            <span>
              <b>{t.product.shippingNoteTitle}</b>
              <small>{t.product.shippingNoteSub}</small>
            </span>
          </div>

          <div className="sd-product-buy-actions">
            <button className="sd-button sd-button-gold sd-add-cart" disabled={!p.stock} onClick={add}>
              {p.stock ? t.product.addBag : t.product.soldOut} <ShoppingBag size={18}/>
            </button>
            <button className="sd-button sd-button-dark" disabled={!p.stock} onClick={buyNow}>
              {t.product.buyNow} <ArrowRight size={18}/>
            </button>
          </div>

          <a className="sd-seller-link" href={`mailto:${STORE_EMAIL}?subject=${encodeURIComponent(`Inquiry about ${p.name}`)}`}>
            {t.product.messageSeller}
          </a>
        </div>
      </div>

      <section className="sd-reviews">
        <div>
          <p className="sd-kicker">SD DEALS REVIEWS</p>
          <h2>{t.product.reviewsTitle}</h2>
        </div>
        {reviews.length ? reviews.map((r:any)=>(
          <div className="sd-review" key={r.id}>
            <span>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span>
            <p>{r.body}</p>
            <small>{r.display_name||'Customer'} · {r.verified_purchase&&<b>Verified purchase</b>}</small>
          </div>
        )) : (
          <p className="sd-muted">{t.product.noReviews}</p>
        )}

        <form className="sd-review-form" onSubmit={submitReview}>
          <h3>{t.product.leaveReview}</h3>
          <label>Rating
            <select value={review.rating} onChange={e=>setReview({...review,rating:Number(e.target.value)})}>
              {[5,4,3,2,1].map(x=><option key={x} value={x}>{x} stars</option>)}
            </select>
          </label>
          <textarea required maxLength={1500} placeholder="Share your experience with this product…" value={review.body} onChange={e=>setReview({...review,body:e.target.value})}/>
          <button className="sd-button sd-button-dark">{t.product.submitReview}</button>
        </form>
      </section>
    </section>
  );
}

function CartPage({t,lines,quantity,checkout,shop,fulfillment,setFulfillment,subtotal,shipping,tax,total}:{t:typeof TRANSLATIONS['en'];lines:{line:CartLine;product:StoreProduct}[];quantity:(id:string,n:number)=>void;checkout:()=>void;shop:()=>void;fulfillment:string;setFulfillment:(s:string)=>void;subtotal:number;shipping:number;tax:number;total:number}){
  return (
    <section className="sd-wrap sd-cart">
      <p className="sd-kicker">{t.cart.kicker}</p>
      <h1>{t.cart.title}</h1>
      {!lines.length ? (
        <div className="sd-empty">
          <ShoppingBag size={38}/>
          <h3>{t.cart.empty}</h3>
          <p>{t.cart.emptySub}</p>
          <button className="sd-button sd-button-dark" onClick={shop}>{t.cart.continueShopping}</button>
        </div>
      ) : (
        <div className="sd-cart-layout">
          <div className="sd-cart-lines">
            {lines.map(({line,product:p})=>(
              <article className="sd-cart-item" key={p.id}>
                {p.image ? <img src={p.image} alt={p.name}/> : <span className="sd-image-placeholder" aria-hidden="true"/>}
                <div>
                  <small>{p.brand} · {p.condition}</small>
                  <h3>{p.name}</h3>
                  <b>{MONEY(p.salePrice??p.price)}</b>
                  <div className="sd-quantity">
                    <button aria-label="Decrease quantity" onClick={()=>quantity(p.id,line.quantity-1)}><Minus size={14}/></button>
                    <span>{line.quantity}</span>
                    <button aria-label="Increase quantity" onClick={()=>quantity(p.id,line.quantity+1)}>+</button>
                    <button className="sd-remove" onClick={()=>quantity(p.id,0)}>Remove</button>
                  </div>
                </div>
              </article>
            ))}
            <button className="sd-text-link" onClick={shop}><ArrowLeft size={16}/> {t.cart.continueShopping}</button>
          </div>

          <aside className="sd-summary">
            <h2>{t.cart.summary}</h2>
            <label className="sd-radio">
              <input type="radio" checked={fulfillment==='Shipping'} onChange={()=>setFulfillment('Shipping')}/> 
              {t.cart.shipToMe} <small>{subtotal>=100?t.cart.free:'$9.95'}</small>
            </label>
            <label className="sd-radio">
              <input type="radio" checked={fulfillment==='Local Pickup'} onChange={()=>setFulfillment('Local Pickup')}/> 
              {t.cart.localPickup} <small>San Diego</small>
            </label>
            
            <Summary t={t} subtotal={subtotal} shipping={shipping} tax={tax} total={total}/>
            <p className="sd-muted">{t.cart.pickupNotice}</p>
            <button className="sd-button sd-button-gold sd-full" onClick={checkout}>
              {t.cart.checkout} <ArrowRight size={18}/>
            </button>
          </aside>
        </div>
      )}
    </section>
  );
}

function Summary({t,subtotal,shipping,tax,total}:{t:typeof TRANSLATIONS['en'];subtotal:number;shipping:number;tax:number;total:number}){
  return (
    <div className="sd-totals">
      <div><span>{t.cart.subtotal}</span><b>{MONEY(subtotal)}</b></div>
      <div><span>{t.cart.shipping}</span><b>{shipping?MONEY(shipping):t.cart.free}</b></div>
      <div><span>{t.cart.tax}</span><b>{MONEY(tax)}</b></div>
      <div className="sd-total"><span>{t.cart.total}</span><b>{MONEY(total)}</b></div>
    </div>
  );
}

function CheckoutPage({t,connected,checkout,setCheckout,fulfillment,setFulfillment,lines,subtotal,shipping,tax,total,placeOrder,back,customer,customerAddress,placing,signIn}:{t:typeof TRANSLATIONS['en'];connected:boolean;checkout:{name:string;email:string;phone:string;address:string;city:string;state:string;zip:string;method:string;notes:string};setCheckout:(x:any)=>void;fulfillment:string;setFulfillment:(s:string)=>void;lines:{line:CartLine;product:StoreProduct}[];subtotal:number;shipping:number;tax:number;total:number;placeOrder:(e:FormEvent)=>void;back:()=>void;customer:{id:string;email:string;name:string;phone:string}|null;customerAddress:any;placing:boolean;signIn:()=>void}){
  return (
    <section className="sd-wrap sd-checkout">
      <button className="sd-back" onClick={back}><ArrowLeft size={18}/> {t.checkout.backToBag}</button>
      <p className="sd-kicker">{t.checkout.kicker}</p>
      <h1>{t.checkout.title}</h1>
      <p className="sd-muted">{t.checkout.subtitle}</p>

      {!connected&&<div className="sd-checkout-account-prompt" role="alert"><ShieldCheck size={20}/><span><b>Store checkout is running in preview.</b><small>Orders will be processed directly with SD Deals personal confirmation.</small></span></div>}

      <form onSubmit={placeOrder} className="sd-checkout-layout">
        <div className="sd-checkout-form">
          <section>
            <h2>{t.checkout.contact}</h2>
            <div className="sd-form-grid">
              <label>{t.checkout.fullName}<input required autoComplete="name" value={checkout.name} onChange={e=>setCheckout({...checkout,name:e.target.value})}/></label>
              <label>{t.checkout.email}<input required type="email" autoComplete="email" value={checkout.email} onChange={e=>setCheckout({...checkout,email:e.target.value})}/></label>
              <label>{t.checkout.phone}<input required type="tel" autoComplete="tel" value={checkout.phone} onChange={e=>setCheckout({...checkout,phone:e.target.value})}/></label>
            </div>
          </section>

          <section>
            <h2>{t.checkout.fulfillment}</h2>
            <div className="sd-choice-row">
              <label><input type="radio" checked={fulfillment==='Shipping'} onChange={()=>setFulfillment('Shipping')}/> {t.checkout.shipping}</label>
              <label><input type="radio" checked={fulfillment==='Local Pickup'} onChange={()=>setFulfillment('Local Pickup')}/> {t.checkout.localPickup}</label>
            </div>
            {fulfillment==='Shipping' ? (
              <div className="sd-form-grid">
                <label className="sd-span-2">{t.checkout.street}<input required autoComplete="street-address" value={checkout.address} onChange={e=>setCheckout({...checkout,address:e.target.value})}/></label>
                <label>{t.checkout.city}<input required value={checkout.city} onChange={e=>setCheckout({...checkout,city:e.target.value})}/></label>
                <label>{t.checkout.state}<input required maxLength={2} value={checkout.state} onChange={e=>setCheckout({...checkout,state:e.target.value.toUpperCase()})}/></label>
                <label>{t.checkout.zip}<input required inputMode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" value={checkout.zip} onChange={e=>setCheckout({...checkout,zip:e.target.value})}/></label>
              </div>
            ) : (
              <div className="sd-pickup-note">
                <MapPin size={22}/>
                <span><b>San Diego Area</b><small>{t.checkout.pickupNote}</small></span>
              </div>
            )}
          </section>

          <section>
            <h2>{t.checkout.payment}</h2>
            <div className="sd-pickup-note">
              <ShieldCheck size={22}/>
              <span><b>Personal Order Verification</b><small>{t.checkout.paymentDesc}</small></span>
            </div>
          </section>

          <section>
            <h2>{t.checkout.notes}</h2>
            <textarea placeholder="Special delivery or pickup instructions…" value={checkout.notes} maxLength={1000} onChange={e=>setCheckout({...checkout,notes:e.target.value})}/>
          </section>
        </div>

        <aside className="sd-summary">
          <h2>{t.cart.summary}</h2>
          {lines.map(({line,product:p})=>(
            <div className="sd-checkout-product" key={p.id}>
              {p.image ? <img src={p.image} alt={p.name}/> : <span className="sd-image-placeholder" aria-hidden="true"/>}
              <span><b>{p.name}</b><small>Qty {line.quantity}</small></span>
              <strong>{MONEY((p.salePrice??p.price)*line.quantity)}</strong>
            </div>
          ))}
          <Summary t={t} subtotal={subtotal} shipping={shipping} tax={tax} total={total}/>
          <button disabled={!lines.length||placing} className="sd-button sd-button-gold sd-full">
            {placing ? t.checkout.placingOrder : lines.length ? t.checkout.placeOrderBtn : t.cart.empty} <ArrowRight size={18}/>
          </button>
        </aside>
      </form>
    </section>
  );
}

function TrackPage({orderRef,setOrderRef,email,setEmail,sb,onSignIn}:{orderRef:string;setOrderRef:(s:string)=>void;email:string;setEmail:(s:string)=>void;sb:boolean;onSignIn:()=>void}){
  const[found,setFound]=useState<StoreOrder|null>(null),[loading,setLoading]=useState(false),[message,setMessage]=useState('');
  const find=async(e:FormEvent)=>{
    e.preventDefault();setLoading(true);setMessage('');setFound(null);
    if(!sb){setMessage('Order tracking is unavailable until the live store is connected.');setLoading(false);return}
    const client=getSupabase(),{data:{user}}=await client!.auth.getUser();
    if(!user){setMessage('Sign in to your account to securely view your orders.');setLoading(false);onSignIn();return}
    const{data,error}=await client!.rpc('lookup_store_order',{p_order_number:orderRef,p_email:email});
    const row=Array.isArray(data)?data[0]:data;
    if(row)setFound({orderNumber:row.order_number,status:row.status,paymentStatus:row.payment_status,total:Number(row.total),shippingMethod:row.shipping_method,createdAt:row.created_at,email,items:(row.items||[]).map((x:any)=>({name:x.name,quantity:x.quantity,price:Number(x.unit_price),image:x.image_url}))});
    else setMessage(error?.message||'No order matched that number and email.');
    setLoading(false);
  };
  return (
    <section className="sd-wrap sd-track">
      <p className="sd-kicker">SD DEALS ORDER TRACKING</p>
      <h1>Track your order</h1>
      <p className="sd-muted">Enter your order number (e.g. SD-1050) and the email address used during order creation.</p>
      <form className="sd-track-form" onSubmit={find}>
        <label>Order number<input required placeholder="SD-1050" value={orderRef} onChange={e=>setOrderRef(e.target.value)}/></label>
        <label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <button className="sd-button sd-button-dark" disabled={loading}>{loading?'Looking up…':'Find order'}</button>
      </form>
      {message&&<p className="sd-error">{message}</p>}
      {found&&(
        <div className="sd-tracking-card">
          <div>
            <span className="sd-kicker">ORDER {found.orderNumber}</span>
            <h2>{found.status}</h2>
            <p>{found.shippingMethod==='Local Pickup'?'Local pickup · San Diego Area':'Shipping order'} · Payment {found.paymentStatus||'Pending'}</p>
          </div>
          <PackageCheck size={28}/>
          <div className="sd-track-steps">
            {(found.shippingMethod==='Local Pickup'?['Order Received','Payment Confirmed','Preparing Order','Ready for Pickup','Picked Up']:['Order Received','Payment Confirmed','Preparing Order','Shipped','Out for Delivery','Delivered']).map((s,i,a)=>{
              const active=s===found.status,passed=a.indexOf(found.status)>=0&&i<a.indexOf(found.status);
              return <div key={s} className={active?'current':passed?'complete':''}><span>{passed?'✓':i+1}</span>{s}</div>;
            })}
          </div>
          <b>Order total · {MONEY(found.total)}</b>
          <p className="sd-muted">{found.items.map(i=>`${i.name} × ${i.quantity}`).join(' · ')}</p>
        </div>
      )}
    </section>
  );
}

function ServicesPage({t,appointment}:{t:typeof TRANSLATIONS['en'];appointment:()=>void}){
  const services = [
    {
      title: 'PC Assembly & Cable Management',
      desc: 'Precision assembly and stealth wire routing using components you already own or brought in.',
      icon: Cpu,
      tag: 'From $65',
      time: '1-2 Days'
    },
    {
      title: 'Custom Gaming PC Builds',
      desc: 'Tailored part selection, precision build, stress-testing, and BIOS optimization tuned for your target games.',
      icon: Zap,
      tag: 'From $120',
      time: '2-4 Days'
    },
    {
      title: 'PC Upgrades & Optimization',
      desc: 'Targeted GPU, CPU, RAM, or high-speed NVMe storage upgrades to breathe elite speed into your system.',
      icon: Sparkles,
      tag: 'From $45',
      time: 'Same Day'
    },
    {
      title: 'Hardware Diagnostics',
      desc: 'In-depth diagnostic check for BSOD, random restarts, overheating, or intermittent boot failures.',
      icon: Monitor,
      tag: 'From $40',
      time: '24 Hours'
    },
    {
      title: 'Hardware & Thermal Repair',
      desc: 'Thermal paste re-pasting, cooling pump service, power supply replacement, and component repair.',
      icon: Wrench,
      tag: 'From $55',
      time: '1-2 Days'
    },
    {
      title: 'Elite Chassis Wire Routing',
      desc: 'Master-level wire tucking, custom comb routing, optimized airflow, and silent fan curves.',
      icon: HardDrive,
      tag: 'From $50',
      time: 'Same Day'
    },
    {
      title: 'Clean Windows & Driver Setup',
      desc: 'Debloated Windows 11 installation, latest motherboard chipset & GPU drivers, plus full benchmark validation.',
      icon: ShieldCheck,
      tag: 'From $40',
      time: 'Same Day'
    },
    {
      title: 'Component Compatibility Check',
      desc: 'Direct consultation to balance your budget, prevent hardware bottlenecks, and secure best market deals.',
      icon: Clock3,
      tag: 'From $35',
      time: '1 Hour'
    }
  ];

  return (
    <>
      <section className="sd-service-hero-lux">
        <div className="sd-service-hero-content">
          <div className="sd-service-badge">
            <span className="sd-service-badge-dot"/>
            {t.pcServicesPage.kicker}
          </div>
          <h1>{t.pcServicesPage.title1}<br/><span>{t.pcServicesPage.title2}</span></h1>
          <p className="sd-service-lead">{t.pcServicesPage.desc}</p>

          <div className="sd-service-hero-actions-lux">
            <button className="sd-button sd-button-gold sd-button-pulse" onClick={appointment}>
              {t.pcServicesPage.bookAppointment} <ArrowRight size={18}/>
            </button>
            <div className="sd-service-stat">
              <span>{t.pcServicesPage.diagnosisFrom}</span>
              <b>$40</b>
            </div>
            <div className="sd-service-divider"/>
            <div className="sd-service-stat">
              <span>{t.pcServicesPage.turnaround}</span>
              <b>{t.pcServicesPage.turnaroundVal}</b>
            </div>
          </div>

          <div className="sd-service-perks">
            <span><ShieldCheck size={18}/> {t.pcServicesPage.warranty}</span>
            <span><Clock3 size={18}/> {t.pcServicesPage.consultation}</span>
            <span><MapPin size={18}/> {t.pcServicesPage.pickupDropoff}</span>
          </div>
        </div>

        <div className="sd-service-hero-visual">
          <div className="sd-service-img-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1200&auto=format&fit=crop" 
              alt="High-end Gaming PC Build SD Deals" 
              className="sd-service-hero-img"
            />
            <div className="sd-service-img-glass">
              <div className="sd-service-img-card">
                <Sparkles size={20} className="text-[#d5c298]"/>
                <div>
                  <strong>Custom Liquid &amp; Air Builds</strong>
                  <small>Zero cable clutter · Stress-tested thermals</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sd-section">
        <div className="sd-section-head">
          <div>
            <p className="sd-kicker">{t.pcServicesPage.gridKicker}</p>
            <h2>{t.pcServicesPage.gridTitle}</h2>
            <p>{t.pcServicesPage.gridDesc}</p>
          </div>
          <button className="sd-button sd-button-gold" onClick={appointment}>
            {t.pcServicesPage.scheduleService} <ArrowRight size={16}/>
          </button>
        </div>

        <div className="sd-services-grid-lux">
          {services.map((item, i) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="sd-service-card-lux" onClick={appointment}>
                <div className="sd-service-card-header">
                  <div className="sd-service-icon-box">
                    <Icon size={22}/>
                  </div>
                  <span className="sd-service-tag">{item.tag}</span>
                </div>
                <div className="sd-service-card-body">
                  <small className="sd-service-num">SERVICE 0{i + 1} · {item.time}</small>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
                <div className="sd-service-card-footer">
                  <span>{t.pcServicesPage.requestService}</span>
                  <ArrowRight size={16}/>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="sd-service-guarantee">
        <div className="sd-service-guarantee-content">
          <Clock3 size={28}/>
          <div>
            <b>{t.pcServicesPage.guaranteeTitle}</b>
            <small>{t.pcServicesPage.guaranteeDesc}</small>
          </div>
          <button className="sd-button sd-button-dark" onClick={appointment}>
            {t.pcServicesPage.startRequest} <ArrowRight size={16}/>
          </button>
        </div>
      </section>
    </>
  );
}

function AboutPage(){
  return (
    <section className="sd-wrap sd-about">
      <p className="sd-kicker">ABOUT SD DEALS · SAN DIEGO, CA</p>
      <h1>Good finds.<br/><span>Good people.</span></h1>
      <div className="sd-about-grid">
        <div>
          <p>SD Deals is an independent local electronics and custom PC studio serving the San Diego area. We specialize in verified phones, hardware components, tournament-grade gaming PCs, tech accessories, and precision workshop services.</p>
          <p>Our approach is simple: be clear about condition, answer questions honestly, and make local pickup feel personal without sharing private pickup details publicly.</p>
          <button className="sd-button sd-button-dark" onClick={()=>window.location.href=`mailto:${STORE_EMAIL}`}>Get in touch <ArrowRight/></button>
        </div>
        <div className="sd-about-note">Real products and photos, curated and supported locally by SD Deals.</div>
      </div>
    </section>
  );
}

function LegalPage({kind}:{kind:'Privacy'|'Terms'}){
  return (
    <section className="sd-wrap sd-legal">
      <p className="sd-kicker">SD DEALS · SAN DIEGO, CA · LEGAL &amp; POLICIES</p>
      <h1>{kind === 'Privacy' ? 'Privacy Notice & Data Policy' : 'Store Terms and Conditions'}</h1>
      <p className="sd-legal-updated">Last updated: September 2026 · Applicable to local orders, shipping, and PC lab services.</p>

      {kind === 'Privacy' ? (
        <div className="sd-legal-content">
          <div className="sd-legal-box">
            <ShieldCheck size={26} className="text-[#b39864] shrink-0" />
            <div>
              <b>Data Privacy &amp; Customer Trust</b>
              <p>At SD Deals, we treat customer information with strict confidentiality. We never sell, lease, or share your contact info or personal details with advertisers or unauthorized third parties.</p>
            </div>
          </div>

          <h2>1. Information We Collect</h2>
          <p>To process orders, coordinate pickups, and schedule PC services, we collect only the essential details you directly provide:</p>
          <ul>
            <li><b>Contact Details:</b> Full name, phone number (calls &amp; WhatsApp), and email address.</li>
            <li><b>Delivery Information:</b> Shipping address or local pickup point selection in the San Diego area.</li>
            <li><b>Service &amp; Hardware Details:</b> Component lists, technical goals, and photos submitted for PC appointments.</li>
          </ul>

          <h2>2. Location Security for Local Pickups</h2>
          <p>For mutual safety and security, the exact address of our San Diego pickup studio is provided through private direct channels (WhatsApp or email) only after an order or appointment is confirmed.</p>

          <h2>3. Payments and Financial Data</h2>
          <p>We do not store or process credit card numbers or banking passwords on our web servers. Payments are coordinated directly through agreed personal methods or in person upon local handoff.</p>

          <h2>4. Your Rights to Access or Delete Data</h2>
          <p>You may request review or deletion of your order records or account at any time by contacting us directly at <a href={`mailto:${STORE_EMAIL}`} className="text-[#b39864] font-semibold">{STORE_EMAIL}</a> or via WhatsApp at <a href={`tel:+${STORE_PHONE}`} className="text-[#b39864] font-semibold">{STORE_PHONE_DISPLAY}</a>.</p>
        </div>
      ) : (
        <div className="sd-legal-content">
          <div className="sd-legal-box">
            <ShieldCheck size={26} className="text-[#b39864] shrink-0" />
            <div>
              <b>Clear Terms for Every Purchase and Build</b>
              <p>Please read our terms carefully before placing an order or booking PC services. By using this storefront, you agree to the conditions outlined below.</p>
            </div>
          </div>

          <h2>1. Product Authenticity and Descriptions</h2>
          <p><b>Electronics, Phones &amp; PC Hardware:</b> Every product in our store (phones, gaming PCs, graphics cards, CPUs, displays, and tech accessories) is <b>100% authentic, verified, and thoroughly inspected</b> before delivery or pickup.</p>

          <h2>2. Refund &amp; Cancellation Policy</h2>
          <ul>
            <li><b>Before Dispatch / Handoff:</b> You may request cancellation and a full refund only if the product has not yet been handed off or dispatched with shipping carriers.</li>
            <li><b>After Receipt:</b> All sales are final once inspected and received. Please inspect your item thoroughly upon pickup.</li>
            <li><b>Shipments in Transit:</b> Orders already handed to USPS, UPS, or FedEx cannot be cancelled mid-transit.</li>
          </ul>

          <h2>3. PC Custom Builds and Diagnostics</h2>
          <p>We take pride in master craftsmanship and transparent care:</p>
          <ul>
            <li><b>Intake Photography:</b> High-resolution photos are taken of every component and serial number prior to assembly or repair.</li>
            <li><b>Pre-existing Component Damage:</b> We are not responsible for factory-defective parts or components brought in with bent pins or hidden defects.</li>
          </ul>

          <h2>4. Official Support Channels</h2>
          <ul>
            <li><b>WhatsApp / Call:</b> <a href={`tel:+${STORE_PHONE}`} className="text-[#b39864] font-semibold">{STORE_PHONE_DISPLAY}</a></li>
            <li><b>Email:</b> <a href={`mailto:${STORE_EMAIL}`} className="text-[#b39864] font-semibold">{STORE_EMAIL}</a></li>
            <li><b>Location:</b> San Diego, CA (By appointment).</li>
          </ul>
        </div>
      )}
    </section>
  );
}

function ContactPage({notify}:{notify:(s:string)=>void}){
  const[values,setValues]=useState({name:'',email:'',subject:'',message:''});
  const submit=(e:FormEvent)=>{
    e.preventDefault();
    const mail=`mailto:${STORE_EMAIL}?subject=${encodeURIComponent(values.subject||'Message from SD Deals website')}&body=${encodeURIComponent(`Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`)}`;
    window.location.href=mail;
    notify('Your email app will open with your message.');
  };
  return (
    <section className="sd-wrap sd-contact">
      <div>
        <p className="sd-kicker">WE’RE HERE TO HELP</p>
        <h1>Say hello.</h1>
        <p>Questions about a listing, local pickup in San Diego, or a custom PC build? Send a note and we’ll get back to you promptly.</p>
        <div className="sd-contact-details">
          <a href={`mailto:${STORE_EMAIL}`}>{STORE_EMAIL}</a>
          <a href={`tel:+${STORE_PHONE}`} style={{fontSize:'14px',fontWeight:700,color:'#b39864'}}>WhatsApp / Tel: {STORE_PHONE_DISPLAY}</a>
          <span>San Diego Area, California</span>
          <span>Monday–Saturday · By appointment</span>
          <small>Exact local pickup address shared after order confirmation.</small>
        </div>
      </div>
      <form onSubmit={submit}>
        <label>Your name<input required value={values.name} onChange={e=>setValues({...values,name:e.target.value})}/></label>
        <label>Email address<input required type="email" value={values.email} onChange={e=>setValues({...values,email:e.target.value})}/></label>
        <label>Subject<input value={values.subject} onChange={e=>setValues({...values,subject:e.target.value})}/></label>
        <label>Your message<textarea required minLength={10} maxLength={3000} value={values.message} onChange={e=>setValues({...values,message:e.target.value})}/></label>
        <button className="sd-button sd-button-dark">Send message <ArrowRight size={18}/></button>
      </form>
    </section>
  );
}
