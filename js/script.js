/* Main javasript */

/* reusable functions */

function money(number) {
    return "$" + Number(number).toFixed(2);
}

function findProduct(id) {
    return products.find(product => product.id === Number(id));
}

function getData(name, defaultValue) {
    try {
        const data = localStorage.getItem(name);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error("Could not read localStorage:", error);
        return defaultValue;
    }
}

function saveData(name, data) {
    localStorage.setItem(name, JSON.stringify(data));
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showMessage(element, message, type = "error") {
    if (!element) return;
    element.textContent = message;
    element.className = type === "success" ? "form-success" : "error";
}

/* Mobile navigation */

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");

if (menuButton && nav) {
    menuButton.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });
}

/* Cart number */

function updateCartNumber() {
    const cart = getData("toyHavenCart", []);
    const totalItems = cart.reduce((total, item) => total + Number(item.quantity), 0);

    document.querySelectorAll(".cart-number").forEach(number => {
        number.textContent = totalItems;
    });
}

/* add to cart */

function addToCart(id) {
    const product = findProduct(id);
    if (!product) return;

    const cart = getData("toyHavenCart", []);
    const existingProduct = cart.find(item => item.id === Number(id));

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ id: Number(id), quantity: 1 });
    }

    saveData("toyHavenCart", cart);
    updateCartNumber();

    alert(`${product.name} was added to your cart.`);
}

/* Product cards */

function createProductCard(product) {
    const wishlist = getData("toyHavenWishlist", {});
    const saved = wishlist[product.id] ? "♥" : "♡";

    return `
        <article class="product-card">
            <button class="wishlist-button ${wishlist[product.id] ? "saved" : ""}"
                    onclick="changeWishlist(${product.id})"
                    aria-label="${wishlist[product.id] ? "Remove" : "Add"} ${product.name} ${wishlist[product.id] ? "from" : "to"} wishlist">
                ${saved}
            </button>

            <img class="product-card-image"
                 src="${product.image}"
                 alt="${product.name}">

            <div class="product-card-content">
                <p class="product-category">${product.category}</p>
                <h3>${product.name}</h3>
                <p class="price">${money(product.price)}</p>

                <div class="product-actions">
                    <button class="small-button black"
                            onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                    <button class="small-button"
                            onclick="showProduct(${product.id})">
                        Details
                    </button>
                </div>
            </div>
        </article>
    `;
}

/* products page - page, filter, URL category */

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll(".filter");
let selectedCategory = "All";

function showProducts() {
    if (!productGrid) return;

    const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";

    const filteredProducts = products.filter(product => {
        const correctCategory = selectedCategory === "All" || product.category === selectedCategory;
        const correctSearch = product.name.toLowerCase().includes(searchText);
        return correctCategory && correctSearch;
    });

    productGrid.innerHTML = filteredProducts.length
        ? filteredProducts.map(createProductCard).join("")
        : `<p class="empty-state">No products match your search.</p>`;
}

filterButtons.forEach(button => {
    button.addEventListener("click", function () {
        selectedCategory = button.dataset.category;

        filterButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");

        showProducts();
    });
});

if (searchInput) {
    searchInput.addEventListener("input", showProducts);
}

/* Home category links can open Products with the correct filter selected. */
if (productGrid) {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");

    if (["Figurines", "Toys", "Board Games", "Diecast Cars"].includes(requestedCategory)) {
        selectedCategory = requestedCategory;

        filterButtons.forEach(button => {
            button.classList.toggle("active", button.dataset.category === requestedCategory);
        });
    }
}

/* Product details modals*/

function showProduct(id) {
    const product = findProduct(id);
    const modal = document.querySelector("#productModal");

    if (!product || !modal) return;

    document.querySelector("#modalImage").src = product.image;
    document.querySelector("#modalImage").alt = product.name;
    document.querySelector("#modalName").textContent = product.name;
    document.querySelector("#modalName").dataset.id = product.id;
    document.querySelector("#modalCategory").textContent = product.category;
    document.querySelector("#modalPrice").textContent = money(product.price);
    document.querySelector("#modalDescription").textContent = product.description;

    const wishlist = getData("toyHavenWishlist", {});
    const wishlistButton = document.querySelector("#modalWishlist");
    if (wishlistButton) {
        wishlistButton.textContent = wishlist[product.id]
            ? "Remove from Wishlist"
            : "Add to Wishlist";
        wishlistButton.dataset.id = product.id;
    }

    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeProductModal() {
    const modal = document.querySelector("#productModal");
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.style.overflow = "";
}

const closeModal = document.querySelector("#closeModal");
if (closeModal) closeModal.addEventListener("click", closeProductModal);

const productModal = document.querySelector("#productModal");
if (productModal) {
    productModal.addEventListener("click", function (event) {
        if (event.target === productModal) closeProductModal();
    });
}

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeProductModal();
});

