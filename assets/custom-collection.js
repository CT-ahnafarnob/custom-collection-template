// ============= GLOBAL FUNCTIONS =============

// Update cart count across all cart count elements
function updateCartCount() {
  fetch("/cart.js")
    .then((response) => response.json())
    .then((cart) => {
      const cartCount = cart.item_count;

      // Update cart count bubbles
      const cartCountBubbles = document.querySelectorAll(".cart-count-bubble");
      cartCountBubbles.forEach((bubble) => {
        bubble.textContent = cartCount;
        if (cartCount > 0) {
          bubble.style.display = "flex";
        }
      });

      // Update other cart count elements
      document.querySelectorAll("[data-cart-count]").forEach((el) => {
        el.textContent = cartCount;
      });

      console.log("Cart updated:", cartCount, "items");
    })
    .catch((error) => {
      console.error("Error updating cart:", error);
    });
}

// Attach event listeners to all add-to-cart buttons
function attachAddToCartListeners() {
  const addToCartButtons = document.querySelectorAll(
    ".add-to-cart-btn:not(.add-to-cart-link):not(.add-to-cart-sold-out)"
  );

  addToCartButtons.forEach((button) => {
    // Clone button to remove existing event listeners and prevent duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    // Add click event listener to handle cart addition
    newButton.addEventListener("click", function () {
      const variantId = this.getAttribute("data-variant-id");
      this.disabled = true;
      this.textContent = "Adding...";

      // Add product to cart via Shopify Cart API
      fetch("/cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: variantId,
          quantity: 1,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          this.textContent = "Added to Cart";
          setTimeout(() => {
            this.disabled = false;
            this.textContent = "Add to Cart";
          }, 2000);

          // Update cart count display
          updateCartCount();

          // Trigger theme cart refresh event for theme compatibility
          document.documentElement.dispatchEvent(
            new CustomEvent("cart:refresh")
          );
        })
        .catch((error) => {
          console.error("Error:", error);
          this.disabled = false;
          this.textContent = "Error";
          setTimeout(() => {
            this.textContent = "Add to Cart";
          }, 2000);
        });
    });
  });
}

// Close mobile filter sidebar
function closeMobileFilter() {
  const filter = document.querySelector(".filter");
  if (filter && filter.classList.contains("filter-open")) {
    filter.classList.remove("filter-open");
    document.body.style.overflow = "";
  }
}

