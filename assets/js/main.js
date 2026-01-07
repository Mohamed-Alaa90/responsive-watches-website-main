/*=============== CART STATE ===============*/
let cartState = JSON.parse(localStorage.getItem("cart")) || [];

/*=============== INIT ===============*/
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
  renderCart();
  initFilters();

  // Swiper initialization needs to happen after rendering
  initSwipers();
});

const initSwipers = () => {
  /*=============== TESTIMONIAL SWIPER ===============*/
  let testimonialSwiper = new Swiper(".testimonial-swiper", {
    spaceBetween: 30,
    loop: "true",

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  /*=============== NEW SWIPER ===============*/
  let newSwiper = new Swiper(".new-swiper", {
    spaceBetween: 24,
    loop: "true",

    breakpoints: {
      576: { slidesPerView: 2 },
      768: { slidesPerView: 3 },
      1024: { slidesPerView: 4 },
    },
  });
};

/*=============== PRODUCTS RENDERING ===============*/
const renderProducts = (categoryFilter = "all", searchQuery = "") => {
  const featuredContainer = document.getElementById("featured-items-container");
  const productsContainer = document.getElementById("products-items-container");
  const newContainer = document.getElementById("new-items-container");

  if (!featuredContainer || !productsContainer || !newContainer) return;

  // Add fade class for transition
  productsContainer.classList.add("grid-fade");

  setTimeout(() => {
    // Clear containers
    if (categoryFilter === "all" && searchQuery === "") {
      featuredContainer.innerHTML = "";
      newContainer.innerHTML = "";
    }
    productsContainer.innerHTML = "";

    products.forEach((product) => {
      const matchesCategory =
        categoryFilter === "all" || product.category === categoryFilter;
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const itemHtml = `
                <article class="${
                  product.category === "products"
                    ? "products__card"
                    : product.category === "new"
                    ? "new__card swiper-slide"
                    : "featured__card"
                }">
                    ${
                      product.tag
                        ? `<span class="${
                            product.category === "new"
                              ? "new__tag"
                              : "featured__tag"
                          }">${product.tag}</span>`
                        : ""
                    }
                    
                    <a href="product-details.html?id=${product.id}">
                        <img src="${product.image}" alt="" class="${
        product.category === "products"
          ? "products__img"
          : product.category === "new"
          ? "new__img"
          : "featured__img"
      }">
                    </a>

                    <div class="${
                      product.category === "products"
                        ? ""
                        : product.category === "new"
                        ? "new__data"
                        : "featured__data"
                    }">
                        <a href="product-details.html?id=${product.id}">
                            <h3 class="${
                              product.category === "products"
                                ? "products__title"
                                : product.category === "new"
                                ? "new__title"
                                : "featured__title"
                            }">${product.title}</h3>
                        </a>
                        <span class="${
                          product.category === "products"
                            ? "products__price"
                            : product.category === "new"
                            ? "new__price"
                            : "featured__price"
                        }">$${product.price}</span>
                    </div>
                    <button class="${
                      product.category === "products"
                        ? "products__button"
                        : "button " + product.category + "__button"
                    }" onclick="addToCart(${product.id})">
                        ${
                          product.category === "products"
                            ? '<i class="bx bx-shopping-bag"></i>'
                            : "ADD TO CART"
                        }
                    </button>
                </article>
            `;

      // Home page section populating (only on initial load)
      if (categoryFilter === "all" && searchQuery === "") {
        if (product.category === "featured")
          featuredContainer.innerHTML += itemHtml;
        if (product.category === "new") newContainer.innerHTML += itemHtml;
      }

      // Main products grid (always filtered)
      if (matchesCategory && matchesSearch) {
        productsContainer.innerHTML += itemHtml;
      }
    });

    if (productsContainer.innerHTML === "") {
      productsContainer.innerHTML =
        '<p class="section__title">No products found matching your search.</p>';
    }

    // Remove fade class
    productsContainer.classList.remove("grid-fade");
  }, 100);
};

/*=============== SCROLL REVEAL ANIMATION ===============*/
const sr = ScrollReveal({
  origin: "top",
  distance: "60px",
  duration: 2500,
  delay: 400,
  // reset: true
});

sr.reveal(`.home__data, .footer__container`);
sr.reveal(`.home__img`, { delay: 700 });
sr.reveal(`.home__social`, { delay: 900 });
sr.reveal(`.featured__card, .story__images, .products__card, .new__card`, {
  interval: 100,
});
sr.reveal(`.story__data, .testimonial__data`, { origin: "right" });
sr.reveal(`.testimonial__images, .newsletter__data`, { origin: "left" });
sr.reveal(`.newsletter__bg`, { origin: "top" });

/*=============== SEARCH & FILTER LOGIC ===============*/
const initFilters = () => {
  const searchInput = document.getElementById("search-input");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchQuery = e.target.value;
      const activeCategory =
        document.querySelector(".filter-btn.active").dataset.filter;
      renderProducts(activeCategory, searchQuery);
    });
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const category = btn.dataset.filter;
      const searchQuery = searchInput ? searchInput.value : "";
      renderProducts(category, searchQuery);
    });
  });
};

/*=============== CART LOGIC ===============*/
const addToCart = (productId) => {
  const product = products.find((p) => p.id === productId);
  const existingItem = cartState.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartState.push({ ...product, quantity: 1 });
  }

  saveCart();
  renderCart();
  // Open cart sidebar on add
  document.getElementById("cart").classList.add("show-cart");
};

const removeFromCart = (productId) => {
  cartState = cartState.filter((item) => item.id !== productId);
  saveCart();
  renderCart();
};

const updateQuantity = (productId, change) => {
  const item = cartState.find((item) => item.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      renderCart();
    }
  }
};

const saveCart = () => {
  localStorage.setItem("cart", JSON.stringify(cartState));
};

const renderCart = () => {
  const cartContainer = document.getElementById("cart-items-container");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  if (!cartContainer || !cartCount || !cartTotal) return;

  cartContainer.innerHTML = "";
  let totalItems = 0;
  let totalPrice = 0;

  cartState.forEach((item) => {
    totalItems += item.quantity;
    totalPrice += item.price * item.quantity;

    cartContainer.innerHTML += `
            <article class="cart__card">
                <div class="cart__box">
                    <img src="${item.image}" alt="" class="cart__img" />
                </div>

                <div class="cart__details">
                    <h3 class="cart__title">${item.title}</h3>
                    <span class="cart__price">$${item.price}</span>

                    <div class="cart__amount">
                        <div class="cart__amount-content">
                            <span class="cart__amount-box" onclick="updateQuantity(${item.id}, -1)">
                                <i class="bx bx-minus"></i>
                            </span>

                            <span class="cart__amount-number">${item.quantity}</span>

                            <span class="cart__amount-box" onclick="updateQuantity(${item.id}, 1)">
                                <i class="bx bx-plus"></i>
                            </span>
                        </div>

                        <i class="bx bx-trash-alt cart__amount-trash" onclick="removeFromCart(${item.id})"></i>
                    </div>
                </div>
            </article>
        `;
  });

  cartCount.innerText = `${totalItems} items`;
  cartTotal.innerText = `$${totalPrice.toFixed(2)}`; // Format to 2 decimal places
};

/*=============== SHOW MENU ===============*/
const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

/* Menu show */
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}

/* Menu hidden */
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
}

/*=============== REMOVE MENU MOBILE ===============*/
const navLink = document.querySelectorAll(".nav__link");

const linkAction = () => {
  const navMenu = document.getElementById("nav-menu");
  // When we click on each nav__link, we remove the show-menu class
  navMenu.classList.remove("show-menu");
};
navLink.forEach((n) => n.addEventListener("click", linkAction));

/*=============== CHANGE BACKGROUND HEADER ===============*/
const scrollHeader = () => {
  const header = document.getElementById("header");
  // Add a class if the bottom offset is greater than 50 of the viewport
  this.scrollY >= 50
    ? header.classList.add("scroll-header")
    : header.classList.remove("scroll-header");
};
window.addEventListener("scroll", scrollHeader);

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll("section[id]");

const scrollActive = () => {
  const scrollDown = window.scrollY;

  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight,
      sectionTop = current.offsetTop - 58,
      sectionId = current.getAttribute("id"),
      sectionsClass = document.querySelector(
        ".nav__menu a[href*=" + sectionId + "]"
      );

    if (scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight) {
      sectionsClass.classList.add("active-link");
    } else {
      sectionsClass.classList.remove("active-link");
    }
  });
};
window.addEventListener("scroll", scrollActive);

/*=============== SHOW SCROLL UP ===============*/
const scrollUp = () => {
  const scrollUp = document.getElementById("scroll-up");
  // When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scrollup class
  this.scrollY >= 350
    ? scrollUp.classList.add("show-scroll")
    : scrollUp.classList.remove("show-scroll");
};
window.addEventListener("scroll", scrollUp);

/*=============== SHOW CART ===============*/
const cart = document.getElementById("cart"),
  cartShop = document.getElementById("cart-shop"),
  cartClose = document.getElementById("cart-close");

/*===== CART SHOW =====*/
/* Validate if constant exists */
if (cartShop) {
  cartShop.addEventListener("click", () => {
    cart.classList.add("show-cart");
  });
}

/*===== CART HIDDEN =====*/
/* Validate if constant exists */
if (cartClose) {
  cartClose.addEventListener("click", () => {
    cart.classList.remove("show-cart");
  });
}

/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById("theme-button");
const darkTheme = "dark-theme";
const iconTheme = "bx-sun";

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem("selected-theme");
const selectedIcon = localStorage.getItem("selected-icon");

// We obtain the current theme that the interface has by validating the dark-theme class
const getCurrentTheme = () =>
  document.body.classList.contains(darkTheme) ? "dark" : "light";
const getCurrentIcon = () =>
  themeButton.classList.contains(iconTheme) ? "bx bx-moon" : "bx bx-sun";

// We validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === "dark" ? "add" : "remove"](
    darkTheme
  );
  themeButton.classList[selectedIcon === "bx bx-moon" ? "add" : "remove"](
    iconTheme
  );
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener("click", () => {
  // Add or remove the dark / icon theme
  document.body.classList.toggle(darkTheme);
  themeButton.classList.toggle(iconTheme);
  // We save the theme and the current icon that the user chose
  localStorage.setItem("selected-theme", getCurrentTheme());
  localStorage.setItem("selected-icon", getCurrentIcon());
});