const modalWishlist = document.querySelector("#modalWishlist");
if (modalWishlist) {
    modalWishlist.addEventListener("click", function () {
        changeWishlist(Number(modalWishlist.dataset.id));
        const wishlist = getData("toyHavenWishlist", {});
        modalWishlist.textContent = wishlist[modalWishlist.dataset.id]
            ? "Remove from Wishlist"
            : "Add to Wishlist";
    });
}

/* Wishlist */

function changeWishlist(id) {
    const wishlist = getData("toyHavenWishlist", {});

    if (wishlist[id]) {
        delete wishlist[id];
    } else {
        wishlist[id] = "Interested";
    }

    saveData("toyHavenWishlist", wishlist);
    showProducts();
    updateWishlistPage();

    const modalWishlistButton = document.querySelector("#modalWishlist");
    if (modalWishlistButton && Number(modalWishlistButton.dataset.id) === Number(id)) {
        modalWishlistButton.textContent = wishlist[id]
            ? "Remove from Wishlist"
            : "Add to Wishlist";
    }
}

/* Home hero slider*/

const heroSlides = [
    { title: "Collectible figurines for your shelf.", image: "assets/forest.jpg", category: "FIGURINES" },
    { title: "Fun toys for curious minds.", image: "assets/marble.jpg", category: "TOYS" },
    { title: "Bring game night home.", image: "assets/orbit.jpg", category: "BOARD GAMES" },
    { title: "Small cars. Big nostalgia.", image: "assets/campervan.jpg", category: "DIECAST CARS" }
];

let currentSlide = 0;
const heroImage = document.querySelector("#heroImage");
const heroTitle = document.querySelector("#heroTitle");
const heroCategory = document.querySelector("#heroCategory");
const sliderButtons = document.querySelectorAll(".slider-button");

function renderHeroSlide(index) {
    if (!heroImage || !heroTitle || !heroCategory) return;

    const slide = heroSlides[index];
    heroImage.src = slide.image;
    heroImage.alt = slide.category + " at Toy Haven";
    heroTitle.textContent = slide.title;
    heroCategory.textContent = slide.category;

    sliderButtons.forEach((button, buttonIndex) => {
        button.classList.toggle("active", buttonIndex === index);
    });

    heroImage.classList.remove("fade");
    void heroImage.offsetWidth;
    heroImage.classList.add("fade");
}

function changeHero() {
    currentSlide = (currentSlide + 1) % heroSlides.length;
    renderHeroSlide(currentSlide);
}

sliderButtons.forEach((button, index) => {
    button.addEventListener("click", function () {
        currentSlide = index;
        renderHeroSlide(currentSlide);
    });
});

if (heroImage) {
    setInterval(changeHero, 4000);
}

/* Prodcut of the day */

