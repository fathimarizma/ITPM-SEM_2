(async () => {
  try {
    const login = await fetch('http://127.0.0.1:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'it23343253@my.sliit.lk', password: 'password123' })
    });
    
    // Extract token from JSON instead
    const authData = await login.json();
    console.log("Auth success?", authData.success);
    
    // Some apps use Bearer tokens instead or alongside cookies
    let cookieStr = login.headers.get('set-cookie');
    
    const payload = {
      bio: "Computing student looking for roommates",
      whatsappNumber: "0771234567",
      genderPreference: "Male",
      budgetRange: { min: 10000, max: 25000 },
      habits: { nonSmoker: true, studyPreference: "Quiet" },
      location: "Malabe"
    };
    
    console.log("sending payload");
    const res = await fetch('http://127.0.0.1:5001/api/roommates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieStr || ''
      },
      body: JSON.stringify(payload)
    });
    console.log("Success! status:", res.status);
    console.log(await res.text());
  } catch (error) {
    console.log("Network/Other Error:", error.message);
  }
})();
