export async function addToFridge(ingredient) {
    const token = localStorage.getItem("token");
  
    const payload = {
      name: ingredient.name,
      imageUrl: ingredient.imageUrl,
      quantity: 1,
      unit: ingredient.unit || ""
    };
  
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/fridge`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
  
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to add to fridge");
    }
  
    return await res.json();
  }
  