fetch('http://localhost:5000/api/shiprocket/serviceability?delivery_postcode=123456&weight=0.5')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
