import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Login from "./Login.jsx";

const API_URL = "https://recipe-app-q8bi.onrender.com/api/recipes";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );
  const userName = localStorage.getItem("userName");
  const userId = localStorage.getItem("userId");
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);

const [showFavorites, setShowFavorites] = useState(false);

  const [form, setForm] = useState({
  title: "",
  ingredients: "",
  instructions: "",
  cookingTime: "",
  image: null,
});

  const [editingId, setEditingId] = useState(null);

  const getRecipes = async () => {
  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setRecipes(res.data);
  } catch (error) {
    console.log("Error getting recipes:", error);
  }
};

  useEffect(() => {
  if (isLoggedIn) {
    getRecipes();
  }
}, [isLoggedIn]);
useEffect(() => {
  if (!isLoggedIn || !userId) {
    setFavorites([]);
    return;
  }

  const savedFavorites =
    JSON.parse(localStorage.getItem(`favorites_${userId}`)) || [];

  setFavorites(savedFavorites);
}, [isLoggedIn, userId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("ingredients", form.ingredients);
    formData.append("instructions", form.instructions);
    formData.append("cookingTime", form.cookingTime);

    if (form.image) {
      formData.append("image", form.image);
    }

    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setEditingId(null);
    } else {
      await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
    }

    setForm({
      title: "",
      ingredients: "",
      instructions: "",
      cookingTime: "",
      image: null,
    });

    getRecipes();

    alert("Recipe saved successfully! 🎉");

  } catch (error) {
    console.log("FULL ERROR:", error.response?.data || error);
    alert(error.response?.data?.message || "Error saving recipe");
  }
};
  const handleEdit = (recipe) => {
    setForm({
      title: recipe.title,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cookingTime: recipe.cookingTime,
      image: null,
    });

    setEditingId(recipe._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (recipeId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this recipe?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/${recipeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Recipe deleted successfully");

      getRecipes();
    } catch (error) {
      console.log(
        "DELETE ERROR:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Error deleting recipe"
      );
    }
  };

  // Search + matching recipes first
  const filteredRecipes = recipes
  .filter((recipe) => {
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesFavorite = showFavorites
      ? favorites.includes(recipe._id)
      : true;

    return matchesSearch && matchesFavorite;
  })
    .sort((a, b) => {
      if (!search) return 0;

      const aMatch = a.title
        .toLowerCase()
        .startsWith(search.toLowerCase());

      const bMatch = b.title
        .toLowerCase()
        .startsWith(search.toLowerCase());

      return bMatch - aMatch;
    });
if (!isLoggedIn) {
  return <Login onLogin={() => setIsLoggedIn(true)} />;
}
const handleLogout = () => {
  localStorage.removeItem("token");
  setIsLoggedIn(false);
  setFavorites([]);
  setShowFavorites(false);
};
const toggleFavorite = (recipeId) => {
  const userId = localStorage.getItem("userId");

  setFavorites((currentFavorites) => {
    let updatedFavorites;

    if (currentFavorites.includes(recipeId)) {
      updatedFavorites = currentFavorites.filter(
        (id) => id !== recipeId
      );
    } else {
      updatedFavorites = [...currentFavorites, recipeId];
    }

    localStorage.setItem(
      `favorites_${userId}`,
      JSON.stringify(updatedFavorites)
    );

    return updatedFavorites;
  });
};
  return (
    <div className="app">

      {/* HEADER */}
      <header className="hero">
        <div className="hero-content">
          <div className="logo">🍳</div>

          <h1>Recipe Hub</h1>

          <p>
            Welcome, {userName}! 👋 Discover delicious recipes and create your own favourites.
          </p>
          <button onClick={handleLogout} className="logout-btn">
  Logout 🚪
</button>
        </div>
      </header>

      <main className="container">

        {/* SEARCH */}
        <section className="search-section">
          <h2>What are you cooking today? 👩‍🍳</h2>

          <div className="search-box">
            <span className="search-icon">🔍</span>

            <input
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>
          <div className="recipe-filter">
  <button
    onClick={() => setShowFavorites(false)}
    className={!showFavorites ? "active-filter" : ""}
  >
    All Recipes
  </button>

  <button
    onClick={() => setShowFavorites(true)}
    className={showFavorites ? "active-filter" : ""}
  >
    ❤️ Favorites
  </button>
</div>

          <p className="recipe-count">
            {search
              ? `${filteredRecipes.length} recipe(s) found`
              : `${recipes.length} recipe(s) available`}
          </p>
        </section>

        {/* ADD / EDIT RECIPE */}
        <section className="form-section">
          <h2>
            {editingId ? "✏️ Edit Recipe" : "➕ Add a New Recipe"}
          </h2>

          <form onSubmit={handleSubmit} className="recipe-form">

            <input
              type="text"
              name="title"
              placeholder="🍕 Recipe Title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <textarea
              name="ingredients"
              placeholder="🥕 Ingredients"
              value={form.ingredients}
              onChange={handleChange}
              required
            />

            <textarea
              name="instructions"
              placeholder="👩‍🍳 Cooking Instructions"
              value={form.instructions}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="cookingTime"
              placeholder="⏱️ Cooking Time (minutes)"
              value={form.cookingTime}
              onChange={handleChange}
              required
            />
            <div className="image-upload">
  <label>📷 Recipe Image</label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setForm({
        ...form,
        image: e.target.files[0],
      })
    }
  />
</div>

            <button type="submit" className="submit-btn">
              {editingId ? "Update Recipe ✨" : "Add Recipe 🍴"}
            </button>

            {editingId && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    title: "",
                    ingredients: "",
                    instructions: "",
                    cookingTime: "",
                  });
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </section>

        {/* RECIPES */}
        <section className="recipes-section">

          <div className="section-title">
            <h2>🍽️ Your Recipes</h2>
          </div>

          {filteredRecipes.length === 0 ? (
            <div className="no-results">
              <div>🍳</div>
              <h2>No recipes found</h2>
              <p>Try searching for another recipe.</p>
            </div>
          ) : (
            <div className="recipe-list">

              {filteredRecipes.map((recipe) => (
                <div className="recipe-card" key={recipe._id}>

                 <div className="recipe-image">
  {recipe.image ? (
    <img
      src={recipe.image}
      alt={recipe.title}
    />
  ) : (
    "🍳"
  )}
</div>

                  <h2>{recipe.title}</h2>

                  <div className="recipe-info">
                    <span>⏱️ {recipe.cookingTime} mins</span>
                  </div>

                  <div className="recipe-content">

                  <div>
  <div className="ingredients-header">
    <h3>🥕 Ingredients</h3>

    <button
      className="favorite-btn"
      onClick={() => toggleFavorite(recipe._id)}
    >
      {favorites.includes(recipe._id) ? "❤️" : "🤍"}
    </button>
  </div>

  <p>{recipe.ingredients}</p>
</div>

                    <div>
                      <h3>👩‍🍳 Instructions</h3>
                      <p>{recipe.instructions}</p>
                    </div>

                  </div>

                  <div className="card-actions">

                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(recipe)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(recipe._id)}
                    >
                      🗑️ Delete
                    </button>
                    <button
  className="favorite-btn"
  onClick={() => toggleFavorite(recipe._id)}
>
  {favorites.includes(recipe._id) ? "❤️ Favorited" : "🤍 Favorite"}
</button>

                  </div>

                </div>
              ))}

            </div>
          )}
        </section>

      </main>

      <footer>
        <p>Made with ❤️ for food lovers</p>
      </footer>

    </div>
  );
}

export default App;