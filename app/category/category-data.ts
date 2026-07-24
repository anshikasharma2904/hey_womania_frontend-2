import {
  CATEGORY_VIDEOS,
  JEWELLERY_ASSETS,
  MODEL_ASSETS,
  PRODUCT_ASSETS
} from "@/lib/fashion-assets";

export type CategorySlug =
  | "all"
  | "western"
  | "traditional"
  | "formals"
  | "jeans"
  | "shirts"
  | "jewellery"
  | "bags"
  | "plus-size"
  | "sale";

export type LeadCategory = {
  id: string;
  slug: CategorySlug;
  title: string;
  subtitle: string;
  href: string;
  video?: string;
  className: string;
  mediaClassName: string;
};

export type CategoryProduct = {
  name: string;
  price: string;
  subtitle: string;
  image: string;
  gallery: string[];
  isSellPointEligible?: boolean;
  originalPrice?: string;
  sizes?: string[];
};

export type CatalogProduct = CategoryProduct & {
  slug: string;
  categorySlug: CategorySlug;
  categoryTitle: string;
};

export type CategoryPageData = {
  title: string;
  eyebrow: string;
  intro: string;
  heroVideo?: string;
  products: CategoryProduct[];
};

export type CategoryQuickLink = {
  slug: CategorySlug;
  label: string;
  icon: string;
  href: string;
};

export type CategoryMenuColumn = {
  title: string;
  links: { label: string; href: string }[];
};

export type CategoryMenu = {
  label: string;
  href: string;
  columns: CategoryMenuColumn[];
};

export const slugifyProductName = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const NAVBAR_CATEGORY_MENUS: CategoryMenu[] = [
  {
    label: "Clothes",
    href: "/category/all",
    columns: [
      {
        title: "Traditional Wear",
        links: [
          { label: "Suits Festive", href: "/category/traditional" },
          { label: "Suits Casual", href: "/category/traditional" },
          { label: "Kurtas", href: "/category/traditional" },
          { label: "Sarees", href: "/category/traditional" },
          { label: "Ethnic Wear", href: "/category/traditional" },
          { label: "Leggings", href: "/category/traditional" },
          { label: "Salwar and Suits", href: "/category/traditional" },
          { label: "Plazzo", href: "/category/traditional" }
        ]
      },
      {
        title: "Western Wear",
        links: [
          { label: "Dresses", href: "/category/western" },
          { label: "Tops", href: "/category/shirts" },
          { label: "Tshirts", href: "/category/shirts" },
          { label: "Jeans", href: "/category/jeans" },
          { label: "Trousers & Capris", href: "/category/western" },
          { label: "Co-ords", href: "/category/western" },
          { label: "Jumpsuits", href: "/category/western" },
          { label: "Jackets & Coats", href: "/category/western" },
          { label: "Blazers & Waistcoats", href: "/category/western" }
        ]
      }
    ]
  },
  {
    label: "Jewellery",
    href: "/category/jewellery",
    columns: [
      {
        title: "Jewellery",
        links: [
          { label: "Necklaces", href: "/category/jewellery" },
          { label: "Earrings", href: "/category/jewellery" },
          { label: "Rings", href: "/category/jewellery" },
          { label: "Bangles", href: "/category/jewellery" }
        ]
      }
    ]
  },
  {
    label: "Bags",
    href: "/category/bags",
    columns: [
      {
        title: "Bags",
        links: [
          { label: "Mini Bags", href: "/category/bags" },
          { label: "Shoulder Bags", href: "/category/bags" },
          { label: "Evening Clutches", href: "/category/bags" },
          { label: "Daily Use", href: "/category/bags" }
        ]
      }
    ]
  },
  {
    label: "Plus Size",
    href: "/category/plus-size",
    columns: [
      {
        title: "Plus Size",
        links: [
          { label: "Curve Dresses", href: "/category/plus-size" },
          { label: "Curve Tops", href: "/category/plus-size" },
          { label: "Curve Formals", href: "/category/plus-size" },
          { label: "Curve Occasion", href: "/category/plus-size" }
        ]
      }
    ]
  },
  {
    label: "Sale",
    href: "/category/sale",
    columns: [
      {
        title: "Sale",
        links: [
          { label: "Western Deals", href: "/category/sale" },
          { label: "Traditional Deals", href: "/category/sale" },
          { label: "Formal Deals", href: "/category/sale" },
          { label: "Accessory Deals", href: "/category/sale" }
        ]
      }
    ]
  },
  {
    label: "Combo",
    href: "#",
    columns: [
      {
        title: "Coming Soon",
        links: []
      }
    ]
  }
];

