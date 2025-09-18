export async function fetchIngredients() {
  try {
    const response = await fetch("https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list");
    const data = await response.json();

    // Transform to match your CardComponent props
    const ingredients = data.drinks.map((item, index) => ({
      _id: index,
      name: item.strIngredient1,
      description: "", // No description from API
      unit: "",        // No unit from API
      quantity: 1,     // Default quantity
      imageUrl: `https://www.thecocktaildb.com/images/ingredients/${item.strIngredient1}-Medium.png`
    }));

    return ingredients;
  } catch (err) {
    console.error("Error fetching ingredients:", err);
    throw err;
  }
}
