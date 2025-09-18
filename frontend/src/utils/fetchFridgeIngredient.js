const fetchFridgeIngredients = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${VITE_API_URL}/api/fridge`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data.map(item => item.name.toLowerCase()); // ['vodka', 'lime juice', ...]
  };
  