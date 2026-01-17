// product-filter.js
// Industry-standard product filter component for Shopify

const filterTemplate = document.createElement("template");
filterTemplate.innerHTML = /*html*/`
<style>
  :host {
    display: block;
    margin-bottom: 40px;
    font-family: var(--font-body-family, sans-serif);
  }

  .filter-container {
    background: #ffffff;
    padding: 24px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 15px;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .filter-title {
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0;
  }
  
  .product-count {
    font-size: 13px;
    color: #666;
    font-weight: 500;
  }

  .search-box {
    position: relative;
    max-width: 300px;
    width: 100%;
  }

  .search-input {
    width: 100%;
    padding: 10px 16px;
    padding-right: 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 14px;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .search-input:focus {
    outline: none;
    border-color: #000;
    box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
  }

  .search-icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
    pointer-events: none;
  }

  .filter-group {
    margin-bottom: 20px;
  }

  .filter-label {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 600;
  }

  .category-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .category-btn {
    padding: 8px 16px;
    border: 1px solid #e0e0e0;
    background: white;
    color: #4a4a4a;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
    user-select: none;
  }

  .category-btn:hover {
    border-color: #000;
    color: #000;
    transform: translateY(-1px);
  }

  .category-btn.active {
    background: #000;
    color: white;
    border-color: #000;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  }

  .price-slider-container {
    margin-top: 12px;
  }

  .price-inputs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .price-display {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .price-separator {
    color: #999;
    margin: 0 8px;
  }

  .slider-track {
    position: relative;
    height: 6px;
    background: #e0e0e0;
    border-radius: 3px;
    margin: 10px 0;
  }

  .price-slider {
    position: absolute;
    width: 100%;
    height: 6px;
    background: transparent;
    pointer-events: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .price-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #000;
    border: 2px solid white;
    border-radius: 50%;
    cursor: pointer;
    pointer-events: all;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }

  .price-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .price-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #000;
    border: 2px solid white;
    border-radius: 50%;
    cursor: pointer;
    pointer-events: all;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: transform 0.2s;
  }

  .price-slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }

  .filter-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    padding-top: 15px;
    border-top: 1px solid #f0f0f0;
  }

  .btn-reset {
    background: none;
    border: none;
    color: #666;
    text-decoration: underline;
    cursor: pointer;
    font-size: 13px;
    padding: 5px 10px;
    transition: color 0.2s;
  }

  .btn-reset:hover {
    color: #000;
  }

  @media (max-width: 600px) {
    .filter-header {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-box {
      max-width: 100%;
    }
  }
</style>

<div class="filter-container">
  <div class="filter-header">
    <div class="header-left">
      <h3 class="filter-title">Filter Products</h3>
      <span class="product-count" id="product-count-display"></span>
    </div>
    
    <div class="search-box">
      <input type="text" class="search-input" id="search-input" placeholder="Search products...">
      <span class="search-icon">🔍</span>
    </div>
  </div>

  <div class="filter-group">
    <span class="filter-label">Categories</span>
    <div class="category-buttons" id="category-buttons-container">
      <button class="category-btn active" data-category="all">All Items</button>
      <!-- Category buttons injected here -->
    </div>
  </div>

  <div class="filter-group">
    <span class="filter-label">Price Range</span>
    <div class="price-slider-container">
      <div class="price-inputs">
        <span class="price-display" id="min-price-display">$0</span>
        <span class="price-separator">—</span>
        <span class="price-display" id="max-price-display">$500</span>
      </div>
      <div class="slider-track">
        <input type="range" class="price-slider" id="min-price-slider" min="0" max="500" value="0" step="5">
        <input type="range" class="price-slider" id="max-price-slider" min="0" max="500" value="500" step="5">
      </div>
    </div>
  </div>

  <div class="filter-actions">
    <button class="btn-reset" id="reset-btn">Clear all filters</button>
  </div>
</div>
`;

