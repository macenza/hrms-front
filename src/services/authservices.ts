const BASE_URL = "http://localhost:5000"; // backend URL (change if needed)

// 🔐 LOGIN API
export const loginUser = async (data: any) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

// 📝 REGISTER API
export const registerUser = async (data: any) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};