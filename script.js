const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");

hamburger.addEventListener("click", () => {
  const expanded = hamburger.getAttribute("aria-expanded") === "true";
  hamburger.setAttribute("aria-expanded", !expanded);
  menu.classList.toggle("show");
});

function highlightActiveMenu() {
  const currentPage = window.location.pathname.split("/").pop();
  const queryParams = new URLSearchParams(window.location.search);
  const category = queryParams.get("category");

  const menuItems = document.querySelectorAll(".navbar-menu a");
  menuItems.forEach((item) => item.classList.remove("active"));

  if (currentPage === "index.html" || currentPage === "") {
    document.querySelector("#home a").classList.add("active");
  } else if (currentPage === "shop.html" && category) {
    const categoryItem = document.querySelector(`#${category} a`);
    if (categoryItem) {
      categoryItem.classList.add("active");
    }
  } else if (currentPage === "shop.html") {
    document.querySelector("#women a").classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", highlightActiveMenu);

// shop.html JS

let products = [];
let filteredProducts = [];
let visibleProductsCount = 10;
let cartCount = 0;
// Fetch products from the API
async function fetchProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    products = await response.json();

    // Simulate stock availability
    products = products.map((product) => ({
      ...product,
      inStock: Math.random() >= 0.5,
    }));

    filteredProducts = [...products];
    if (filteredProducts.length > 0) {
      document.querySelector(
        ".result-items"
      ).innerText = `${filteredProducts.length} Results`;
    }
    if (filteredProducts.length > visibleProductsCount) {
      document.querySelector(".load-more-btn").style.display = "block";
    }
    displayProducts();
    fetchCategories(products);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Fetch categories from the API
async function fetchCategories(products) {
  const allCategories = products.map((product) => product.category);
  const categories = [...new Set(allCategories)];
  displayCategories(categories);
}

// Display categories as checkboxes
function displayCategories(categories) {
  const categoryList = document.getElementById("categoryList");
  categories.forEach((category) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <input type="checkbox" name="category" value="${category}">
      ${category.charAt(0).toUpperCase() + category.slice(1)}
      <span class="checkmark"></span>
    `;
    categoryList.appendChild(label);
  });

  // Add event listeners to checkboxes for filtering products
  document.querySelectorAll('input[name="category"]').forEach((checkbox) => {
    checkbox.addEventListener("change", handleCategoryChange);
    checkbox.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        checkbox.checked = !checkbox.checked;
        handleCategoryChange();
      }
    });
  });
}

// Sort products based on selected option (ascending or descending)
function sortProducts(sortOrder) {
  filteredProducts.sort((a, b) => {
    if (sortOrder === "asc") {
      return a.price - b.price;
    } else {
      return b.price - a.price;
    }
  });
}

// Apply sorting based on the selected option
function applySorting() {
  const sortOrder = document.getElementById("sortOptions").value;
  console.log("sortOrder", sortOrder);
  sortProducts(sortOrder);
  displayProducts();
}

// Search products by name
document.getElementById("searchBar").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm)
  );
  visibleProductsCount = 10;
  displayProducts();
});

// Display products with "Load More" functionality
function displayProducts() {
  const productList = document.getElementById("productList");
  productList.innerHTML = "";
  const productsToShow = filteredProducts.slice(0, visibleProductsCount);

  productsToShow.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.classList.add("product-card");
    productCard.innerHTML = `
    <a href="#">
      <div class="img-sec shimmer"> <!-- Add shimmer class here -->
        <img src="${product.image}" alt="${product.title}" loading="lazy">
      </div>
      <div class="product-desc">
        <h3>${product.title}</h3>
        <p class="price">$${product.price}</p>
        <div class="heart" data-product-id="${product.id}">&#x2764;</div>
      </div>
    </a>`;
    productList.appendChild(productCard);

    // Attach event listener to remove shimmer when image loads
    const img = productCard.querySelector("img");
    img.addEventListener("load", () => {
      const imgSec = productCard.querySelector(".img-sec");
      imgSec.classList.remove("shimmer");
    });
  });

  // Attach click event listeners to hearts
  attachHeartListeners();

  // Show or hide "Load More" button based on remaining products
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  if (filteredProducts.length > visibleProductsCount) {
    loadMoreBtn.style.display = "block";
  } else {
    loadMoreBtn.style.display = "none";
  }
}

// Add event listeners to all hearts for toggling
function attachHeartListeners() {
  const hearts = document.querySelectorAll(".heart");

  hearts.forEach((heart) => {
    heart.addEventListener("click", function () {
      const isActive = heart.classList.contains("active");

      if (isActive) {
        // Remove from cart, decrease count
        cartCount = Math.max(0, cartCount - 1);
        heart.classList.remove("active");
        showToast("Item removed from cart");
      } else {
        // Add to cart, increase count
        cartCount += 1;
        heart.classList.add("active");
        showToast("Item added to cart");
      }

      // Update the cart count in the UI
      document.querySelector(".cart-count").innerText = cartCount;
    });
  });
}

// Function to show toast message
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Load more products when the "Load More" button is clicked
document.getElementById("loadMoreBtn").addEventListener("click", () => {
  visibleProductsCount += 10;
  displayProducts();
});

// Event listener for sorting option change
document.getElementById("sortOptions").addEventListener("change", applySorting);

//Mobile Category Filter Handling
const mobileCategoryFilter = document.querySelector(".mobile-category-filter");
const categoryList = document.querySelector(".category-list");

mobileCategoryFilter.addEventListener("click", () => {
  mobileCategoryFilter.classList.toggle("active");
  categoryList.style.display =
    categoryList.style.display === "flex" ? "none" : "flex";
});

//Mobile Price Sort Handling
const mobileSortFilter = document.querySelector(".mobile-sort-filter");
let mobileSort = "asc";

mobileSortFilter.addEventListener("click", () => {
  mobileSort = mobileSort === "asc" ? "desc" : "asc";
  const sortButton = document.querySelector(".sort-button");
  sortButton.classList.toggle("asc");
  sortProducts(mobileSort);
  displayProducts();
});

// Initialize page: fetch categories and products
async function init() {
  await fetchProducts();
}

// Call init function on page load
init();

function highlightActiveMenu() {
  // Get the current page and query parameters
  const currentPage = window.location.pathname.split("/").pop();
  const queryParams = new URLSearchParams(window.location.search);
  const category = queryParams.get("category");

  // Remove 'active' class from all menu items
  const menuItems = document.querySelectorAll(".navbar-menu a");
  menuItems.forEach((item) => item.classList.remove("active"));

  // Add 'active' class to the corresponding <a> element based on the current page or category
  if (currentPage === "index.html" || currentPage === "") {
    document.querySelector("#home a").classList.add("active");
  } else if (currentPage === "shop.html" && category) {
    // Highlight the active category in shop.html
    document.querySelector(`#${category} a`).classList.add("active");
  } else if (currentPage === "shop.html") {
    // Default to women if no category is specified in shop.html
    document.querySelector("#women a").classList.add("active");
  }
}

// Call the function when the DOM is loaded
document.addEventListener("DOMContentLoaded", highlightActiveMenu);

//   Update Breadcrumbs

// Function to update the breadcrumb on page load based on the URL
function updateBreadcrumbOnLoad() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || "Category";

  const breadcrumb = document.getElementById("breadcrumb");
  const breadcrumbCategory = breadcrumb.querySelector("li:nth-child(2) a");
  const breadcrumbCurrent = breadcrumb.querySelector("#currentBreadcrumb");

  // Update the second breadcrumb link with the category from the URL
  breadcrumbCategory.innerText =
    category.charAt(0).toUpperCase() + category.slice(1);

  // Set the last breadcrumb to 'Outerwear'
  breadcrumbCurrent.innerText = "Outerwear";
}

// Call the function to update the breadcrumb when the page loads
document.addEventListener("DOMContentLoaded", updateBreadcrumbOnLoad);

// Function to update the banner text and image based on the selected category
function updateBanner() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") || "Men";

  const bannerTitle = document.querySelector(".banner-text h1");
  const bannerImage = document.querySelector(".banner-image img");

  // Update banner title based on the category
  if (category.toLowerCase() === "women") {
    bannerTitle.innerText = "Women's Outerwear";
    bannerImage.src =
      "https://prod-img.thesouledstore.com/public/theSoul/storage/mobile-cms-media-prod/banner-images/hompage.jpg?format=webp&w=1500&dpr=1.0";
  } else if (category.toLowerCase() === "men") {
    bannerTitle.innerText = "Men's Outerwear";
    bannerImage.src =
      "https://prod-img.thesouledstore.com/public/theSoul/storage/mobile-cms-media-prod/banner-images/homepage_copy_3_LZCVKpp.jpg?format=webp&w=1500&dpr=1.0";
  } else if (category.toLowerCase() === "smart-gear") {
    bannerTitle.innerText = "Smart Gear";
    bannerImage.src =
      "https://prod-img.thesouledstore.com/public/theSoul/uploads/themes/8288720240913175044.jpg?format=webp&w=1500&dpr=1.0";
  } else if (category.toLowerCase() === "accessories") {
    bannerTitle.innerText = "Accessories";
    bannerImage.src =
      "https://prod-img.thesouledstore.com/public/theSoul/uploads/catalog/category/catban-220240929112258.jpg?format=webp&w=1500&dpr=1.0";
  } else {
    bannerTitle.innerText = "Outerwear";
    bannerImage.src =
      "https://prod-img.thesouledstore.com/public/theSoul/uploads/themes/8288720240913175044.jpg?format=webp&w=1500&dpr=1.0"; // Set a default image for any other categories
  }
}

