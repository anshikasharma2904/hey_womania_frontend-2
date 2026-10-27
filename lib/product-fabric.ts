export interface FabricSpecification {
  fabric: string;
  weaveOrTexture: string;
  pattern: string;
  care: string;
  season: string;
  isJewelleryOrBag: boolean;
  materialTypeLabel: string; // e.g. "Fabric & Material" or "Craft & Finish"
}

export function detectFabricDetail(
  title: string = "",
  description: string = "",
  category: string = "",
  fabricFromDb?: string | null
): FabricSpecification {
  const text = `${fabricFromDb || ""} ${title} ${description} ${category}`.toLowerCase();

  // 1. Check for Bags
  if (text.includes("bag") || text.includes("clutch") || text.includes("tote") || text.includes("satchel")) {
    let material = "Premium Vegan Leather / PU";
    let texture = "Smooth Structured Finish";

    if (text.includes("straw") || text.includes("woven") || text.includes("basket")) {
      material = "Natural Handcrafted Straw / Jute";
      texture = "Artisanal Woven Texture";
    } else if (text.includes("pleat") || text.includes("pleated")) {
      material = "Pleated Satin & Vegan Leather";
      texture = "Soft Accordion Pleats";
    } else if (text.includes("quilt") || text.includes("quilted")) {
      material = "Quilted Napa Faux Leather";
      texture = "Cushioned Diamond Quilted Texture";
    } else if (text.includes("wood") || text.includes("wooden")) {
      material = "Hand-carved Wood & Metal Frame";
      texture = "Lacquered Natural Grain";
    }

    return {
      fabric: material,
      weaveOrTexture: texture,
      pattern: text.includes("floral") ? "Floral Motif" : "Solid Minimalist",
      care: "Wipe with a clean dry cloth. Store in dust bag away from direct moisture.",
      season: "All-Season Occasion",
      isJewelleryOrBag: true,
      materialTypeLabel: "Material & Craft"
    };
  }

  // 2. Check for Jewellery
  if (
    text.includes("jewel") ||
    text.includes("earring") ||
    text.includes("necklace") ||
    text.includes("bangle") ||
    text.includes("bracelet") ||
    text.includes("handcuff") ||
    text.includes("ring") ||
    text.includes("jhumka")
  ) {
    let material = "Brass Alloy with Gold/Silver Micron Plating";
    let texture = "Antique Oxidised / Polished Sheen";

    if (text.includes("pearl")) {
      material = "Cultured Faux Pearl & Gold-Plated Alloy";
      texture = "High-Luster Pearl Sheen";
    } else if (text.includes("crystal") || text.includes("stone")) {
      material = "Faceted Crystal Stones & Brass Alloy";
      texture = "Brilliant Cut Faceted Sparkle";
    } else if (text.includes("oxidised") || text.includes("silver")) {
      material = "German Silver / Oxidised Alloy";
      texture = "Vintage Matte Rustic Patina";
    } else if (text.includes("temple") || text.includes("kundan")) {
      material = "Handcrafted Temple Kundan & Brass";
      texture = "Intricate Filigree & Antique Gold Finish";
    }

    return {
      fabric: material,
      weaveOrTexture: texture,
      pattern: "Handcrafted Heritage Detailing",
      care: "Keep away from perfumes, sprays, and water. Store individually in zip pouch.",
      season: "Festive & Party Wear",
      isJewelleryOrBag: true,
      materialTypeLabel: "Jewellery Composition"
    };
  }

  // 3. Apparel Fabric Detection
  let fabric = (fabricFromDb && fabricFromDb.trim()) ? fabricFromDb.trim() : "100% Breathable Pure Cotton";
  let weaveOrTexture = "Soft Combed Poplin Weave";
  let care = "Gentle machine wash cold with similar colours. Low tumble dry or shade dry.";

  if (!fabricFromDb) {
    if (text.includes("poplin")) {
      fabric = "Premium Cotton Poplin";
      weaveOrTexture = "Crisp, Smooth Plain Weave";
    } else if (text.includes("mul cotton")) {
      fabric = "Pure Mul Cotton";
      weaveOrTexture = "Ultra-Light Airy Mulmul Drape";
    } else if (text.includes("linen")) {
      fabric = "100% Pure Breathable Linen";
      weaveOrTexture = "Natural Slub Textured Weave";
      care = "Hand wash or gentle cycle cold. Iron on reverse while slightly damp.";
    } else if (text.includes("chiffon")) {
      fabric = "Lightweight Poly-Chiffon";
      weaveOrTexture = "Translucent Sheer Flowing Drape";
      care = "Dry clean recommended or gentle hand wash in mild detergent.";
    } else if (text.includes("georgette")) {
      fabric = "Premium Georgette";
      weaveOrTexture = "Bouncy Crepe Finish with Fluid Silhouette";
      care = "Dry clean recommended for embellished details.";
    } else if (text.includes("banarasi silk") || text.includes("brocade")) {
      fabric = "Banarasi Silk Brocade";
      weaveOrTexture = "Lustrous Rich Festive Weave with Zari Art";
      care = "Strictly dry clean to preserve fabric shine and zari embroidery.";
    } else if (text.includes("silk") || text.includes("chanderi")) {
      fabric = "Silk Blend / Art Silk";
      weaveOrTexture = "Lustrous Rich Festive Weave";
      care = "Strictly dry clean to preserve fabric shine and zari embroidery.";
    } else if (text.includes("organza")) {
      fabric = "Fine Sheer Organza";
      weaveOrTexture = "Delicate Crisp Structured Sheer";
      care = "Dry clean only. Gentle steam iron.";
    } else if (text.includes("denim") || text.includes("jean")) {
      fabric = "Comfort Stretch Denim Cotton";
      weaveOrTexture = "Classic Twill Weave";
      care = "Machine wash cold inside-out. Do not bleach.";
    } else if (text.includes("cotton")) {
      fabric = "100% Pure Combed Cotton";
      weaveOrTexture = "Lightweight Breathable Soft Touch";
    } else if (text.includes("rayon") || text.includes("modal") || text.includes("viscose")) {
      fabric = "Premium Viscose Rayon";
      weaveOrTexture = "Ultra-Soft Fluid Fall & Silky Touch";
      care = "Cold gentle hand wash. Do not wring.";
    }
  } else {
    // Tailor weave and care according to the db fabric string
    const fLower = fabricFromDb.toLowerCase();
    if (fLower.includes("silk") || fLower.includes("brocade") || fLower.includes("jacquard")) {
      weaveOrTexture = "Lustrous Rich Festive Weave with Zari Art";
      care = "Strictly dry clean to preserve fabric shine and delicate threads.";
    } else if (fLower.includes("linen")) {
      weaveOrTexture = "Natural Slub Textured Breathable Weave";
      care = "Gentle cycle cold. Iron on reverse while slightly damp.";
    } else if (fLower.includes("mul")) {
      weaveOrTexture = "Ultra-Light Airy Mulmul Drape";
    } else if (fLower.includes("rayon") || fLower.includes("viscose")) {
      weaveOrTexture = "Ultra-Soft Fluid Fall & Silky Touch";
      care = "Cold gentle hand wash. Do not wring.";
    }
  }

  // Pattern detection
  let pattern = "Embroidered Accent";
  if (text.includes("lace") || text.includes("scalloped")) {
    pattern = "Schiffli Eyelet Lace & Embroidery";
  } else if (text.includes("print") || text.includes("printed")) {
    pattern = "Artisanal Motif Screen/Block Print";
  } else if (text.includes("embroider") || text.includes("embroidery") || text.includes("threadwork")) {
    pattern = "Intricate Threadwork Embroidery";
  } else if (text.includes("stripe") || text.includes("striped")) {
    pattern = "Yarn-Dyed Pinstripes";
  } else if (text.includes("solid")) {
    pattern = "Solid Tailored Elegance";
  }

  return {
    fabric,
    weaveOrTexture,
    pattern,
    care,
    season: "All-Day Comfort / Spring-Summer & Festive",
    isJewelleryOrBag: false,
    materialTypeLabel: "Fabric & Material Details"
  };
}