const createProduct = (
  name: string,
  price: string,
  subtitle: string,
  image: string,
  gallery: string[]
): CategoryProduct => ({
  name,
  price,
  subtitle,
  image,
  gallery
});

const westernGallery = [
  PRODUCT_ASSETS.western1,
  MODEL_ASSETS.western,
  MODEL_ASSETS.formal,
  PRODUCT_ASSETS.western2
];

const traditionalGallery = [
  MODEL_ASSETS.traditional,
  PRODUCT_ASSETS.traditional1,
  PRODUCT_ASSETS.traditional2,
  MODEL_ASSETS.couture
];

const formalGallery = [
  MODEL_ASSETS.formal,
  MODEL_ASSETS.minimal,
  PRODUCT_ASSETS.couture1,
  MODEL_ASSETS.editorial
];

const denimGallery = [
  MODEL_ASSETS.minimal,
  MODEL_ASSETS.formal,
  MODEL_ASSETS.western,
  MODEL_ASSETS.editorial
];

const shirtsGallery = [
  MODEL_ASSETS.formal,
  MODEL_ASSETS.couture,
  MODEL_ASSETS.minimal,
  MODEL_ASSETS.editorial
];

const jewelleryGallery = [
  JEWELLERY_ASSETS.templeGoldNecklace,
  JEWELLERY_ASSETS.pearlHaloEarrings,
  JEWELLERY_ASSETS.lotusRingSet,
  JEWELLERY_ASSETS.eveningBanglePair
];

const bagsGallery = [
  PRODUCT_ASSETS.couture1,
  PRODUCT_ASSETS.traditional2,
  PRODUCT_ASSETS.couture2,
  PRODUCT_ASSETS.western2
];

const westernProducts: CategoryProduct[] = [
  createProduct(
    "Sable Drape Blazer",
    "₹420",
    "Structured tailoring",
    PRODUCT_ASSETS.western1,
    westernGallery
  ),
  createProduct(
    "Studio Ivory Look",
    "₹360",
    "Refined tonal layering",
    MODEL_ASSETS.formal,
    [MODEL_ASSETS.formal, PRODUCT_ASSETS.western1, PRODUCT_ASSETS.western2, MODEL_ASSETS.western]
  ),
  createProduct(
    "Muse Outer Layer",
    "₹395",
    "Statement jacket",
    MODEL_ASSETS.editorial,
    [MODEL_ASSETS.editorial, MODEL_ASSETS.formal, PRODUCT_ASSETS.western2, PRODUCT_ASSETS.western1]
  ),
  createProduct(
    "Soft Utility Edit",
    "₹310",
    "Relaxed trousers set",
    MODEL_ASSETS.minimal,
    [MODEL_ASSETS.minimal, MODEL_ASSETS.formal, MODEL_ASSETS.western, PRODUCT_ASSETS.western2]
  ),
  createProduct(
    "Quiet Monochrome Dress",
    "₹335",
    "Day-to-night silhouette",
    PRODUCT_ASSETS.western2,
    [PRODUCT_ASSETS.western2, PRODUCT_ASSETS.western1, MODEL_ASSETS.editorial, MODEL_ASSETS.formal]
  ),
  createProduct(
    "Tailored City Shirt",
    "₹210",
    "Minimal formal base",
    MODEL_ASSETS.western,
    [MODEL_ASSETS.western, PRODUCT_ASSETS.western1, MODEL_ASSETS.formal, PRODUCT_ASSETS.western2]
  )
];

