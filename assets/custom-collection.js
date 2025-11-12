document.addEventListener("DOMContentLoaded", function () {
  const addToCartButtons = document.querySelectorAll(
    ".add-to-cart-btn:not(.add-to-cart-link):not(.add-to-cart-sold-out)"
  );

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const variantId = this.getAttribute("data-variant-id");

      this.disabled = true;
      this.textContent = "Adding...";

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

          // Update cart count
          updateCartCount();

          // Trigger theme cart refresh
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

  // Update cart count function
  function updateCartCount() {
    fetch("/cart.js")
      .then((response) => response.json())
      .then((cart) => {
        const cartCount = cart.item_count;

        // Update Dawn theme cart count
        const cartCountBubbles =
          document.querySelectorAll(".cart-count-bubble");
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
});

// Filter For Mobile Java Script

const filter = document.querySelector(".filter");
const filterIcon = document.querySelector(".filter-icon");
const filterCloseBtn = document.getElementById("filterCloseBtn");

if (filterIcon) {
  filterIcon.addEventListener("click", () => {
    filter.classList.toggle("filter-open");

    if (filter.classList.contains("filter-open")) {
      document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
      document.body.style.overflow = ""; // Restore scrolling
    }
  });
}

if (filterCloseBtn) {
  filterCloseBtn.addEventListener("click", () => {
    filter.classList.remove("filter-open");
    document.body.style.overflow = ""; // Restore scrolling
  });
}
