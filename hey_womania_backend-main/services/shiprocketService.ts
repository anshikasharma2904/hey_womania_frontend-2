import crypto from "crypto";
import { Order } from "../models/Order";
import { Shipment } from "../models/Shipment";
import { ShiprocketToken } from "../models/ShiprocketToken";

const SHIPROCKET_API_URL = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_REFRESH_BUFFER_MS = 6 * 60 * 60 * 1000;

type ShiprocketRequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
};

let cachedToken: string | null = null;
let cachedTokenExpiresAt = 0;

function parseAmount(value: unknown) {
  if (typeof value === "number") return value;
  const parsed = parseFloat(String(value || "0").replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function requireShiprocketConfig() {
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

function getShiprocketError(data: any, fallback = "Shiprocket request failed") {
  if (data?.message) return String(data.message);
  if (data?.error) return typeof data.error === "string" ? data.error : JSON.stringify(data.error);
  if (data?.errors) return JSON.stringify(data.errors);
  return fallback;
}

function buildUrl(path: string, query?: ShiprocketRequestOptions["query"]) {
  const url = new URL(`${SHIPROCKET_API_URL}${path}`);

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export async function loginToShiprocket() {
  const config = requireShiprocketConfig();
  if (!config) {
    throw new Error("Shiprocket is not configured");
  }

  const response = await fetch(`${SHIPROCKET_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.token) {
    throw new Error(getShiprocketError(data, "Unable to authenticate with Shiprocket"));
  }

  const expiresAt = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
  await ShiprocketToken.findOneAndUpdate(
    {},
    {
      token: data.token,
      expiresAt,
      updatedAt: new Date()
    },
    { upsert: true, new: true }
  );

  cachedToken = data.token;
  cachedTokenExpiresAt = expiresAt.getTime();

  return data.token as string;
}

export async function getShiprocketToken() {
  if (cachedToken && Date.now() < cachedTokenExpiresAt - TOKEN_REFRESH_BUFFER_MS) {
    return cachedToken;
  }

  const tokenDoc = await ShiprocketToken.findOne();
  if (
    tokenDoc?.token &&
    tokenDoc.expiresAt &&
    tokenDoc.expiresAt.getTime() > Date.now() + TOKEN_REFRESH_BUFFER_MS
  ) {
    cachedToken = tokenDoc.token;
    cachedTokenExpiresAt = tokenDoc.expiresAt.getTime();
    return tokenDoc.token as string;
  }

  return loginToShiprocket();
}

async function shiprocketRequest(path: string, options: ShiprocketRequestOptions = {}, retry = true) {
  const token = await getShiprocketToken();
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && retry) {
    cachedToken = null;
    cachedTokenExpiresAt = 0;
    await ShiprocketToken.deleteMany({});
    await loginToShiprocket();
    return shiprocketRequest(path, options, false);
  }

  if (!response.ok) {
    throw new Error(getShiprocketError(data));
  }

  return data;
}

function normalizeAddress(source: any) {
  const address = source?.shippingAddress || source?.address || source || {};
  const name = address.fullName || address.name || source?.customer?.name || "Customer";
  const street = address.streetAddress || address.street || address.address || "";
  const line2 = address.streetAddressLine2 || address.address2 || "";
  const city = address.city || "";
  const state = address.state || city || "";
  const pincode = address.pincode || address.pinCode || address.postcode || process.env.SHIPROCKET_FALLBACK_PINCODE || "";
  const phone = String(address.phone || source?.customer?.phone || "").replace(/\D/g, "").slice(-10);
  const email = address.email || source?.customer?.email || process.env.SHIPROCKET_DEFAULT_CUSTOMER_EMAIL || "customer@heywomania.com";

  return {
    name,
    street,
    line2,
    city,
    state,
    pincode,
    phone,
    email
  };
}

function buildOrderItems(items: any[] = []) {
  return items.map((item: any) => ({
    name: item.name,
    sku: item.sku || item.productId || item.name,
    units: item.qty || item.quantity || 1,
    selling_price: parseAmount(item.price)
  }));
}

function buildShiprocketPayload(order: any) {
  const address = normalizeAddress(order);
  const items = buildOrderItems(order.items || []);
  const subTotal = parseAmount(order.total) || items.reduce((sum, item) => sum + item.selling_price * item.units, 0);
  const paymentMethod = String(order.paymentMethod || "").toLowerCase().includes("cod") ? "COD" : "Prepaid";

  return {
    order_id: order.orderNumber || order.orderId,
    order_date: new Date().toISOString().slice(0, 10),
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    channel_id: process.env.SHIPROCKET_CHANNEL_ID,
    billing_customer_name: address.name,
    billing_last_name: "",
    billing_address: address.street,
    billing_address_2: address.line2,
    billing_city: address.city,
    billing_pincode: address.pincode,
    billing_state: address.state,
    billing_country: "India",
    billing_email: address.email,
    billing_phone: address.phone,
    shipping_is_billing: true,
    order_items: items,
    payment_method: paymentMethod,
    sub_total: subTotal,
    length: Number(order.length || process.env.SHIPROCKET_PARCEL_LENGTH_CM || 10),
    breadth: Number(order.breadth || process.env.SHIPROCKET_PARCEL_BREADTH_CM || 10),
    height: Number(order.height || process.env.SHIPROCKET_PARCEL_HEIGHT_CM || 5),
    weight: Number(order.weight || process.env.SHIPROCKET_PARCEL_WEIGHT_KG || 0.5)
  };
}

function getTrackingUrl(awb?: string) {
  return awb ? `https://shiprocket.co/tracking/${awb}` : "";
}

async function upsertShipmentFromOrder(order: any, data: any) {
  const now = new Date().toISOString();
  const address = normalizeAddress(order);
  const shiprocketOrderId = String(data.order_id || data.orderId || "");
  const shiprocketShipmentId = String(data.shipment_id || data.shipmentId || "");
  const awb = data.awb_code || data.awb || "";

  const shipment = await Shipment.findOneAndUpdate(
    { orderId: order.id || order.orderId },
    {
      $setOnInsert: {
        id: crypto.randomUUID(),
        orderId: order.id || order.orderId,
        orderNumber: order.orderNumber || order.orderId,
        createdAt: now
      },
      courierPartner: "Shiprocket",
      shiprocketOrderId,
      shiprocketShipmentId,
      shiprocketStatus: data.status || "Order Created",
      shiprocketPayload: data,
      awbNumber: awb,
      courierName: data.courier_name || data.courier_company_id || "",
      trackingUrl: getTrackingUrl(awb),
      shipmentStatus: "Pending Pickup",
      deliveryAddress: {
        name: address.name,
        street: [address.street, address.line2].filter(Boolean).join(", "),
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        phone: address.phone
      },
      updatedAt: now
    },
    { upsert: true, new: true }
  );

  await Order.findOneAndUpdate(
    { id: order.id || order.orderId },
    {
      shippingProvider: "Shiprocket",
      shippingStatus: data.status || "Order Created",
      shipmentStatus: "Pending Pickup",
      shiprocketOrderId,
      shiprocketShipmentId,
      shipmentId: shiprocketShipmentId,
      awb,
      courier: data.courier_name || "",
      trackingId: awb || order.trackingId || "",
      trackingUrl: getTrackingUrl(awb),
      shippingError: ""
    }
  );

  return shipment;
}

export async function checkCourierServiceability(params: any) {
  const address = normalizeAddress(params);
  const query = {
    pickup_postcode: params.pickup_postcode || params.pickupPostcode || process.env.SHIPROCKET_PICKUP_PINCODE,
    delivery_postcode: params.delivery_postcode || params.deliveryPostcode || address.pincode,
    cod: params.cod ?? (String(params.paymentMethod || "").toLowerCase().includes("cod") ? 1 : 0),
    weight: params.weight || process.env.SHIPROCKET_PARCEL_WEIGHT_KG || 0.5
  };

  return shiprocketRequest("/courier/serviceability", { query });
}

export async function createShiprocketOrder(input: any): Promise<any> {
  const payload = input.order_items ? input : buildShiprocketPayload(input);
  const data = await shiprocketRequest("/orders/create/adhoc", {
    method: "POST",
    body: payload
  });

  const orderId = input.id || input.orderId;
  if (orderId) {
    const shipment = await upsertShipmentFromOrder(input, data);
    return { shipment, shiprocket: data };
  }

  return { shiprocket: data };
}

export async function createShiprocketShipmentForOrder(order: any): Promise<any> {
  const existing = await Shipment.findOne({ orderId: order.id });
  if (existing?.shiprocketShipmentId) {
    return { skipped: true, shipment: existing };
  }

  return createShiprocketOrder(order);
}

export async function assignShiprocketAwb(shipmentId: string | number) {
  const data = await shiprocketRequest("/courier/assign/awb", {
    method: "POST",
    body: { shipment_id: Number(shipmentId) || shipmentId }
  });

  const response = data.response?.data || data;
  const awb = response.awb_code || response.awb || data.awb_code || "";
  const courier = response.courier_name || response.courier_company_name || data.courier_name || "";
  const trackingUrl = getTrackingUrl(awb);

  await Shipment.findOneAndUpdate(
    { shiprocketShipmentId: String(shipmentId) },
    {
      awbNumber: awb,
      courierName: courier,
      trackingUrl,
      shiprocketPayload: data,
      updatedAt: new Date().toISOString()
    }
  );

  await Order.findOneAndUpdate(
    { shiprocketShipmentId: String(shipmentId) },
    {
      awb,
      courier,
      trackingId: awb,
      trackingUrl,
      shipmentStatus: "Pending Pickup",
      shippingStatus: "AWB Assigned"
    }
  );

  return data;
}

export async function generateShiprocketLabel(shipmentId: string | number) {
  const data = await shiprocketRequest("/courier/generate/label", {
    method: "POST",
    body: { shipment_id: [Number(shipmentId) || shipmentId] }
  });

  const labelUrl = data.label_url || data.labelUrl || data.response?.label_url || "";
  await Shipment.findOneAndUpdate(
    { shiprocketShipmentId: String(shipmentId) },
    {
      labelUrl,
      shiprocketPayload: data,
      updatedAt: new Date().toISOString()
    }
  );

  return data;
}

export async function generateShiprocketInvoice(orderIds: Array<string | number>) {
  return shiprocketRequest("/orders/print/invoice", {
    method: "POST",
    body: { ids: orderIds.map((id) => Number(id) || id) }
  });
}

export async function trackShiprocketShipment(awb: string) {
  return shiprocketRequest(`/courier/track/awb/${encodeURIComponent(awb)}`);
}

export async function cancelShiprocketOrders(orderIds: Array<string | number>) {
  const data = await shiprocketRequest("/orders/cancel", {
    method: "POST",
    body: { ids: orderIds.map((id) => Number(id) || id) }
  });

  await Shipment.updateMany(
    { shiprocketOrderId: { $in: orderIds.map(String) } },
    {
      shipmentStatus: "Cancelled",
      shiprocketStatus: "Cancelled",
      updatedAt: new Date().toISOString()
    }
  );

  await Order.updateMany(
    { shiprocketOrderId: { $in: orderIds.map(String) } },
    {
      shipmentStatus: "Cancelled",
      shippingStatus: "Cancelled"
    }
  );

  return data;
}

export async function applyShiprocketWebhook(payload: any) {
  const awb = payload.awb || payload.awb_code || payload.awbNumber;
  const shipmentId = payload.shipment_id || payload.shipmentId;
  const orderId = payload.order_id || payload.orderId;
  const status = payload.current_status || payload.shipment_status || payload.status || "Updated";
  const trackingUrl = awb ? getTrackingUrl(String(awb)) : undefined;
  const query = awb
    ? { awbNumber: String(awb) }
    : shipmentId
      ? { shiprocketShipmentId: String(shipmentId) }
      : { shiprocketOrderId: String(orderId) };

  const shipment = await Shipment.findOneAndUpdate(
    query,
    {
      shiprocketStatus: status,
      shipmentStatus: status,
      trackingUrl,
      shiprocketPayload: payload,
      updatedAt: new Date().toISOString()
    },
    { new: true }
  );

  await Order.findOneAndUpdate(
    awb ? { awb: String(awb) } : shipmentId ? { shiprocketShipmentId: String(shipmentId) } : { shiprocketOrderId: String(orderId) },
    {
      shippingStatus: status,
      shipmentStatus: status,
      trackingUrl
    }
  );

  return shipment;
}