const traditionalProducts: CategoryProduct[] = [
  createProduct(
    "Arah Festive Lehenga",
    "₹540",
    "Statement occasion set",
    MODEL_ASSETS.traditional,
    traditionalGallery
  ),
  createProduct(
    "Ceremonial Light Saree",
    "₹495",
    "Gold-detailed drape",
    PRODUCT_ASSETS.traditional2,
    [PRODUCT_ASSETS.traditional2, MODEL_ASSETS.traditional, PRODUCT_ASSETS.traditional1, MODEL_ASSETS.couture]
  ),
  createProduct(
    "Temple Gold Blouse",
    "₹310",
    "Heirloom styling note",
    PRODUCT_ASSETS.traditional1,
    [PRODUCT_ASSETS.traditional1, MODEL_ASSETS.traditional, PRODUCT_ASSETS.traditional2, MODEL_ASSETS.editorial]
  ),
  createProduct(
    "Wedding Guest Edit",
    "₹460",
    "Festive contrast palette",
    MODEL_ASSETS.couture,
    [MODEL_ASSETS.couture, MODEL_ASSETS.traditional, PRODUCT_ASSETS.traditional2, PRODUCT_ASSETS.traditional1]
  ),
  createProduct(
    "Pink Set",
    "₹520",
    "Ceremony spotlight",
    MODEL_ASSETS.editorial,
    [MODEL_ASSETS.editorial, MODEL_ASSETS.traditional, PRODUCT_ASSETS.traditional2, MODEL_ASSETS.couture]
  ),
  createProduct(
    "Evening Celebration Dupatta",
    "₹185",
    "Layered finishing piece",
    MODEL_ASSETS.minimal,
    [MODEL_ASSETS.minimal, PRODUCT_ASSETS.traditional1, MODEL_ASSETS.traditional, PRODUCT_ASSETS.traditional2]
  )
];

const formalsProducts: CategoryProduct[] = [
  createProduct(
    "Ivory Formal Jacket",
    "₹390",
    "Desk-to-dinner layer",
    MODEL_ASSETS.formal,
    formalGallery
  ),
  createProduct(
    "Clean Line Co-ord",
    "₹345",
    "Minimal tailored dressing",
    MODEL_ASSETS.minimal,
    [MODEL_ASSETS.minimal, MODEL_ASSETS.formal, PRODUCT_ASSETS.couture1, MODEL_ASSETS.editorial]
  ),
  createProduct(
    "Studio Evening Dress",
    "₹430",
    "Quiet event silhouette",
    MODEL_ASSETS.editorial,
    [MODEL_ASSETS.editorial, MODEL_ASSETS.formal, PRODUCT_ASSETS.couture1, MODEL_ASSETS.minimal]
  ),
  createProduct(
    "Soft Taupe Suiting",
    "₹410",
    "Modern formal drape",
    MODEL_ASSETS.traditional,
    [MODEL_ASSETS.traditional, MODEL_ASSETS.formal, MODEL_ASSETS.editorial, PRODUCT_ASSETS.couture1]
  ),
  createProduct(
    "Minimal Black Column",
    "₹365",
    "After-hours formal edit",
    MODEL_ASSETS.couture,
    [MODEL_ASSETS.couture, MODEL_ASSETS.formal, PRODUCT_ASSETS.couture1, MODEL_ASSETS.editorial]
  ),
  createProduct(
    "Signature Outer Layer",
    "₹455",
    "Formal statement coat",
    PRODUCT_ASSETS.couture1,
    [PRODUCT_ASSETS.couture1, MODEL_ASSETS.formal, MODEL_ASSETS.editorial, MODEL_ASSETS.minimal]
  )
];

const jeansProducts: CategoryProduct[] = [
  createProduct(
    "Indigo Straight Fit",
    "₹148",
    "Everyday denim",
    MODEL_ASSETS.minimal,
    denimGallery
  ),
  createProduct(
    "High Rise Studio Denim",
    "₹172",
    "Structured blue wash",
    MODEL_ASSETS.formal,
    [MODEL_ASSETS.formal, MODEL_ASSETS.minimal, MODEL_ASSETS.western, MODEL_ASSETS.editorial]
  ),
  createProduct(
    "Weekend Relaxed Jeans",
    "₹138",
    "Soft off-duty fit",
    MODEL_ASSETS.western,
    [MODEL_ASSETS.western, MODEL_ASSETS.minimal, MODEL_ASSETS.formal, MODEL_ASSETS.editorial]
  ),
  createProduct(
    "Dark Wash Statement Fit",
    "₹184",
    "Sharper city silhouette",
    MODEL_ASSETS.editorial,
    [MODEL_ASSETS.editorial, MODEL_ASSETS.formal, MODEL_ASSETS.minimal, MODEL_ASSETS.western]
  )
];

