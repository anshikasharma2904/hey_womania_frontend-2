const mongoose = require("mongoose");

async function testDocs() {
  await mongoose.connect("mongodb://localhost:27017/heywomania");
  const tokenDoc = await mongoose.connection.collection("zohotokens").findOne({});
  const token = tokenDoc.accessToken;
  const apiDomain = tokenDoc.apiDomain;
  const orgId = "60077160313";

  // Test 1: /items/:itemId/attachment
  let res = await fetch(`${apiDomain}/items/3919602000000044029/attachment?organization_id=${orgId}`, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
  console.log("Test 1 (/items/:itemId/attachment):", res.status);

  // Test 2: /documents/:docId
  res = await fetch(`${apiDomain}/documents/3919602000000044037?organization_id=${orgId}`, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
  console.log("Test 2 (/documents/:docId):", res.status, await res.text());

  // Test 3: /items/:itemId/images/:docId
  res = await fetch(`${apiDomain}/items/3919602000000044029/images/3919602000000044037?organization_id=${orgId}`, { headers: { Authorization: `Zoho-oauthtoken ${token}` } });
  console.log("Test 3 (/items/:itemId/images/:docId):", res.status);
  
  process.exit(0);
}
testDocs();