class ProductFilter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    /** @type {string[]} */
    this.selectedCategories = [];

    /** @type {Array<any>} */
    this.allProducts = [];

    /** @type {string} */
    this.searchQuery = "";

    /** @type {HTMLInputElement|null} */
    this.searchInput = null;

    /** @type {number} */
    this.minPrice = 0;

    /** @type {number} */
    this.maxPrice = 500;

    /** @type {{min: number, max: number}} */
    this.priceRange = { min: 0, max: 500 };
  }

  static get observedAttributes() {
    return ["data-products"];
  }

  /**
   * @param {string} name
   * @param {string|null} oldValue
   * @param {string|null} newValue
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "data-products" && newValue !== oldValue && newValue) {
      try {
        console.log("🔄 Data updated in filter component");
        this.allProducts = JSON.parse(newValue);
        this.calculatePriceRange();
        this.initializeFilters();
      } catch (error) {
        console.error("Error parsing products data in attributeChangedCallback:", error);
      }
    }
  }

  connectedCallback() {
    if (!this.shadowRoot) return;
    this.shadowRoot.appendChild(filterTemplate.content.cloneNode(true));

    // Get products from data attribute
    const productsData = this.getAttribute("data-products");
    if (productsData) {
      try {
        this.allProducts = JSON.parse(productsData);
        this.calculatePriceRange();
        this.initializeFilters();
      } catch (error) {
        console.error("Error parsing products data:", error);
      }
    }

    this.setupEventListeners();
  }

  calculatePriceRange() {
    if (this.allProducts.length === 0) return;

    const prices = this.allProducts.map(p => parseFloat(p.price) || 0);
    this.priceRange.min = Math.floor(Math.min(...prices));
    this.priceRange.max = Math.ceil(Math.max(...prices));

    // Update slider attributes
    const minSlider = /** @type {HTMLInputElement|null} */ (
      this.shadowRoot?.querySelector("#min-price-slider")
    );
    const maxSlider = /** @type {HTMLInputElement|null} */ (
      this.shadowRoot?.querySelector("#max-price-slider")
    );

    if (minSlider && maxSlider) {
      minSlider.min = this.priceRange.min.toString();
      minSlider.max = this.priceRange.max.toString();
      minSlider.value = this.priceRange.min.toString();

      maxSlider.min = this.priceRange.min.toString();
      maxSlider.max = this.priceRange.max.toString();
      maxSlider.value = this.priceRange.max.toString();
    }

    this.minPrice = this.priceRange.min;
    this.maxPrice = this.priceRange.max;

    this.updatePriceDisplay();
  }

  initializeFilters() {
    // Extract unique categories (using 'type' field)
    const categories = new Set();

    this.allProducts.forEach(product => {
      // Only add non-empty product types
      if (product.type && product.type.trim() !== '') {
        categories.add(product.type.trim());
      }
    });

    const buttonsContainer = this.shadowRoot?.querySelector("#category-buttons-container");
    if (!buttonsContainer) return;

    const sortedCategories = Array.from(categories).sort();

    console.log('🏷️ Categories found:', sortedCategories);

    sortedCategories.forEach((category) => {
      const btn = document.createElement("button");
      btn.className = "category-btn";
      btn.textContent = category;
      btn.setAttribute("data-category", category);

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleCategory(category, btn);
      });

      buttonsContainer.appendChild(btn);
    });
  }

  setupEventListeners() {
    // Search Input
    this.searchInput = /** @type {HTMLInputElement} */ (this.shadowRoot?.querySelector("#search-input"));
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        this.searchQuery = target.value.trim().toLowerCase();
        this.applyFilters();
      });
    }

    // Price Sliders
    const minSlider = this.shadowRoot?.querySelector("#min-price-slider");
    const maxSlider = this.shadowRoot?.querySelector("#max-price-slider");

    if (minSlider) {
      minSlider.addEventListener("input", (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        this.minPrice = parseInt(target.value);
        if (this.minPrice > this.maxPrice) {
          this.minPrice = this.maxPrice;
          target.value = this.minPrice.toString();
        }
        this.updatePriceDisplay();
        this.applyFilters();
      });
    }

    if (maxSlider) {
      maxSlider.addEventListener("input", (e) => {
        const target = /** @type {HTMLInputElement} */ (e.target);
        this.maxPrice = parseInt(target.value);
        if (this.maxPrice < this.minPrice) {
          this.maxPrice = this.minPrice;
          target.value = this.maxPrice.toString();
        }
        this.updatePriceDisplay();
        this.applyFilters();
      });
    }

    // "All" button
    const allBtn = this.shadowRoot?.querySelector('[data-category="all"]');
    if (allBtn) {
      allBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.resetFilters();
      });
    }

    // Reset button
    const resetBtn = this.shadowRoot?.querySelector("#reset-btn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetFilters());
    }
  }

  updatePriceDisplay() {
    const minDisplay = this.shadowRoot?.querySelector("#min-price-display");
    const maxDisplay = this.shadowRoot?.querySelector("#max-price-display");

    if (minDisplay) minDisplay.textContent = `$${this.minPrice}`;
    if (maxDisplay) maxDisplay.textContent = `$${this.maxPrice}`;
  }

  /**
   * @param {number} count
   */
  updateCount(count) {
    const countDisplay = this.shadowRoot?.querySelector("#product-count-display");
    if (countDisplay) {
      countDisplay.textContent = `${count} products`;
    }
  }

  toggleCategory(/** @type {string} */ category, /** @type {HTMLElement} */ btnElement) {
    const index = this.selectedCategories.indexOf(category);

    if (index > -1) {
      // Remove category
      this.selectedCategories.splice(index, 1);
      btnElement.classList.remove("active");
    } else {
      // Add category
      this.selectedCategories.push(category);
      btnElement.classList.add("active");
    }

    // Handle "All" button state
    const allBtn = this.shadowRoot?.querySelector('[data-category="all"]');
    if (allBtn) {
      if (this.selectedCategories.length === 0) {
        allBtn.classList.add("active");
      } else {
        allBtn.classList.remove("active");
      }
    }

    this.applyFilters();
  }

  applyFilters() {
    const filterData = {
      categories: this.selectedCategories,
      search: this.searchQuery,
      priceMin: this.minPrice,
      priceMax: this.maxPrice
    };

    console.log("Applying filters:", filterData);

    this.dispatchEvent(
      new CustomEvent("filter-applied", {
        detail: filterData,
        bubbles: true,
        composed: true,
      })
    );
  }

  resetFilters() {
    this.selectedCategories = [];
    this.searchQuery = "";
    this.minPrice = this.priceRange.min;
    this.maxPrice = this.priceRange.max;

    // Reset UI
    if (this.searchInput) this.searchInput.value = "";

    const minSlider = /** @type {HTMLInputElement|null} */ (this.shadowRoot?.querySelector("#min-price-slider"));
    const maxSlider = /** @type {HTMLInputElement|null} */ (this.shadowRoot?.querySelector("#max-price-slider"));
    if (minSlider) minSlider.value = this.priceRange.min.toString();
    if (maxSlider) maxSlider.value = this.priceRange.max.toString();

    this.updatePriceDisplay();

    const buttons = this.shadowRoot?.querySelectorAll(".category-btn");
    if (buttons) {
      buttons.forEach(btn => btn.classList.remove("active"));
    }

    const allBtn = this.shadowRoot?.querySelector('[data-category="all"]');
    if (allBtn) allBtn.classList.add("active");

    this.dispatchEvent(
      new CustomEvent("filter-reset", {
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define("product-filter", ProductFilter);