const shirtProducts: CategoryProduct[] = [
  createProduct(
    "Ivory Day Shirt",
    "₹126",
    "Clean wardrobe essential",
    MODEL_ASSETS.formal,
    shirtsGallery
  ),
  createProduct(
    "Tonal Drape Blouse",
    "₹142",
    "Soft fluid structure",
    MODEL_ASSETS.couture,
    [MODEL_ASSETS.couture, MODEL_ASSETS.formal, MODEL_ASSETS.minimal, MODEL_ASSETS.editorial]
  ),
  createProduct(
    "Modern Cotton Buttondown",
    "₹118",
    "Tailored everyday base",
    MODEL_ASSETS.minimal,
    [MODEL_ASSETS.minimal, MODEL_ASSETS.formal, MODEL_ASSETS.editorial, MODEL_ASSETS.couture]
  ),
  createProduct(
    "Evening Satin Shirt",
    "₹154",
    "Dress-up essential",
    MODEL_ASSETS.editorial,
    [MODEL_ASSETS.editorial, MODEL_ASSETS.couture, MODEL_ASSETS.formal, MODEL_ASSETS.minimal]
  )
];

const jewelleryProducts: CategoryProduct[] = [
  createProduct(
    "Temple Gold Necklace",
    "₹210",
    "Heirloom-inspired shine",
    JEWELLERY_ASSETS.templeGoldNecklace,
    jewelleryGallery
  ),
  createProduct(
    "Pearl Halo Earrings",
    "₹118",
    "Light occasion sparkle",
    JEWELLERY_ASSETS.pearlHaloEarrings,
    [
      JEWELLERY_ASSETS.pearlHaloEarrings,
      JEWELLERY_ASSETS.templeGoldNecklace,
      JEWELLERY_ASSETS.lotusRingSet,
      JEWELLERY_ASSETS.eveningBanglePair
    ]
  ),
  createProduct(
    "Lotus Ring Set",
    "₹96",
    "Layered hand detail",
    JEWELLERY_ASSETS.lotusRingSet,
    [
      JEWELLERY_ASSETS.lotusRingSet,
      JEWELLERY_ASSETS.templeGoldNecklace,
      JEWELLERY_ASSETS.pearlHaloEarrings,
      JEWELLERY_ASSETS.eveningBanglePair
    ]
  ),
  createProduct(
    "Evening Bangle Pair",
    "₹134",
    "Festive wrist stack",
    JEWELLERY_ASSETS.eveningBanglePair,
    [
      JEWELLERY_ASSETS.eveningBanglePair,
      JEWELLERY_ASSETS.templeGoldNecklace,
      JEWELLERY_ASSETS.pearlHaloEarrings,
      JEWELLERY_ASSETS.lotusRingSet
    ]
  )
];

const bagProducts: CategoryProduct[] = [
  createProduct(
    "Studio Mini Bag",
    "₹186",
    "Compact day companion",
    PRODUCT_ASSETS.couture1,
    bagsGallery
  ),
  createProduct(
    "Structured Occasion Clutch",
    "₹154",
    "Polished evening carry",
    PRODUCT_ASSETS.traditional2,
    [PRODUCT_ASSETS.traditional2, PRODUCT_ASSETS.couture1, PRODUCT_ASSETS.couture2, PRODUCT_ASSETS.western2]
  ),
  createProduct(
    "Soft Leather Shoulder Bag",
    "₹198",
    "Daily luxury essential",
    PRODUCT_ASSETS.couture2,
    [PRODUCT_ASSETS.couture2, PRODUCT_ASSETS.couture1, PRODUCT_ASSETS.traditional2, PRODUCT_ASSETS.western2]
  ),
  createProduct(
    "Travel Edit Tote",
    "₹224",
    "Large carryall mood",
    PRODUCT_ASSETS.western2,
    [PRODUCT_ASSETS.western2, PRODUCT_ASSETS.couture1, PRODUCT_ASSETS.couture2, PRODUCT_ASSETS.traditional2]
  )
];