function showProductOfTheDay() {
    const box = document.querySelector("#productOfDay");
    if (!box) return;

    const dayNumber = new Date().getDate();
    const product = products[(dayNumber - 1) % products.length];

    box.innerHTML = `
        <div class="featured-product">
            <img src="${product.image}" alt="${product.name}">
            <div>
                <p class="kicker">${product.category}</p>
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">${money(product.price)}</p>
                <button class="btn btn-black" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
}

/* Featured products (home page) */

function showFeaturedProducts() {
    const box = document.querySelector("#featuredProducts");
    if (!box) return;

    /* first 4 products only */
    const featured = products.slice(0, 4);

    box.innerHTML = featured.map(product => `
        <article class="product-card">
            <img class="product-card-image" src="${product.image}" alt="${product.name}">
            <div class="product-card-content">
                <p class="product-category">${product.category}</p>
                <h3>${product.name}</h3>
                <p class="price">${money(product.price)}</p>
                <button class="small-button black" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </article>
    `).join("");
}

/* cart page */

function calculateCartTotal(cart) {
    return cart.reduce((total, item) => {
        const product = findProduct(item.id);
        return product ? total + product.price * item.quantity : total;
    }, 0);
}

function showCart() {
    const cartBox = document.querySelector("#cartItems");
    if (!cartBox) return;

    const cart = getData("toyHavenCart", []);
    const total = calculateCartTotal(cart);

    if (cart.length === 0) {
        cartBox.innerHTML = "<p class=\"empty-state\">Your cart is empty.</p>";
    } else {
        cartBox.innerHTML = cart.map(item => {
            const product = findProduct(item.id);
            if (!product) return "";

            const subtotal = product.price * item.quantity;

            return `
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.name}">
                    <div>
                        <p class="product-category">${product.category}</p>
                        <h3>${product.name}</h3>
                        <p>${money(product.price)}</p>
                        <div class="quantity" aria-label="Quantity controls for ${product.name}">
                            <button onclick="changeQuantity(${product.id}, -1)" aria-label="Decrease quantity">-</button>
                            <strong>${item.quantity}</strong>
                            <button onclick="changeQuantity(${product.id}, 1)" aria-label="Increase quantity">+</button>
                        </div>
                    </div>
                    <strong>${money(subtotal)}</strong>
                </div>
            `;
        }).join("");
    }

    const totalBox = document.querySelector("#cartTotal");
    if (totalBox) totalBox.textContent = money(total);

    const checkoutButton = document.querySelector("#checkoutButton");
    if (checkoutButton) {
        checkoutButton.classList.toggle("disabled-link", cart.length === 0);
        checkoutButton.setAttribute("aria-disabled", String(cart.length === 0));
    }
}

function changeQuantity(id, amount) {
    const cart = getData("toyHavenCart", []);
    const item = cart.find(product => product.id === Number(id));

    if (item) item.quantity += amount;

    saveData("toyHavenCart", cart.filter(product => product.quantity > 0));
    updateCartNumber();
    showCart();
    showCheckoutTotal();
    showCheckoutItems();
}

const clearCartButton = document.querySelector("#clearCart");
if (clearCartButton) {
    clearCartButton.addEventListener("click", function () {
        localStorage.removeItem("toyHavenCart");
        updateCartNumber();
        showCart();
        showCheckoutTotal();
        showCheckoutItems();
    });
}

/* checkout page */

function showCheckoutTotal() {
    const totalBox = document.querySelector("#checkoutTotal");
    if (!totalBox) return;

    const cart = getData("toyHavenCart", []);
    totalBox.textContent = money(calculateCartTotal(cart));
}

function showCheckoutItems() {
    const box = document.querySelector("#checkoutItems");
    if (!box) return;

    const cart = getData("toyHavenCart", []);

    if (!cart.length) {
        box.innerHTML = "<tr><td colspan=\"3\">Your cart is empty.</td></tr>";
        return;
    }

    /* one table row for each product */
    box.innerHTML = cart.map(item => {
        const product = findProduct(item.id);
        if (!product) return "";
        return `
            <tr>
                <td>${product.name}</td>
                <td>${item.quantity}</td>
                <td>${money(product.price * item.quantity)}</td>
            </tr>
        `;
    }).join("");
}

const checkoutForm = document.querySelector("#checkoutForm");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.querySelector("#name").value.trim();
        const email = document.querySelector("#email").value.trim();
        const address = document.querySelector("#address").value.trim();
        const payment = document.querySelector('input[name="payment"]:checked')?.value || "";
        const error = document.querySelector("#checkoutError");
        const cart = getData("toyHavenCart", []);

        if (!cart.length) {
            showMessage(error, "Your cart is empty. Please add a product before checkout.");
            return;
        }

        if (name.length < 2) {
            showMessage(error, "Please enter your full name.");
            return;
        }

        if (!isValidEmail(email)) {
            showMessage(error, "Please enter a valid email address.");
            return;
        }

        if (address.length < 10) {
            showMessage(error, "Please enter a complete delivery address.");
            return;
        }

        if (!payment) {
            showMessage(error, "Please select a payment method.");
            return;
        }

        const orders = getData("toyHavenOrders", []);

        orders.push({
            id: "TH-" + Date.now(),
            name,
            email,
            address,
            payment,
            items: cart,
            total: calculateCartTotal(cart),
            date: new Date().toLocaleString()
        });

        saveData("toyHavenOrders", orders);
        localStorage.removeItem("toyHavenCart");

        checkoutForm.classList.add("hidden");
        document.querySelector("#orderSuccess").classList.remove("hidden");
        showMessage(error, "");

        updateCartNumber();
        showCheckoutItems();
        showCheckoutTotal();
    });
}

/* wishlist page */

function updateWishlistPage() {
    const wishlistBox = document.querySelector("#wishlistItems");
    if (!wishlistBox) return;

    const wishlist = getData("toyHavenWishlist", {});
    const ids = Object.keys(wishlist);

    if (!ids.length) {
        wishlistBox.innerHTML = "<p class=\"empty-state\">Your wishlist is empty.</p>";
        return;
    }

    wishlistBox.innerHTML = ids.map(id => {
        const product = findProduct(id);
        if (!product) return "";

        return `
            <div class="wishlist-item">
                <img src="${product.image}" alt="${product.name}">
                <div>
                    <p class="product-category">${product.category}</p>
                    <h3>${product.name}</h3>
                    <p>${money(product.price)}</p>
                </div>
                <select aria-label="Collection status for ${product.name}"
                        onchange="changeStatus(${product.id}, this.value)">
                    <option value="Interested" ${wishlist[id] === "Interested" ? "selected" : ""}>Interested</option>
                    <option value="Owned" ${wishlist[id] === "Owned" ? "selected" : ""}>Owned</option>
                    <option value="Not Interested" ${wishlist[id] === "Not Interested" ? "selected" : ""}>Not Interested</option>
                </select>
                <button class="small-button" onclick="changeWishlist(${product.id})">
                    Remove
                </button>
            </div>
        `;
    }).join("");
}

function changeStatus(id, status) {
    const wishlist = getData("toyHavenWishlist", {});
    wishlist[id] = status;
    saveData("toyHavenWishlist", wishlist);
}

/* feedback form */

const feedbackForm = document.querySelector("#feedbackForm");

if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.querySelector("#feedbackName").value.trim();
        const email = document.querySelector("#feedbackEmail").value.trim();
        const message = document.querySelector("#feedbackMessage").value.trim();
        const status = document.querySelector("#feedbackStatus");

        if (name.length < 2) {
            showMessage(status, "Please enter your name.");
            return;
        }

        if (!isValidEmail(email)) {
            showMessage(status, "Please enter a valid email address.");
            return;
        }

        if (message.length < 5) {
            showMessage(status, "Please enter a message with at least 5 characters.");
            return;
        }

        const feedback = getData("toyHavenFeedback", []);
        feedback.push({ name, email, message, date: new Date().toLocaleString() });
        saveData("toyHavenFeedback", feedback);

        feedbackForm.reset();
        showMessage(status, "Thank you. Your feedback was saved.", "success");
    });
}

/* FAQ */

const faqButtons = document.querySelectorAll(".faq-question");

faqButtons.forEach(button => {
    button.addEventListener("click", function () {
        const faq = button.parentElement;
        const isOpen = faq.classList.toggle("open");
        button.setAttribute("aria-expanded", String(isOpen));
    });
});

/* Newsletter*/

const newsletterForm = document.querySelector("#newsletterForm");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.querySelector("#newsletterEmail");
        const message = document.querySelector("#newsletterMessage");
        const email = emailInput.value.trim();

        if (!isValidEmail(email)) {
            showMessage(message, "Please enter a valid email address.");
            return;
        }

        let subscribers = getData("toyHavenNewsletter", []);
        if (!Array.isArray(subscribers)) subscribers = subscribers ? [subscribers] : [];
        if (!subscribers.includes(email)) subscribers.push(email);
        saveData("toyHavenNewsletter", subscribers);

        newsletterForm.reset();
        showMessage(message, "Thank you for subscribing.", "success");
    });
}

/* Scrollbased reveal animation */

document.body.classList.add("reveal-ready");

const revealItems = document.querySelectorAll(".section, .page-head, .tools, .footer");

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    revealItems.forEach(item => item.classList.add("reveal"));
    revealItems.forEach(item => observer.observe(item));
} else {
    revealItems.forEach(item => item.classList.add("visible"));
}

/* Start page functions*/

updateCartNumber();
showProducts();
showProductOfTheDay();
showFeaturedProducts();
showCart();
showCheckoutTotal();
showCheckoutItems();
updateWishlistPage();
renderHeroSlide(currentSlide);

/* PWA service worker */

if ("serviceWorker" in navigator && (location.protocol === "http:" || location.protocol === "https:")) {
    window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").catch(function (error) {
            console.error("Service worker registration failed:", error);
        });
    });
}
