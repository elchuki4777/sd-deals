export type Language = 'en' | 'es' | 'zh' | 'ar';

export interface TranslationSchema {
  dir: 'ltr' | 'rtl';
  name: string;
  code: Language;
  nav: {
    home: string;
    shop: string;
    phones: string;
    gamingPcs: string;
    electronics: string;
    pcServices: string;
    trackOrder: string;
    myAccount: string;
  };
  hero: {
    kicker: string;
    title1: string;
    title2: string;
    subtitle: string;
    shopNow: string;
    explorePc: string;
    trust1: string;
    trust2: string;
    drag3d: string;
  };
  promises: {
    clearCondition: string;
    clearConditionSub: string;
    sdPickup: string;
    sdPickupSub: string;
    shipping: string;
    shippingSub: string;
  };
  categories: {
    kicker: string;
    title: string;
    subtitle: string;
    viewAll: string;
  };
  featured: {
    kicker: string;
    title: string;
    subtitle: string;
    shopAll: string;
  };
  local: {
    kicker: string;
    title1: string;
    title2: string;
    desc: string;
    explore: string;
    badge: string;
    badgeSub: string;
  };
  pcBanner: {
    kicker: string;
    title1: string;
    title2: string;
    desc: string;
    explore: string;
  };
  footer: {
    desc: string;
    explore: string;
    visitContact: string;
    stayInTouch: string;
    socialSub: string;
    rights: string;
    privacy: string;
    terms: string;
    disclaimer: string;
  };
  pcServicesPage: {
    kicker: string;
    title1: string;
    title2: string;
    desc: string;
    bookAppointment: string;
    diagnosisFrom: string;
    turnaround: string;
    turnaroundVal: string;
    warranty: string;
    consultation: string;
    pickupDropoff: string;
    gridKicker: string;
    gridTitle: string;
    gridDesc: string;
    scheduleService: string;
    requestService: string;
    guaranteeTitle: string;
    guaranteeDesc: string;
    startRequest: string;
  };
  shop: {
    title: string;
    subtitle: string;
    allCategories: string;
    allBrands: string;
    anyCondition: string;
    anyAvailability: string;
    inStock: string;
    sold: string;
    newest: string;
    priceLow: string;
    priceHigh: string;
    noProducts: string;
    noProductsSub: string;
  };
  product: {
    backTo: string;
    details: string;
    quantity: string;
    available: string;
    addBag: string;
    buyNow: string;
    soldOut: string;
    saveProduct: string;
    savedProduct: string;
    shippingNoteTitle: string;
    shippingNoteSub: string;
    messageSeller: string;
    reviewsTitle: string;
    reviewsSub: string;
    noReviews: string;
    leaveReview: string;
    submitReview: string;
  };
  cart: {
    title: string;
    kicker: string;
    empty: string;
    emptySub: string;
    continueShopping: string;
    summary: string;
    shipToMe: string;
    localPickup: string;
    free: string;
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    checkout: string;
    pickupNotice: string;
  };
  checkout: {
    title: string;
    kicker: string;
    subtitle: string;
    backToBag: string;
    contact: string;
    fullName: string;
    email: string;
    phone: string;
    fulfillment: string;
    shipping: string;
    localPickup: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    payment: string;
    paymentDesc: string;
    placeOrderBtn: string;
    placingOrder: string;
    notes: string;
    pickupNote: string;
  };
  orderSuccess: {
    title: string;
    kicker: string;
    desc: string;
    orderNumber: string;
    trackOrder: string;
    coordWhatsApp: string;
    sendEmail: string;
    continueShopping: string;
  };
  theme: {
    dark: string;
    light: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationSchema> = {
  en: {
    dir: 'ltr',
    name: 'English',
    code: 'en',
    nav: {
      home: 'Home',
      shop: 'Shop',
      phones: 'Phones',
      gamingPcs: 'Gaming PCs',
      electronics: 'Electronics',
      pcServices: 'PC Services',
      trackOrder: 'Track Order',
      myAccount: 'My Account'
    },
    hero: {
      kicker: 'INDEPENDENT · SAN DIEGO, CALIFORNIA',
      title1: 'Great Products.',
      title2: 'Better Deals.',
      subtitle: 'Phones, gaming computers, PC components, and custom hardware services. Curated locally in San Diego, priced honestly.',
      shopNow: 'Shop Now',
      explorePc: 'Explore PC Services',
      trust1: 'Real products from our local store',
      trust2: 'San Diego pickup available',
      drag3d: '✦ Drag to rotate in 3D'
    },
    promises: {
      clearCondition: 'Clear condition, no guesswork',
      clearConditionSub: 'Every listing describes what you will actually receive.',
      sdPickup: 'San Diego pickup available',
      sdPickupSub: 'Exact pickup details shared after confirmation.',
      shipping: 'Shipping on select items',
      shippingSub: 'Choose your preferred handoff at checkout.'
    },
    categories: {
      kicker: 'FIND YOUR NEXT FAVORITE',
      title: 'Shop by category',
      subtitle: 'Browse genuine products added by SD Deals.',
      viewAll: 'View all products'
    },
    featured: {
      kicker: 'THE SD DEALS COLLECTION',
      title: 'Featured Products',
      subtitle: 'Real verified inventory available for San Diego pickup or shipping.',
      shopAll: 'Shop all products'
    },
    local: {
      kicker: 'A LOCAL STORE, A REAL PERSON',
      title1: 'Shopping online.',
      title2: 'Rooted in San Diego.',
      desc: 'Buy online for shipping or local pickup. For pickup, we share the exact handoff details only after your order is confirmed.',
      explore: 'Explore the store',
      badge: 'San Diego Area',
      badgeSub: 'Local pickup · Details provided after confirmation'
    },
    pcBanner: {
      kicker: 'HAVE A PC THAT NEEDS A HAND?',
      title1: 'Thoughtful PC help,',
      title2: 'from first part to final test.',
      desc: 'Custom builds, upgrades and repairs—quoted clearly and approved before work begins.',
      explore: 'Explore PC services'
    },
    footer: {
      desc: 'Good finds, honest descriptions, and local PC expertise—right here in San Diego.',
      explore: 'Explore',
      visitContact: 'Visit & contact',
      stayInTouch: 'Stay in touch',
      socialSub: 'Follow SD Deals official updates.',
      rights: '© 2026 SD DEALS · SAN DIEGO, CA',
      privacy: 'Privacy',
      terms: 'Terms',
      disclaimer: 'Orders are confirmed by SD Deals; online payment arranged upon confirmation.'
    },
    pcServicesPage: {
      kicker: 'SD DEALS · SAN DIEGO CUSTOM PC LAB',
      title1: 'Custom PC Building',
      title2: '& Precision Repair.',
      desc: 'From tournament-tier gaming rigs to precision hardware repairs, get direct master craftsmanship in San Diego.',
      bookAppointment: 'Book PC Appointment',
      diagnosisFrom: 'BENCH DIAGNOSIS FROM',
      turnaround: 'TURNAROUND',
      turnaroundVal: 'Same / Next Day',
      warranty: '90-Day Build Warranty',
      consultation: 'Free Consultation Check',
      pickupDropoff: 'San Diego Drop-off & Pickup',
      gridKicker: 'EXPERT CRAFTSMANSHIP · NO SHORTCUTS',
      gridTitle: 'PC Services & Solutions',
      gridDesc: 'Every appointment begins with a personal review. No parts ordered and no charges without your upfront approval.',
      scheduleService: 'Schedule a service',
      requestService: 'Request this service',
      guaranteeTitle: 'All appointments start as Pending Approval.',
      guaranteeDesc: 'We personally review your component list, schedule, and goals before confirming your appointment. No surprises.',
      startRequest: 'Start request'
    },
    shop: {
      title: 'Shop All Products',
      subtitle: 'Products and verified gear from SD Deals. Honest pricing with local pickup or shipping.',
      allCategories: 'All categories',
      allBrands: 'All brands',
      anyCondition: 'Any condition',
      anyAvailability: 'Any availability',
      inStock: 'In Stock',
      sold: 'Sold',
      newest: 'Newest first',
      priceLow: 'Price: Low to High',
      priceHigh: 'Price: High to Low',
      noProducts: 'No products found',
      noProductsSub: 'Try adjusting your filters or search keywords.'
    },
    product: {
      backTo: 'Back to',
      details: 'Product details',
      quantity: 'Quantity',
      available: 'available',
      addBag: 'Add to bag',
      buyNow: 'Buy now',
      soldOut: 'Sold out',
      saveProduct: '♡ Save product',
      savedProduct: '♥ Saved product',
      shippingNoteTitle: 'Shipping or local pickup',
      shippingNoteSub: 'San Diego Area. Exact pickup details are provided after your order is confirmed.',
      messageSeller: 'Message seller about this item',
      reviewsTitle: 'Customer reviews',
      reviewsSub: 'Genuine reviews from verified customers.',
      noReviews: 'No reviews yet for this product.',
      leaveReview: 'Leave a review',
      submitReview: 'Submit review'
    },
    cart: {
      title: 'Shopping bag',
      kicker: 'YOUR SELECTION',
      empty: 'Your bag is empty.',
      emptySub: 'Discover great finds, electronics, and PC deals.',
      continueShopping: 'Continue shopping',
      summary: 'Order summary',
      shipToMe: 'Ship to me',
      localPickup: 'Local pickup (San Diego)',
      free: 'Free',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      tax: 'Estimated sales tax',
      total: 'Total',
      checkout: 'Proceed to checkout',
      pickupNotice: 'Pickup instructions and payment details are confirmed after you place the order. No charge is made now.'
    },
    checkout: {
      title: 'Checkout',
      kicker: 'A FEW MORE DETAILS',
      subtitle: 'Place your order now; SD Deals will confirm availability and coordinate payment with you.',
      backToBag: 'Back to bag',
      contact: 'Contact Information',
      fullName: 'Full name',
      email: 'Email address',
      phone: 'Phone number',
      fulfillment: 'Fulfillment Method',
      shipping: 'Shipping',
      localPickup: 'Local pickup (San Diego)',
      street: 'Street address',
      city: 'City',
      state: 'State',
      zip: 'ZIP code',
      payment: 'Payment Arrangement',
      paymentDesc: 'Payment is confirmed personally upon order review. We will contact you directly to arrange convenient payment.',
      placeOrderBtn: 'Place order',
      placingOrder: 'Submitting order…',
      notes: 'Order notes (optional)',
      pickupNote: 'San Diego Area. Exact pickup location shared privately after confirmation.'
    },
    orderSuccess: {
      title: 'Your order is confirmed!',
      kicker: 'THANK YOU FOR SHOPPING LOCAL',
      desc: 'Your order has been recorded. Official confirmation and instructions will be sent from',
      orderNumber: 'ORDER NUMBER',
      trackOrder: 'Track order',
      coordWhatsApp: 'Coordinate payment on WhatsApp',
      sendEmail: 'Send email to',
      continueShopping: 'Continue shopping'
    },
    theme: {
      dark: 'Dark mode',
      light: 'Light mode'
    }
  },
  es: {
    dir: 'ltr',
    name: 'Español',
    code: 'es',
    nav: {
      home: 'Inicio',
      shop: 'Tienda',
      phones: 'Teléfonos',
      gamingPcs: 'PCs Gaming',
      electronics: 'Electrónica',
      pcServices: 'Servicios PC',
      trackOrder: 'Rastrear Orden',
      myAccount: 'Mi Cuenta'
    },
    hero: {
      kicker: 'INDEPENDIENTE · SAN DIEGO, CALIFORNIA',
      title1: 'Grandes Productos.',
      title2: 'Mejores Ofertas.',
      subtitle: 'Teléfonos, computadoras gaming, componentes de PC y ensamble personalizado de hardware. Curado localmente en San Diego.',
      shopNow: 'Comprar Ahora',
      explorePc: 'Ver Servicios PC',
      trust1: 'Inventario real desde nuestra tienda local',
      trust2: 'Entrega local disponible en San Diego',
      drag3d: '✦ Arrastra para girar en 3D'
    },
    promises: {
      clearCondition: 'Condición clara y transparente',
      clearConditionSub: 'Cada publicación describe exactamente lo que vas a recibir.',
      sdPickup: 'Retiro en San Diego disponible',
      sdPickupSub: 'Detalles exactos de recogida compartidos tras confirmación.',
      shipping: 'Envíos en artículos seleccionados',
      shippingSub: 'Elige tu entrega preferida al tramitar el pedido.'
    },
    categories: {
      kicker: 'DESCUBRE TU FAVORITO',
      title: 'Explorar por Categoría',
      subtitle: 'Catálogo de artículos verificados por SD Deals.',
      viewAll: 'Ver todos los productos'
    },
    featured: {
      kicker: 'COLECCIÓN SD DEALS',
      title: 'Productos Destacados',
      subtitle: 'Inventario real verificado para retiro en San Diego o despacho.',
      shopAll: 'Ver catálogo completo'
    },
    local: {
      kicker: 'UNA TIENDA LOCAL, UNA PERSONA REAL',
      title1: 'Compras en línea.',
      title2: 'Con base en San Diego.',
      desc: 'Compra online con envío o retiro local. Para retiros, compartimos la dirección privada tras confirmar tu orden.',
      explore: 'Explorar tienda',
      badge: 'Área de San Diego',
      badgeSub: 'Retiro local · Detalles compartidos tras confirmación'
    },
    pcBanner: {
      kicker: '¿TU PC NECESITA MANO EXPERTA?',
      title1: 'Cuidado técnico dedicado,',
      title2: 'desde la primera pieza hasta la prueba final.',
      desc: 'Armado a medida, upgrades y reparaciones con cotización previa clara y aprobación obligatoria.',
      explore: 'Explorar servicios de PC'
    },
    footer: {
      desc: 'Buenos hallazgos, descripciones honestas y soporte técnico de PC aquí en San Diego.',
      explore: 'Explorar',
      visitContact: 'Contacto y Visita',
      stayInTouch: 'Mantente en Contacto',
      socialSub: 'Sigue las novedades de SD Deals.',
      rights: '© 2026 SD DEALS · SAN DIEGO, CA',
      privacy: 'Privacidad',
      terms: 'Términos',
      disclaimer: 'Las órdenes son confirmadas personalmente; pago coordinado al acordar.'
    },
    pcServicesPage: {
      kicker: 'SD DEALS · LABORATORIO PC EN SAN DIEGO',
      title1: 'Armado Personalizado',
      title2: '& Reparación de Precisión.',
      desc: 'Desde rigs gaming de torneo hasta reparaciones electrónicas, obtén mano de obra maestra en San Diego.',
      bookAppointment: 'Agendar Cita de PC',
      diagnosisFrom: 'DIAGNÓSTICO DESDE',
      turnaround: 'TIEMPO DE ENTREGA',
      turnaroundVal: 'Mismo Día / Siguiente Día',
      warranty: 'Garantía de Ensamble de 90 Días',
      consultation: 'Revisión y Consulta Gratis',
      pickupDropoff: 'Recepción y Entrega en San Diego',
      gridKicker: 'MANO DE OBRA EXPERTA · SIN ATAJOS',
      gridTitle: 'Servicios de PC y Soluciones',
      gridDesc: 'Cada cita comienza con una revisión personal. No se compran partes ni se cobra sin tu visto bueno.',
      scheduleService: 'Agendar servicio',
      requestService: 'Solicitar este servicio',
      guaranteeTitle: 'Toda solicitud inicia como Pendiente de Aprobación.',
      guaranteeDesc: 'Revisamos tu lista de componentes, horarios y metas antes de confirmar la cita. Cero sorpresas.',
      startRequest: 'Iniciar solicitud'
    },
    shop: {
      title: 'Todos los Productos',
      subtitle: 'Inventario real y verificado por SD Deals. Precios honestos con retiro en San Diego o envío.',
      allCategories: 'Todas las categorías',
      allBrands: 'Todas las marcas',
      anyCondition: 'Cualquier condición',
      anyAvailability: 'Cualquier disponibilidad',
      inStock: 'En stock',
      sold: 'Agotado',
      newest: 'Más recientes',
      priceLow: 'Precio: Menor a Mayor',
      priceHigh: 'Precio: Mayor a Menor',
      noProducts: 'No se encontraron productos',
      noProductsSub: 'Intenta ajustar los filtros de búsqueda.'
    },
    product: {
      backTo: 'Volver a',
      details: 'Detalles del producto',
      quantity: 'Cantidad',
      available: 'disponibles',
      addBag: 'Añadir a la bolsa',
      buyNow: 'Comprar ahora',
      soldOut: 'Agotado',
      saveProduct: '♡ Guardar producto',
      savedProduct: '♥ Producto guardado',
      shippingNoteTitle: 'Envío o retiro local',
      shippingNoteSub: 'Área de San Diego. La dirección de entrega se comparte tras confirmar tu orden.',
      messageSeller: 'Consultar al vendedor sobre este artículo',
      reviewsTitle: 'Opiniones de clientes',
      reviewsSub: 'Reseñas reales de compradores verificados.',
      noReviews: 'Sin opiniones todavía para este artículo.',
      leaveReview: 'Dejar una reseña',
      submitReview: 'Enviar reseña'
    },
    cart: {
      title: 'Bolsa de compras',
      kicker: 'TU SELECCIÓN',
      empty: 'Tu bolsa está vacía.',
      emptySub: 'Descubre grandes ofertas en electrónicos, teléfonos y servicios de PC.',
      continueShopping: 'Continuar comprando',
      summary: 'Resumen del pedido',
      shipToMe: 'Enviar a domicilio',
      localPickup: 'Retiro local (San Diego)',
      free: 'Gratis',
      subtotal: 'Subtotal',
      shipping: 'Envío',
      tax: 'Impuestos estimados',
      total: 'Total',
      checkout: 'Continuar al pago',
      pickupNotice: 'Las instrucciones de retiro y pago se acuerdan tras confirmar la orden. No se cobra nada online ahora.'
    },
    checkout: {
      title: 'Finalizar Compra',
      kicker: 'DATOS DE LA ORDEN',
      subtitle: 'Registra tu orden ahora; SD Deals confirmará el stock y coordinará el pago directamente contigo.',
      backToBag: 'Volver a la bolsa',
      contact: 'Información de Contacto',
      fullName: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Número de teléfono',
      fulfillment: 'Método de Entrega',
      shipping: 'Envío',
      localPickup: 'Retiro local (San Diego)',
      street: 'Dirección física',
      city: 'Ciudad',
      state: 'Estado',
      zip: 'Código Postal',
      payment: 'Forma de Pago',
      paymentDesc: 'El pago se confirma de manera personal tras revisar tu orden. Nos contactaremos directamente contigo.',
      placeOrderBtn: 'Confirmar pedido',
      placingOrder: 'Procesando pedido…',
      notes: 'Notas adicionales (opcional)',
      pickupNote: 'Área de San Diego. La dirección exacta se comparte por mensaje privado tras confirmar la orden.'
    },
    orderSuccess: {
      title: '¡Tu orden ha sido registrada!',
      kicker: 'GRACIAS POR COMPRAR LOCAL',
      desc: 'Tu pedido ha sido guardado exitosamente. La confirmación y recibo se envían desde',
      orderNumber: 'NÚMERO DE ORDEN',
      trackOrder: 'Rastrear orden',
      coordWhatsApp: 'Coordinar pago por WhatsApp',
      sendEmail: 'Enviar correo a',
      continueShopping: 'Continuar comprando'
    },
    theme: {
      dark: 'Modo oscuro',
      light: 'Modo claro'
    }
  },
  zh: {
    dir: 'ltr',
    name: '中文',
    code: 'zh',
    nav: {
      home: '首页',
      shop: '商店',
      phones: '手机',
      gamingPcs: '电竞电脑',
      electronics: '电子数码',
      pcServices: '电脑服务',
      trackOrder: '追踪订单',
      myAccount: '我的账户'
    },
    hero: {
      kicker: '加州圣地亚哥 · 独立品牌',
      title1: '优质商品。',
      title2: '超值实惠。',
      subtitle: '手机数码、电竞整机、电脑硬件以及专业装机与维修服务。本地直供，诚信定价。',
      shopNow: '立即选购',
      explorePc: '浏览电脑服务',
      trust1: '本地实体精选现货',
      trust2: '支持圣地亚哥本地自提',
      drag3d: '✦ 拖动鼠标旋转3D视角'
    },
    promises: {
      clearCondition: '成色透明，真实拍摄',
      clearConditionSub: '详细说明每件商品的实际成色和配件。',
      sdPickup: '圣地亚哥本地自提',
      sdPickupSub: '订单确认后私信发送安全自提具体地址。',
      shipping: '精选商品安全邮寄',
      shippingSub: '结账时可自由选择邮寄或本地交接。'
    },
    categories: {
      kicker: '挑选您的心仪好物',
      title: '按分类选购',
      subtitle: '浏览由 SD Deals 亲自审核的优质好货。',
      viewAll: '查看全部商品'
    },
    featured: {
      kicker: 'SD DEALS 精选专区',
      title: '热门推荐',
      subtitle: '现货正品库存，支持圣地亚哥自提或快递发货。',
      shopAll: '查看所有现货'
    },
    local: {
      kicker: '本地经营，真诚待人',
      title1: '便捷在线选购。',
      title2: '扎根圣地亚哥。',
      desc: '支持在线邮寄或本地提货。为保护双方隐私与安全，自提详细地址将在订单确认后提供。',
      explore: '进店选购',
      badge: '圣地亚哥地区',
      badgeSub: '本地自提 · 订单确认后发地址'
    },
    pcBanner: {
      kicker: '电脑需要装配或维护？',
      title1: '精心装机与调优，',
      title2: '从选件到烤机严格测试。',
      desc: '整机定制组装、硬件升级和故障维修。价格透明，开工前必须经您确认。',
      explore: '了解电脑服务'
    },
    footer: {
      desc: '真实好物，透明描述，圣地亚哥专业电脑定制工坊。',
      explore: '快速导航',
      visitContact: '联系与自提',
      stayInTouch: '关注我们',
      socialSub: '欢迎关注 SD Deals 官方动态。',
      rights: '© 2026 SD DEALS · 加州圣地亚哥',
      privacy: '隐私政策',
      terms: '服务条款',
      disclaimer: '所有订单均需人工确认后安排付款与交付。'
    },
    pcServicesPage: {
      kicker: 'SD DEALS · 圣地亚哥专业装机工作室',
      title1: '定制电竞电脑',
      title2: '& 精准硬件维修。',
      desc: '从电竞赛事级高配整机到硬件芯片级检测，在圣地亚哥享受大师级匠心服务。',
      bookAppointment: '预约装机/维修服务',
      diagnosisFrom: '基准故障检测',
      turnaround: '交付周期',
      turnaroundVal: '当天 / 次日极速完成',
      warranty: '90天整机装配保修',
      consultation: '免费配置与兼容性咨询',
      pickupDropoff: '圣地亚哥送机与自提',
      gridKicker: '大师工艺 · 绝不缩水',
      gridTitle: '电脑定制与维修方案',
      gridDesc: '所有预约均由专业工程师人工审核，未经客户确认绝不擅自下单配件或加价。',
      scheduleService: '预约技术服务',
      requestService: '申请此项服务',
      guaranteeTitle: '所有预约提交后先进入人工审核。',
      guaranteeDesc: '确认时间与配件清单前绝不产生任何隐形收费。全程透明放心。',
      startRequest: '开始预约'
    },
    shop: {
      title: '全部精选商品',
      subtitle: 'SD Deals 真实拍摄现货库存，支持圣地亚哥本地自提或快递发货。',
      allCategories: '全部分类',
      allBrands: '全部品牌',
      anyCondition: '所有成色',
      anyAvailability: '所有库存状态',
      inStock: '有现货',
      sold: '已售罄',
      newest: '最新上架',
      priceLow: '价格从低到高',
      priceHigh: '价格从高到低',
      noProducts: '未找到相关商品',
      noProductsSub: '请尝试修改筛选条件或关键词。'
    },
    product: {
      backTo: '返回',
      details: '规格与参数',
      quantity: '购买数量',
      available: '件现货',
      addBag: '加入购物车',
      buyNow: '立即购买',
      soldOut: '已售罄',
      saveProduct: '♡ 收藏商品',
      savedProduct: '♥ 已收藏商品',
      shippingNoteTitle: '支持邮寄或本地安全自提',
      shippingNoteSub: '圣地亚哥地区。订单审核后私信提供具体交接地址。',
      messageSeller: '联系店主咨询商品细节',
      reviewsTitle: '客户真实评价',
      reviewsSub: '来自已购客户的真实体验。',
      noReviews: '该商品暂无评价。',
      leaveReview: '撰写商品评价',
      submitReview: '提交审核'
    },
    cart: {
      title: '我的购物车',
      kicker: '已选商品清单',
      empty: '购物车暂无商品。',
      emptySub: '浏览更多手机数码、电子产品和电脑装机服务。',
      continueShopping: '继续选购',
      summary: '订单费用摘要',
      shipToMe: '快递邮寄到家',
      localPickup: '圣地亚哥本地自提',
      free: '包邮',
      subtotal: '商品小计',
      shipping: '运费',
      tax: '预估消费税',
      total: '订单总计',
      checkout: '前往结账',
      pickupNotice: '自提具体指引与付款方式将在订单确认后提供。现在无需线上付款。'
    },
    checkout: {
      title: '填写结账信息',
      kicker: '最后确认步骤',
      subtitle: '提交订单后，SD Deals 团队将人工核对库存并联系您确认付款细节。',
      backToBag: '返回购物车',
      contact: '联系人信息',
      fullName: '姓名',
      email: '电子邮箱',
      phone: '手机电话号码',
      fulfillment: '配送方式',
      shipping: '快递邮寄',
      localPickup: '圣地亚哥本地自提',
      street: '详细地址',
      city: '城市',
      state: '州 / 省',
      zip: '邮政编码',
      payment: '付款方式',
      paymentDesc: '订单生成后由客服一对一人工联系安排付款。无需直接在此输入信用卡信息。',
      placeOrderBtn: '确认并提交订单',
      placingOrder: '正在提交订单…',
      notes: '订单特别要求或备注（选填）',
      pickupNote: '圣地亚哥地区。详细自提地址将在订单审核通过后安全发送给您。'
    },
    orderSuccess: {
      title: '订单提交成功！',
      kicker: '感谢您支持本地独立小店',
      desc: '您的订单已成功登记，订单确认函已发送至',
      orderNumber: '订单编号',
      trackOrder: '查看订单状态',
      coordWhatsApp: '通过 WhatsApp 确认付款',
      sendEmail: '发送邮件至',
      continueShopping: '继续浏览选购'
    },
    theme: {
      dark: '深色主题',
      light: '浅色主题'
    }
  },
  ar: {
    dir: 'rtl',
    name: 'العربية',
    code: 'ar',
    nav: {
      home: 'الرئيسية',
      shop: 'المتجر',
      phones: 'الهواتف',
      gamingPcs: 'كمبيوتر ألعاب',
      electronics: 'إلكترونيات',
      pcServices: 'خدمات الكمبيوتر',
      trackOrder: 'تتبع الطلب',
      myAccount: 'حسابي'
    },
    hero: {
      kicker: 'متجر محلي مستقل · سان دييغو، كاليفورنيا',
      title1: 'منتجات رائعة.',
      title2: 'عروض أفضل.',
      subtitle: 'هواتف، أجهزة كمبيوتر ألعاب، قطع عتاد الحاسوب وخدمات التجميع الاحترافية في سان دييغو.',
      shopNow: 'تسوق الآن',
      explorePc: 'خدمات الكمبيوتر',
      trust1: 'منتجات حقيقية من متجرنا المحلي',
      trust2: 'استلام محلي في سان دييغو متاح',
      drag3d: '✦ اسحب للتدوير ثلاثي الأبعاد'
    },
    promises: {
      clearCondition: 'حالة واضحة بدون تخمين',
      clearConditionSub: 'وصف دقيق لكل منتج يوضح ما ستستلمه بالضبط.',
      sdPickup: 'استلام في سان دييغو',
      sdPickupSub: 'مشاركة عنوان الاستلام بعد تأكيد الطلب مباشرة.',
      shipping: 'شحن على منتجات مختارة',
      shippingSub: 'اختر طريقة التسليم المفضلة عند الدفع.'
    },
    categories: {
      kicker: 'اختر ما يناسبك',
      title: 'تسوق حسب الفئة',
      subtitle: 'تصفح تشكيلة موثوقة ومضمونة من SD Deals.',
      viewAll: 'عرض جميع المنتجات'
    },
    featured: {
      kicker: 'مجموعة SD DEALS',
      title: 'منتجات مميزة',
      subtitle: 'مخزون حقيقي وجاهز للشحن أو الاستلام الشخصي في سان دييغو.',
      shopAll: 'تسوق كل المنتجات'
    },
    local: {
      kicker: 'متجر محلي، تعامل صادق',
      title1: 'تسوق عبر الإنترنت.',
      title2: 'متجذر في سان دييغو.',
      desc: 'اشترِ عبر الإنترنت مع الشحن أو الاستلام المحلي الآمن. نشارك عنوان الاستلام بدقة بعد تأكيد طلبك.',
      explore: 'تصفح المتجر',
      badge: 'منطقة سان دييغو',
      badgeSub: 'استلام محلي · التفاصيل بعد التأكيد'
    },
    pcBanner: {
      kicker: 'هل يحتاج جهازك إلى خبير؟',
      title1: 'عناية فائقة بالكمبيوتر،',
      title2: 'من أول قطعة حتى آخر اختبار أداء.',
      desc: 'تجميع احترافي، ترقيات وإصلاحات بأسعار واضحة وموافقة مسبقة.',
      explore: 'اكتشف خدمات الكمبيوتر'
    },
    footer: {
      desc: 'منتجات ممتازة، أوصاف دقيقة وخبرة حقيقية في سان دييغو.',
      explore: 'استكشف',
      visitContact: 'التواصل والزيارة',
      stayInTouch: 'ابق على تواصل',
      socialSub: 'تابع تحديثات وعروض SD Deals الرسمية.',
      rights: '© 2026 SD DEALS · سان دييغو، كاليفورنيا',
      privacy: 'الخصوصية',
      terms: 'الشروط والأحكام',
      disclaimer: 'يتم تأكيد الطلبات يدوياً وترتيب الدفع عند التأكيد.'
    },
    pcServicesPage: {
      kicker: 'SD DEALS · معمل تجميع أجهزة الكمبيوتر في سان دييغو',
      title1: 'تجميع أجهزة مخصصة',
      title2: '& إصلاح عالي الدقة.',
      desc: 'من أجهزة الألعاب الفائقة إلى الإصلاحات الدقيقة، احصل على أفضل جودة حرفية في سان دييغو.',
      bookAppointment: 'حجز موعد صيانة/تجميع',
      diagnosisFrom: 'الفحص والتشخيص يبدأ من',
      turnaround: 'مدة الإنجاز',
      turnaroundVal: 'نفس اليوم / اليوم التالي',
      warranty: 'ضمان تجميع 90 يوماً',
      consultation: 'استشارة فنية مجانية',
      pickupDropoff: 'استلام وتسليم في سان دييغو',
      gridKicker: 'حرفية متقنة · بدون تهاون',
      gridTitle: 'حلول وخدمات أجهزة الكمبيوتر',
      gridDesc: 'يبدأ كل موعد بمراجعة شخصية شاملة. لا نشتري أي قطع أو نفرض أي تكلفة دون موافقتك المسبقة.',
      scheduleService: 'جدولة خدمة',
      requestService: 'طلب هذه الخدمة',
      guaranteeTitle: 'تبدأ جميع المواعيد بحالة قيد المراجعة.',
      guaranteeDesc: 'نراجع قائمة المكونات والجدول الزمني معك شخصياً قبل اعتماد الموعد. بدون مفاجآت.',
      startRequest: 'بدء الطلب'
    },
    shop: {
      title: 'جميع المنتجات',
      subtitle: 'منتجات حقيقية ومعتمدة من SD Deals. أسعار صادقة مع الاستلام المحلي أو الشحن.',
      allCategories: 'جميع الفئات',
      allBrands: 'جميع الماركات',
      anyCondition: 'جميع الحالات',
      anyAvailability: 'حالة التوفر',
      inStock: 'متوفر بالمخزن',
      sold: 'تم البيع',
      newest: 'الأحدث أولاً',
      priceLow: 'السعر: من الأقل للأعلى',
      priceHigh: 'السعر: من الأعلى للأقل',
      noProducts: 'لم يتم العثور على منتجات',
      noProductsSub: 'يرجى تجربة كلمات بحث أخرى أو تغيير الفلاتر.'
    },
    product: {
      backTo: 'الرجوع إلى',
      details: 'تفاصيل المنتج',
      quantity: 'الكمية',
      available: 'متوفر',
      addBag: 'أضف إلى السلة',
      buyNow: 'شراء الآن',
      soldOut: 'نفدت الكمية',
      saveProduct: '♡ حفظ المنتج',
      savedProduct: '♥ منتج محفوظ',
      shippingNoteTitle: 'شحن أو استلام شخصي محلي',
      shippingNoteSub: 'منطقة سان دييغو. يتم إرسال عنوان الاستلام الدقيق بعد تأكيد الطلب.',
      messageSeller: 'مراسلة البائع بخصوص هذا المنتج',
      reviewsTitle: 'تقييمات العملاء',
      reviewsSub: 'آراء وتقييمات من مشترين حقيقيين تم التحقق منهم.',
      noReviews: 'لا توجد تقييمات لهذا المنتج حتى الآن.',
      leaveReview: 'كتابة تقييم',
      submitReview: 'إرسال التقييم'
    },
    cart: {
      title: 'سلة المشتريات',
      kicker: 'اختياراتك',
      empty: 'سلتك فارغة حالياً.',
      emptySub: 'تصفح أحدث الهواتف والإلكترونيات وخدمات أجهزة الألعاب.',
      continueShopping: 'متابعة التسوق',
      summary: 'ملخص الطلب',
      shipToMe: 'شحن إلى عنواني',
      localPickup: 'استلام محلي في سان دييغو',
      free: 'مجاني',
      subtotal: 'المجموع الفرعي',
      shipping: 'الشحن',
      tax: 'الضريبة التقديرية',
      total: 'الإجمالي النهائي',
      checkout: 'متابعة الدفع',
      pickupNotice: 'يتم تأكيد تفاصيل الاستلام والدفع بعد إرسال الطلب. لن يتم خصم أي مبالغ الآن.'
    },
    checkout: {
      title: 'إتمام الطلب',
      kicker: 'خطوات التأكيد',
      subtitle: 'أرسل طلبك الآن وسيقوم فريق SD Deals بتأكيد التوفر وترتيب الدفع معك مباشرة.',
      backToBag: 'العودة إلى السلة',
      contact: 'بيانات التواصل',
      fullName: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      fulfillment: 'طريقة الاستلام',
      shipping: 'شحن',
      localPickup: 'استلام محلي في سان دييغو',
      street: 'العنوان بالتفصيل',
      city: 'المدينة',
      state: 'الولاية',
      zip: 'الرمز البريدي',
      payment: 'ترتيب الدفع',
      paymentDesc: 'يتم تنسيق الدفع شخصياً بعد مراجعة الطلب. سنتواصل معك مباشرة دون الحاجة لبطاقات ائتمان الآن.',
      placeOrderBtn: 'تأكيد وإرسال الطلب',
      placingOrder: 'جارٍ إرسال الطلب…',
      notes: 'ملاحظات إضافية (اختياري)',
      pickupNote: 'منطقة سان دييغو. عنوان الاستلام الدقيق يتم إرساله بسرية وأمان بعد تأكيد الطلب.'
    },
    orderSuccess: {
      title: 'تم تسجيل طلبك بنجاح!',
      kicker: 'شكراً لدعمك للأعمال المحلية',
      desc: 'تم تسجيل طلبك بنجاح. سيتم إرسال تأكيد الطلب والتفاصيل من',
      orderNumber: 'رقم الطلب',
      trackOrder: 'تتبع الطلب',
      coordWhatsApp: 'تنسيق الدفع عبر واتساب',
      sendEmail: 'إرسال بريد إلى',
      continueShopping: 'متابعة التسوق'
    },
    theme: {
      dark: 'الوضع الداكن',
      light: 'الوضع الفاتح'
    }
  }
};