const plusSizeProducts: CategoryProduct[] = [
  createProduct(
    "Curve Tailored Blazer",
    "₹248",
    "Confident structured fit",
    MODEL_ASSETS.western,
    [MODEL_ASSETS.western, MODEL_ASSETS.formal, MODEL_ASSETS.minimal, PRODUCT_ASSETS.western1]
  ),
  createProduct(
    "Curve Satin Occasion Set",
    "₹282",
    "Celebration-ready drape",
    MODEL_ASSETS.traditional,
    [MODEL_ASSETS.traditional, MODEL_ASSETS.couture, PRODUCT_ASSETS.traditional2, PRODUCT_ASSETS.traditional1]
  ),
  createProduct(
    "Relaxed Curve Shirt Dress",
    "₹196",
    "Easy all-day silhouette",
    MODEL_ASSETS.formal,
    [MODEL_ASSETS.formal, MODEL_ASSETS.minimal, MODEL_ASSETS.western, PRODUCT_ASSETS.western2]
  ),
  createProduct(
    "Curve Formal Co-ord",
    "₹268",
    "Clean confident dressing",
    MODEL_ASSETS.editorial,
    [MODEL_ASSETS.editorial, MODEL_ASSETS.formal, MODEL_ASSETS.minimal, PRODUCT_ASSETS.couture1]
  )
];

const saleProducts: CategoryProduct[] = [
  createProduct(
    "Season End Blazer",
    "₹190",
    "Was ₹320",
    MODEL_ASSETS.western,
    [MODEL_ASSETS.western, PRODUCT_ASSETS.western1, PRODUCT_ASSETS.western2, MODEL_ASSETS.formal]
  ),
  createProduct(
    "Festive Silk Edit",
    "₹240",
    "Was ₹410",
    MODEL_ASSETS.traditional,
    [MODEL_ASSETS.traditional, PRODUCT_ASSETS.traditional2, PRODUCT_ASSETS.traditional1, MODEL_ASSETS.couture]
  ),
  createProduct(
    "Minimal Workwear Dress",
    "₹172",
    "Was ₹285",
    MODEL_ASSETS.formal,
    [MODEL_ASSETS.formal, MODEL_ASSETS.minimal, PRODUCT_ASSETS.couture1, MODEL_ASSETS.editorial]
  ),
  createProduct(
    "Jewelled Evening Bag",
    "₹118",
    "Was ₹188",
    PRODUCT_ASSETS.couture2,
    [PRODUCT_ASSETS.couture2, PRODUCT_ASSETS.couture1, PRODUCT_ASSETS.traditional2, PRODUCT_ASSETS.western2]
  )
];

export const categoryQuickLinks: CategoryQuickLink[] = [
  { slug: "all", label: "All", icon: "apps", href: "/category/all" },
  { slug: "western", label: "Western", icon: "checkroom", href: "/category/western" },
  {
    slug: "traditional",
    label: "Traditional",
    icon: "auto_awesome",
    href: "/category/traditional"
  },
  { slug: "formals", label: "Formals", icon: "business_center", href: "/category/formals" },
  { slug: "shirts", label: "Shirts", icon: "dry_cleaning", href: "/category/shirts" },
  { slug: "jeans", label: "Jeans", icon: "styler", href: "/category/jeans" },
  {
    slug: "jewellery",
    label: "Jewellery",
    icon: "diamond",
    href: "/category/jewellery"
  },
  { slug: "bags", label: "Bags", icon: "shopping_bag", href: "/category/bags" },
  { slug: "plus-size", label: "Plus Size", icon: "accessibility_new", href: "/category/plus-size" },
  { slug: "sale", label: "Sale", icon: "local_offer", href: "/category/sale" }
];