// Call the function to update the banner when the page loads
document.addEventListener("DOMContentLoaded", updateBanner);

let selectedCategories = [];
let minPrice = 0;
let maxPrice = Infinity;
let inStockOnly = false;

// Ensure only one definition of handleFilters() exists
function handleFilters() {
  const minPriceInput = document.getElementById("minPrice");
  const maxPriceInput = document.getElementById("maxPrice");

  // Ensure that prices can't be less than 0
  minPrice = Math.max(parseFloat(minPriceInput.value), 0) || 0;
  maxPrice =
    Math.max(parseFloat(maxPriceInput.value), minPrice + 1) || Infinity;

  // Update inStockOnly based on checkbox state
  inStockOnly = document.getElementById("inStock").checked;

  // Update input fields to reflect the validated values
  minPriceInput.value = minPrice;
  maxPriceInput.value = maxPrice;

  applyFilters();
}

function handleCategoryChange() {
  selectedCategories = Array.from(
    document.querySelectorAll('input[name="category"]:checked')
  ).map((checkbox) => checkbox.value);

  applyFilters();
}

// Event listeners for filter inputs
document.getElementById("minPrice").addEventListener("input", handleFilters);
document.getElementById("maxPrice").addEventListener("input", handleFilters);
document.getElementById("inStock").addEventListener("change", handleFilters);

// Apply Filters Function
function applyFilters() {
  filteredProducts = products.filter((product) => {
    const inCategory = selectedCategories.length
      ? selectedCategories.includes(product.category)
      : true;

    const inPriceRange = product.price >= minPrice && product.price <= maxPrice;

    // Check if the product is in stock
    const isAvailable = inStockOnly ? product.inStock === true : true;

    return inCategory && inPriceRange && isAvailable;
  });

  visibleProductsCount = 10;
  applySorting();
  displayProducts();
}