// ============= MAIN INITIALIZATION =============
document.addEventListener("DOMContentLoaded", function () {
  // Initialize add to cart buttons on page load
  attachAddToCartListeners();

  // ============= AJAX FILTER FUNCTIONALITY =============
  const filterForm = document.getElementById("filterForm");
  const productsContainer = document.querySelector(".products-grid");
  const filterSidebar = document.querySelector(".filter-sidebar");

  if (filterForm && productsContainer) {
    // Apply filters via AJAX without page refresh
    function applyFiltersAjax() {
      const formData = new FormData(filterForm);
      const params = new URLSearchParams(formData);
      const queryString = params.toString();
      const url = `${window.location.pathname}?${queryString}`;

      // Show loading state
      productsContainer.style.opacity = "0.5";
      productsContainer.style.pointerEvents = "none";

      // Fetch filtered products from server
      fetch(url, {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      })
        .then((response) => response.text())
        .then((html) => {
          const parser = new DOMParser();
          const newDoc = parser.parseFromString(html, "text/html");

          // Update products grid with filtered results
          const newProducts = newDoc.querySelector(".products-grid");
          if (newProducts) {
            productsContainer.innerHTML = newProducts.innerHTML;
          }

          // Update pagination section
          const oldPagination = document.querySelector(".pagination");
          const newPagination = newDoc.querySelector(".pagination");

          if (oldPagination && newPagination) {
            oldPagination.innerHTML = newPagination.innerHTML;
          } else if (oldPagination && !newPagination) {
            // Remove pagination if no results or single page
            oldPagination.remove();
          } else if (!oldPagination && newPagination) {
            // Add pagination if it didn't exist before
            const productsWrapper = productsContainer.parentElement;
            if (productsWrapper) {
              productsWrapper.appendChild(newPagination.cloneNode(true));
            }
          }

          // Update product count display (if exists)
          const oldProductCount = document.querySelector(".product-count");
          const newProductCount = newDoc.querySelector(".product-count");

          if (oldProductCount && newProductCount) {
            oldProductCount.innerHTML = newProductCount.innerHTML;
          }

          // Update filter sidebar to reflect new counts and states
          const newFilterSidebar = newDoc.querySelector(".filter-sidebar");
          if (newFilterSidebar && filterSidebar) {
            // Update filter checkboxes and their product counts
            const newCheckboxes = newFilterSidebar.querySelectorAll(
              'input[type="checkbox"]'
            );
            const oldCheckboxes = filterSidebar.querySelectorAll(
              'input[type="checkbox"]'
            );
            newCheckboxes.forEach((newCheckbox, index) => {
              if (oldCheckboxes[index]) {
                // Update label with new product count
                const newLabel = newCheckbox.nextElementSibling;
                const oldLabel = oldCheckboxes[index].nextElementSibling;
                if (newLabel && oldLabel) {
                  oldLabel.innerHTML = newLabel.innerHTML;
                }
                // Preserve checked state
                oldCheckboxes[index].checked = newCheckbox.checked;
              }
            });

            // Update price input values
            const newPriceInputs = newFilterSidebar.querySelectorAll(
              'input[type="number"]'
            );
            const oldPriceInputs = filterSidebar.querySelectorAll(
              'input[type="number"]'
            );
            newPriceInputs.forEach((newInput, index) => {
              if (oldPriceInputs[index]) {
                oldPriceInputs[index].value = newInput.value;
              }
            });

            // Update sort dropdown selection
            const newSortSelect =
              newFilterSidebar.querySelector(".sort-select");
            const oldSortSelect = filterSidebar.querySelector(".sort-select");
            if (newSortSelect && oldSortSelect) {
              oldSortSelect.value = newSortSelect.value;
            }
          }

          // Update active filters display section
          const oldActiveFiltersDiv = filterSidebar.querySelector(
            'div[style*="border-top"]'
          );
          const newActiveFiltersDiv = newFilterSidebar.querySelector(
            'div[style*="border-top"]'
          );

          if (newActiveFiltersDiv) {
            if (oldActiveFiltersDiv) {
              oldActiveFiltersDiv.innerHTML = newActiveFiltersDiv.innerHTML;
            } else {
              filterSidebar.appendChild(newActiveFiltersDiv.cloneNode(true));
            }
          } else if (oldActiveFiltersDiv) {
            oldActiveFiltersDiv.remove();
          }

          // Update clear all filters button visibility
          const oldClearBtn = filterSidebar.querySelector(".clear-all-btn");
          const newClearBtn = newFilterSidebar.querySelector(".clear-all-btn");

          if (newClearBtn && !oldClearBtn) {
            const submitBtn = filterSidebar.querySelector(
              'button[type="submit"]'
            );
            if (submitBtn) {
              submitBtn.parentNode.insertBefore(
                newClearBtn.cloneNode(true),
                submitBtn
              );
            }
          } else if (!newClearBtn && oldClearBtn) {
            oldClearBtn.remove();
          } else if (newClearBtn && oldClearBtn) {
            oldClearBtn.innerHTML = newClearBtn.innerHTML;
          }

          // Remove loading state
          productsContainer.style.opacity = "1";
          productsContainer.style.pointerEvents = "auto";

          // Close mobile filter sidebar after applying filters
          closeMobileFilter();

          // Re-attach all event listeners after content update
          attachFilterListeners();
          attachAddToCartListeners();
          attachClearFilterListeners();
          attachActiveFilterRemoveListeners();
          attachPaginationListeners();

          // Scroll to products section for better UX
          productsContainer.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });

          // Update URL without page refresh for bookmarking and back button support
          window.history.replaceState({}, "", url);
        })
        .catch((error) => {
          console.error("Filter error:", error);
          productsContainer.style.opacity = "1";
          productsContainer.style.pointerEvents = "auto";
          alert("Error applying filters. Please try again.");
        });
    }

    // Check if any filters are currently active
    function hasActiveFilters() {
      // Check for checked checkboxes
      const checkedBoxes = filterForm.querySelectorAll(
        'input[type="checkbox"]:checked'
      );
      if (checkedBoxes.length > 0) return true;

      // Check for price range inputs
      const priceInputs = filterForm.querySelectorAll('input[type="number"]');
      for (let input of priceInputs) {
        if (input.value && input.value.trim() !== "") return true;
      }

      // Check if sort is changed from default
      const sortSelect = filterForm.querySelector(".sort-select");
      if (sortSelect && sortSelect.selectedIndex > 0) return true;

      return false;
    }

    // Clear all active filters and show all products
    function clearAllFiltersAjax() {
      // Uncheck all filter checkboxes
      const checkboxes = filterForm.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      // Clear price range inputs
      const priceInputs = filterForm.querySelectorAll('input[type="number"]');
      priceInputs.forEach((input) => {
        input.value = "";
      });

      // Reset sort dropdown to default
      const sortSelect = filterForm.querySelector(".sort-select");
      if (sortSelect) {
        sortSelect.selectedIndex = 0;
      }

      // Apply cleared filters to show all products
      applyFiltersAjax();
    }

    // Attach event listener to "Clear All Filters" button
    function attachClearFilterListeners() {
      const clearBtn = filterSidebar.querySelector(".clear-all-btn");
      if (clearBtn) {
        // Clone to remove old event listeners
        const newClearBtn = clearBtn.cloneNode(true);
        clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);

        // Add click event to clear all filters
        newClearBtn.addEventListener("click", function (e) {
          e.preventDefault();
          clearAllFiltersAjax();
        });
      }
    }

    // Attach event listeners to individual active filter remove buttons
    function attachActiveFilterRemoveListeners() {
      // Select all remove links (×) in active filters section
      const activeFilterRemoveLinks = filterSidebar.querySelectorAll(
        'div[style*="border-top"] a[href*="url_to_remove"], div[style*="border-top"] a[style*="color: #fff"]'
      );

      activeFilterRemoveLinks.forEach((link) => {
        // Clone link to remove old event listeners
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        // Add click event to remove specific filter
        newLink.addEventListener("click", function (e) {
          e.preventDefault();

          // Get parent div to identify filter type
          const parentDiv = this.closest('div[style*="background: #000"]');
          const filterText = parentDiv ? parentDiv.textContent.trim() : "";

          // Handle price filter removal
          if (filterText.includes("Price:")) {
            const priceInputs = filterForm.querySelectorAll(
              'input[type="number"]'
            );
            priceInputs.forEach((input) => {
              input.value = "";
            });
          }
          // Handle checkbox filter removal
          else {
            const removeUrl = this.getAttribute("href");
            const url = new URL(removeUrl, window.location.origin);
            const params = new URLSearchParams(url.search);

            const formCheckboxes = filterForm.querySelectorAll(
              'input[type="checkbox"]:checked'
            );

            // Find and uncheck the corresponding checkbox by comparing URL parameters
            formCheckboxes.forEach((checkbox) => {
              const checkboxValue = checkbox.value;
              const checkboxName = checkbox.name;

              // If this checkbox value is not in the removal URL, uncheck it
              if (
                !params.has(checkboxName) ||
                !params.getAll(checkboxName).includes(checkboxValue)
              ) {
                checkbox.checked = false;
              }
            });
          }

          // Apply updated filters
          applyFiltersAjax();
        });
      });
    }

    // Attach event listeners to pagination links
    function attachPaginationListeners() {
      const paginationLinks = document.querySelectorAll(".pagination a");

      paginationLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();

          const paginationUrl = this.getAttribute("href");

          // Show loading state
          productsContainer.style.opacity = "0.5";
          productsContainer.style.pointerEvents = "none";

          // Fetch paginated products
          fetch(paginationUrl, {
            method: "GET",
            headers: {
              "X-Requested-With": "XMLHttpRequest",
            },
          })
            .then((response) => response.text())
            .then((html) => {
              const parser = new DOMParser();
              const newDoc = parser.parseFromString(html, "text/html");

              // Update products grid
              const newProducts = newDoc.querySelector(".products-grid");
              if (newProducts) {
                productsContainer.innerHTML = newProducts.innerHTML;
              }

              // Update pagination
              const oldPagination = document.querySelector(".pagination");
              const newPagination = newDoc.querySelector(".pagination");

              if (oldPagination && newPagination) {
                oldPagination.innerHTML = newPagination.innerHTML;
              }

              // Remove loading state
              productsContainer.style.opacity = "1";
              productsContainer.style.pointerEvents = "auto";

              // Re-attach listeners
              attachAddToCartListeners();
              attachPaginationListeners();

              // Scroll to top of products
              productsContainer.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });

              // Update URL
              window.history.pushState({}, "", paginationUrl);
            })
            .catch((error) => {
              console.error("Pagination error:", error);
              productsContainer.style.opacity = "1";
              productsContainer.style.pointerEvents = "auto";
            });
        });
      });
    }

    // Attach change event listeners to all filter inputs
    function attachFilterListeners() {
      // Checkbox filters - apply immediately on change
      const checkboxes = filterForm.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach((checkbox) => {
        checkbox.removeEventListener("change", applyFiltersAjax);
        checkbox.addEventListener("change", applyFiltersAjax);
      });

      // Price inputs - apply only when both min and max are filled
      const priceInputs = filterForm.querySelectorAll('input[type="number"]');
      priceInputs.forEach((input) => {
        input.removeEventListener("change", handlePriceChange);
        input.addEventListener("change", handlePriceChange);
      });

      // Sort dropdown - apply immediately on change
      const sortSelect = filterForm.querySelector(".sort-select");
      if (sortSelect) {
        sortSelect.removeEventListener("change", applyFiltersAjax);
        sortSelect.addEventListener("change", applyFiltersAjax);
      }
    }

    // Handle price filter changes - only apply when both fields have values
    function handlePriceChange() {
      const priceInputs = filterForm.querySelectorAll('input[type="number"]');
      const minInput = priceInputs[0];
      const maxInput = priceInputs[1];

      // Apply filter only if both min and max price are set
      if (minInput && maxInput && minInput.value && maxInput.value) {
        applyFiltersAjax();
      }
    }

    // Initialize all filter event listeners on page load
    attachFilterListeners();
    attachClearFilterListeners();
    attachActiveFilterRemoveListeners();
    attachPaginationListeners();

    // Check for browser-cached filter values (back button navigation)
    // Wait briefly to allow browser to restore form values
    setTimeout(() => {
      if (hasActiveFilters()) {
        console.log("Detected pre-filled filters, applying them...");
        applyFiltersAjax();
      }
    }, 100);

    // Handle form submission via Apply Filters button
    filterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      applyFiltersAjax();
    });
  }

  // ============= MOBILE FILTER TOGGLE =============
  const filter = document.querySelector(".filter");
  const filterIcon = document.querySelector(".filter-icon");
  const filterCloseBtn = document.getElementById("filterCloseBtn");

  // Open/close mobile filter sidebar
  if (filterIcon) {
    filterIcon.addEventListener("click", () => {
      filter.classList.toggle("filter-open");

      // Prevent body scroll when filter is open
      if (filter.classList.contains("filter-open")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });
  }

  // Close mobile filter sidebar
  if (filterCloseBtn) {
    filterCloseBtn.addEventListener("click", () => {
      filter.classList.remove("filter-open");
      document.body.style.overflow = "";
    });
  }
});

// Collection Title Slider
document.addEventListener("DOMContentLoaded", function () {
  $(".all-collection-title__list").slick({
    dots: false,
    infinite: true,
    speed: 900,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: true,
    adaptiveHeight: true,
    prevArrow:
      '<button type="button" class="slick-prev" style="display: none;"></button>',
    nextArrow: '<button type="button" class="slick-next"></button>',
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 3,
          dots: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          dots: true,
        },
      },
    ],
  });
});