export const leadCategories: LeadCategory[] = [
  {
    id: "western",
    slug: "western",
    title: "Western",
    subtitle: "Modern day dressing",
    href: "/category/western",
    video: CATEGORY_VIDEOS.western,
    className: "bg-[#f2e6dc]",
    mediaClassName: "h-full w-full object-cover object-center"
  },
  {
    id: "traditional",
    slug: "traditional",
    title: "Traditional",
    subtitle: "Festive mood",
    href: "/category/traditional",
    video: CATEGORY_VIDEOS.traditional,
    className: "bg-[#ead9ce]",
    mediaClassName: "h-full w-full object-cover object-center"
  },
  {
    id: "festive",
    slug: "formals",
    title: "Formals",
    subtitle: "Polished clean silhouettes",
    href: "/category/formals",
    video: CATEGORY_VIDEOS.formals,
    className: "bg-[#efe5dc]",
    mediaClassName: "h-full w-full object-cover object-center"
  }
];

export const categoryPages: Record<CategorySlug, CategoryPageData> = {
  all: {
    title: "All Categories",
    eyebrow: "HeyWomaniyaa Edit",
    intro:
      "Browse the full women’s fashion floor, from western and traditional statements to workwear, jewellery, and bags.",
    heroVideo: CATEGORY_VIDEOS.western,
    products: [
      ...westernProducts.slice(0, 2),
      ...traditionalProducts.slice(0, 2),
      ...formalsProducts.slice(0, 2)
    ]
  },
  western: {
    title: "Western Wear",
    eyebrow: "Modern Day Dressing",
    intro:
      "Sharp layers, soft tailoring, and versatile wardrobe pieces for city days and late evening plans.",
    heroVideo: CATEGORY_VIDEOS.western,
    products: westernProducts
  },
  traditional: {
    title: "Traditional Wear",
    eyebrow: "Festive Mood",
    intro:
      "Celebration-led silhouettes with richer color, ornate detailing, and ceremony-ready styling.",
    heroVideo: CATEGORY_VIDEOS.traditional,
    products: traditionalProducts
  },
  formals: {
    title: "Formals",
    eyebrow: "Polished Clean Silhouettes",
    intro:
      "A sharper wardrobe for work, events, and understated sophistication with neutral, elevated styling.",
    heroVideo: CATEGORY_VIDEOS.formals,
    products: formalsProducts
  },
  jeans: {
    title: "Jeans",
    eyebrow: "Denim Edit",
    intro:
      "Easy denim, sharper washes, and elevated jeans for everyday styling with a fashion-first finish.",
    heroVideo: CATEGORY_VIDEOS.formals,
    products: jeansProducts
  },
  shirts: {
    title: "Shirts",
    eyebrow: "Wardrobe Layers",
    intro:
      "From crisp work shirts to softer satin blouses, this edit covers the most versatile tops in the wardrobe.",
    heroVideo: CATEGORY_VIDEOS.western,
    products: shirtProducts
  },
  jewellery: {
    title: "Jewellery",
    eyebrow: "Finishing Shine",
    intro:
      "A jewellery edit built for layering, occasion dressing, and giving every look a refined finishing note.",
    heroVideo: CATEGORY_VIDEOS.traditional,
    products: jewelleryProducts
  },
  bags: {
    title: "Bags",
    eyebrow: "Carry Goods",
    intro:
      "Structured handbags, evening clutches, and elevated daily essentials designed to finish the look well.",
    heroVideo: CATEGORY_VIDEOS.formals,
    products: bagProducts
  },
  "plus-size": {
    title: "Plus Size",
    eyebrow: "Curve Edit",
    intro:
      "Thoughtful proportions, confident tailoring, and elevated silhouettes built for fuller, fashion-forward dressing.",
    heroVideo: CATEGORY_VIDEOS.western,
    products: plusSizeProducts
  },
  sale: {
    title: "Sale",
    eyebrow: "Limited Time Edit",
    intro:
      "An ongoing sale floor with wardrobe signatures, occasion looks, and accessories at reduced prices.",
    heroVideo: CATEGORY_VIDEOS.traditional,
    products: saleProducts
  }
};

export const catalogProducts: CatalogProduct[] = Object.entries(categoryPages).flatMap(
  ([categorySlug, page]) =>
    page.products.map((product) => ({
      ...product,
      slug: slugifyProductName(product.name),
      categorySlug: categorySlug as CategorySlug,
      categoryTitle: page.title
    }))
);
