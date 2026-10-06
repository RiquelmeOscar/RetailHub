const BASE = process.env.API_URL ?? "http://localhost:3001";
const ADMIN = { email: "admin@retailhub.dev", password: "admin123" };
const OPERATOR = { email: "operator@retailhub.dev", password: "operator123" };
const SMOKE_SKU = "SMOKE-TEST";
const MISSING_ID = "00000000-0000-0000-0000-000000000000";

let passed = 0;
const failures = [];

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failures.push({ name, detail });
    console.log(`  FAIL  ${name}${detail ? ` -> ${detail}` : ""}`);
  }
}

function hasErrorShape(body) {
  return typeof body?.error?.code === "string" && typeof body?.error?.message === "string";
}

async function req(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, body: json };
}

const login = (creds) => req("POST", "/api/auth/login", { body: creds });

async function findSmokeProduct(token) {
  const res = await req("GET", `/api/products?search=${SMOKE_SKU}`, { token });
  if (res.status !== 200 || !Array.isArray(res.body)) return null;
  return res.body.find((p) => p.sku === SMOKE_SKU) ?? null;
}

async function getStock(token) {
  const product = await findSmokeProduct(token);
  return product ? product.stock : null;
}

async function main() {
  console.log(`Smoke RetailHub contra ${BASE}\n`);

  console.log("Auth");
  const adminLogin = await login(ADMIN);
  check("login admin -> 200", adminLogin.status === 200, `status ${adminLogin.status}`);
  check("login admin devuelve token y rol", typeof adminLogin.body?.token === "string" && adminLogin.body?.user?.role === "admin");
  const adminToken = adminLogin.body?.token;

  const badLogin = await login({ email: ADMIN.email, password: "wrong-password" });
  check("login inválido -> 401 INVALID_CREDENTIALS", badLogin.status === 401 && badLogin.body?.error?.code === "INVALID_CREDENTIALS");
  check("error de login respeta shape", hasErrorShape(badLogin.body));

  const opLogin = await login(OPERATOR);
  check("login operator -> 200 rol operator", opLogin.status === 200 && opLogin.body?.user?.role === "operator");
  const opToken = opLogin.body?.token;

  const noToken = await req("GET", "/api/products");
  check("productos sin token -> 401 UNAUTHORIZED", noToken.status === 401 && noToken.body?.error?.code === "UNAUTHORIZED");

  const badToken = await req("GET", "/api/products", { token: "not-a-token" });
  check("token inválido -> 401 UNAUTHORIZED", badToken.status === 401 && badToken.body?.error?.code === "UNAUTHORIZED");

  console.log("\nProductos");
  const list = await req("GET", "/api/products", { token: adminToken });
  check("listar productos -> 200 array", list.status === 200 && Array.isArray(list.body));

  const seedSearch = await req("GET", "/api/products?search=SKU-001", { token: adminToken });
  check("búsqueda SKU-001 encuentra seed", Array.isArray(seedSearch.body) && seedSearch.body.some((p) => p.sku === "SKU-001"), "¿corriste npm run db:seed?");

  const opCreate = await req("POST", "/api/products", {
    token: opToken,
    body: { sku: `SMOKE-OP-${Date.now()}`, name: "No permitido", category: "QA", price: 1, stock: 0 },
  });
  check("operator crea producto -> 403 FORBIDDEN", opCreate.status === 403 && opCreate.body?.error?.code === "FORBIDDEN");

  const invalid = await req("POST", "/api/products", {
    token: adminToken,
    body: { sku: "SMOKE-INVALID", name: "Precio inválido", category: "QA", price: -1 },
  });
  check("producto inválido -> 400 VALIDATION_ERROR", invalid.status === 400 && invalid.body?.error?.code === "VALIDATION_ERROR");
  check("error de validación respeta shape", hasErrorShape(invalid.body));

  let product = await findSmokeProduct(adminToken);
  if (!product) {
    const created = await req("POST", "/api/products", {
      token: adminToken,
      body: { sku: SMOKE_SKU, name: "Producto de smoke", category: "QA", price: 10, stock: 0 },
    });
    check("crear producto smoke -> 201", created.status === 201, `status ${created.status}`);
    product = created.body;
  } else {
    check("producto smoke reutilizado", true);
  }
  const productId = product?.id;

  const duplicate = await req("POST", "/api/products", {
    token: adminToken,
    body: { sku: SMOKE_SKU, name: "Duplicado", category: "QA", price: 10, stock: 0 },
  });
  check("SKU duplicado -> 409 DUPLICATE_SKU", duplicate.status === 409 && duplicate.body?.error?.code === "DUPLICATE_SKU");

  console.log("\nInventario");
  const stockBeforeIn = await getStock(adminToken);
  const movementIn = await req("POST", "/api/inventory/movements", {
    token: adminToken,
    body: { productId, type: "IN", quantity: 5 },
  });
  check("movimiento IN -> 201", movementIn.status === 201, `status ${movementIn.status}`);
  const stockAfterIn = await getStock(adminToken);
  check("IN incrementa stock en 5", stockAfterIn === stockBeforeIn + 5, `${stockBeforeIn} -> ${stockAfterIn}`);

  const movementOutTooMuch = await req("POST", "/api/inventory/movements", {
    token: adminToken,
    body: { productId, type: "OUT", quantity: stockAfterIn + 1 },
  });
  check("OUT mayor al stock -> 409 INSUFFICIENT_STOCK", movementOutTooMuch.status === 409 && movementOutTooMuch.body?.error?.code === "INSUFFICIENT_STOCK");

  const movements = await req("GET", "/api/inventory/movements", { token: adminToken });
  check("listar movimientos -> 200 array con producto y usuario", movements.status === 200 && Array.isArray(movements.body) && movements.body.every((m) => m.product && m.user));

  console.log("\nÓrdenes");
  const price = Number(product?.price);
  const stockBeforeOrder = await getStock(adminToken);

  const created = await req("POST", "/api/orders", { token: adminToken, body: { items: [{ productId, quantity: 2 }] } });
  check("crear orden -> 201 PENDING", created.status === 201 && created.body?.status === "PENDING", `status ${created.status}`);
  check("total calculado en servidor", Number(created.body?.total).toFixed(2) === (price * 2).toFixed(2), `${created.body?.total} vs ${(price * 2).toFixed(2)}`);
  const orderId = created.body?.id;

  const confirmed = await req("POST", `/api/orders/${orderId}/confirm`, { token: adminToken });
  check("confirmar orden -> CONFIRMED", confirmed.status === 200 && confirmed.body?.status === "CONFIRMED");
  const stockAfterConfirm = await getStock(adminToken);
  check("confirmar descuenta stock", stockAfterConfirm === stockBeforeOrder - 2, `${stockBeforeOrder} -> ${stockAfterConfirm}`);

  const doubleConfirm = await req("POST", `/api/orders/${orderId}/confirm`, { token: adminToken });
  check("doble confirmación -> 409 INVALID_STATE", doubleConfirm.status === 409 && doubleConfirm.body?.error?.code === "INVALID_STATE");

  const order2 = await req("POST", "/api/orders", { token: opToken, body: { items: [{ productId, quantity: 1 }] } });
  await req("POST", `/api/orders/${order2.body?.id}/confirm`, { token: opToken });
  const stockBeforeCancel = await getStock(adminToken);
  const cancelled = await req("POST", `/api/orders/${order2.body?.id}/cancel`, { token: opToken });
  check("cancelar CONFIRMED -> CANCELLED", cancelled.status === 200 && cancelled.body?.status === "CANCELLED");
  const stockAfterCancel = await getStock(adminToken);
  check("cancelar repone stock", stockAfterCancel === stockBeforeCancel + 1, `${stockBeforeCancel} -> ${stockAfterCancel}`);

  const doubleCancel = await req("POST", `/api/orders/${order2.body?.id}/cancel`, { token: opToken });
  check("doble cancelación -> 409 INVALID_STATE", doubleCancel.status === 409 && doubleCancel.body?.error?.code === "INVALID_STATE");

  const missing = await req("GET", `/api/orders/${MISSING_ID}`, { token: adminToken });
  check("orden inexistente -> 404 NOT_FOUND", missing.status === 404 && missing.body?.error?.code === "NOT_FOUND");

  const invalidOrder = await req("POST", "/api/orders", { token: adminToken, body: { items: [] } });
  check("orden sin ítems -> 400 VALIDATION_ERROR", invalidOrder.status === 400 && invalidOrder.body?.error?.code === "VALIDATION_ERROR");

  console.log("\nSalud del servicio");
  const health = await req("GET", "/api/health");
  if (health.status === 404) {
    console.log("  WARN  GET /api/health no existe todavía (ítem FEAT-01 del backlog)");
  } else {
    check("GET /api/health -> 200 status ok", health.status === 200 && health.body?.status === "ok");
  }

  console.log(`\nResultado: ${passed} pass, ${failures.length} fail`);
  if (failures.length > 0) {
    for (const f of failures) console.log(`  - ${f.name}${f.detail ? ` (${f.detail})` : ""}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\nNo se pudo completar el smoke: ${err.message}`);
  console.error(`¿Está la API corriendo en ${BASE}?`);
  process.exit(2);
});
