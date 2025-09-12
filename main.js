// Step-one: Grap references from HTML elements
let productGrid = document.querySelector(".product-grid"); // The whole area where your products will appear.

let templateItem = document.querySelector(".product-item.hidden"); // A hidden product template used to clone new product cards.

let emptyCartEl = document.querySelector(".cart"); // The empty cart element that will be shown when there are no items in the cart.

let filledCartEl = document.querySelector(".cart-fill"); // The filled cart element that will be shown when there are items in the cart.
// The filled cart element contains the list of items in the cart, the total price, and a button to confirm the order.

let cartItemsContainer = filledCartEl.querySelector("div"); // The container inside the filled cart where individual items will be displayed.

let filledCartHeading = filledCartEl.querySelector("h3"); // The heading inside the filled cart that displays the total number of items in the cart.
// This heading will be updated dynamically to reflect the number of items in the cart.
// It will show something like "Your Cart (3)" if there are 3 items in the cart.
// It will show "Your Cart (0)" if there are no items in the cart.

let grandTotalEl = filledCartEl.querySelector(".grand-t"); // The element inside the filled cart that displays the grand total price of all items in the cart.
// This element will be updated dynamically to reflect the total price of all items in the cart.

let confirmOrderBtn = filledCartEl.querySelector("button"); // The button inside the filled cart that confirms the order.
// When clicked, this button will trigger the modal to show the items in the cart and the total price.

let modalDesk = document.querySelector(".modal-deck"); // The modal that will appear when the confirm order button is clicked.
// This modal will display the items in the cart, their quantities, and the total price.
// The modal will also have a button to start a new order.

let modalCloseBtn = modalDesk.querySelector(".close-modal"); // The button inside the modal that closes the modal.

let startNewOrderBtn = modalDesk.querySelector("button"); // The button inside the modal that starts a new order.
// When clicked, this button will hide the modal and reset the cart.
// It will also clear the cart items and reset the cart object.

let modalItemsContainer = modalDesk.querySelector(".modal-con"); // The container inside the modal where individual items will be displayed.
// This is where each item in the cart will be displayed with its name, quantity, and price.

// In-memory cart
let cart = {}; // This is an in-memory cart: like a digital basket (using an object) to track what was added.
// Each key in this object will be the index of the product in the product array,

// Format amount to $x.xx

let formatCurrency = (amount) => {
  return `$${amount.toFixed(2)}`;
}; // This function takes a number as input and returns it formatted as a string with a dollar sign and two decimal places.
// For example, if the input is 10, it will return "$10.00".

// Step two: Fetch product array from data.json
let fetchProducts = async () => {
  // This function fetches the product data from a JSON file and returns it as an array.
  // It uses the Fetch API to make a GET request to the "/data.json" endpoint.
  try {
    let res = await fetch("/data.json"); // This line sends a request to the server to get the data.json file.
    if (!res.ok) {
      throw new Error("Network response was not ok");
    } // This line checks if the response is OK (status code 200-299). If not, it throws an error.

    return await res.json(); // This line waits for the response to be converted to JSON format and returns it.
    // The returned data is expected to be an array of product objects, each containing details like name, price, category, and images.
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; // If there is an error during the fetch operation, it logs the error to the console and returns an empty array.
  }
};

// Step three: Render products by cloning the hidden template
let renderProducts = async () => {
  let products = await fetchProducts(); //

  window.productList = products; // Store products in a global variable for later use
  console.log(window);

  // Clear any previously rendered template
  productGrid
    .querySelectorAll(".product-item:not(.hidden)")
    .forEach((eachProduct) => {
      return eachProduct.remove();
    }); // This is to prevent duplication, o it removes everything previously on the shelf except the "hidden", which is the dummy created in the HTML.

  products.forEach((product, index) => {
    let clone = templateItem.cloneNode(true); // this line is cloning an Html element, including its children
    // templateItem : is an existing DOM element most likely a hidden product template in our HTML
    // .cloneNode(true) : creates an exact copy of that element.
    // true: this means it will deep clone the element.
    // true: clones the element and all nested children.
    // false: clones only element itself, not its children.
    clone.classList.remove("hidden"); // un-hide the clone
    clone.setAttribute("data-index", index); // Set data-index attribute. This is a method in javaScript used to add or update an attribute on HTML element

    // Fill in images

    let mobileImg = clone.querySelector("[data-mobile-img]");
    let desktopImg = clone.querySelector("[data-desktop-img]");
    mobileImg.src = product.image.mobile;
    desktopImg.src = product.image.desktop;

    // Fill in categories, name, price

    clone.querySelector("[data-category]").textContent = product.category;
    clone.querySelector("[data-name]").textContent = product.name;
    clone.querySelector("[data-price]").textContent = formatCurrency(
      product.price
    );

    // Append to grid
    productGrid.appendChild(clone); // This method is a built in DOM API for
    // inserting a node (element, text, etc) as the last child of a parent node
  });

  addToCartEventListneners(); // This function sets up an event listener that listens for clicks on the "Add to Cart" buttons within the product grid.
};

// Handle clicking "Add to cart" on the cloned product items
let addToCartEventListneners = () => {
  productGrid.addEventListener("click", (event) => {
    // This adds an event listener to the entire grid instead of each product one by one.
    // It's called event delegation: we listen on the parent and detect clicks on children.

    let addBtn = event.target.closest(".add-to");
    // event.target is the actual thing clicked.
    // addBtn becomes a reference to the entire add-to button container
    if (!addBtn) {
      return; // If the clicked element is not an "Add to cart" button, exit
    }

    event.preventDefault(); // Prevent default action of the button

    let itemWrapper = addBtn.closest(".product-item"); // This looks for the closest ancestor of the addBtn element with the class .product-item

    let index = Number(itemWrapper.dataset.index); // converts it from a string (e.g., "-1") to a number (-1), storing it in the index variable.

    if (cart[index]) {
      return;
    } // This checks if the product is already in the cart. If already exists in cart, do nothing

    // Replace ".add-to" with a new "added-to" (quantity =1)
    let addedDiv = document.createElement("div");
    addedDiv.classList.add(
      "added-to",
      "bg-[var(--Red)]",
      "w-[160px]",
      "flex",
      "justify-between",
      "items-center",
      "p-2.5",
      "rounded-3xl",
      "absolute",
      "bottom-[-20px]",
      "left-[24%]",
      "right-[24%]",
      "cursor-pointer",
      "sm:left-[15%]",
      "sm:right-[15%]"
    );

    addedDiv.innerHTML = `<div class=" decrement-btn border w-[20px] h-[20px]
     flex items-center justify-center rounded-full border-[var(--Rose50)] 
     cursor-pointer  hover:bg-[var(--Rose900)]" tabindex="0"><img src="/assets/images/icon-decrement-quantity.svg" /></div> 
     <p class="quantity-display text-[14px] font-semibold text-[var(--Rose50)]">1</p><div class="increment-btn border
      w-[20px] h-[20px] flex items-center justify-center rounded-full border-[var(--Rose50)] 
      cursor-pointer hover:bg-[var(--Rose900)]" tabindex="0">
      <img src="/assets/images/icon-increment-quantity.svg"  />
      </div>`; // This section builds the "+" and "−" buttons with a quantity display in the middle

    let parentRel = addBtn.parentElement; //  get the parent element that directly contains the addBtn(add-to) element.
    parentRel.replaceChild(addedDiv, addBtn); // 3  (addBtn) gets replaced by a new div (addedDiv) in the same box (parentRel).

    // The “Add to Cart” button disappears and gets replaced with the + / - quantity control UI.

    let productObj = window.productList[index]; // Get the product information from the global product list at the exact position of index.
    // Go to the list of all products, and pick out the one at this position (the one the user clicked 'Add to Cart' on).
    //  Save it in a variable called productObj.

    cart[index] = { product: productObj, quantity: 1 }; // You’re adding the product to the cart object and storing it using its index (like a label or ID)

    // You store two things: The actual product info (productObj) and the quantity (1 initially, since they just clicked "Add to Cart")

    refreshCartUI(); // This calls a function that refreshes the cart display
  });
};

// Handle increment/ decrement inside added-to
let attachQuantityListeners = () => {
  productGrid.addEventListener("click", (event) => {
    // We’re listening to all clicks that happen inside the productGrid container
    let incBtn = event.target.closest(".increment-btn"); // checks if the clicked element or any of its parents has the given class.
    let decBtn = event.target.closest(".decrement-btn"); // checks if the clicked element or any of its parents has the given class.

    if (!incBtn && !decBtn) {
      return; // If the click didn’t happen on either a + or − button, exit early.
    }

    let itemWrapper = event.target.closest(".product-item");
    let index = Number(itemWrapper.dataset.index);

    if (!cart[index]) {
      return; // This means: “If there's no cart entry for this product, don’t do anything.”
    } // 2

    let quantityDisplay = itemWrapper.querySelector(".quantity-display");

    if (incBtn) {
      cart[index].quantity += 1;
      quantityDisplay.textContent = cart[index].quantity; // If + was clicked, increase quantity in the data (cart[index]) and then update what’s displayed.
    } else if (decBtn) {
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
        quantityDisplay.textContent = cart[index].quantity; // If − was clicked and quantity is more than 1, decrease it and update the display.
      } else {
        removeFromCart(index);
        return; // If quantity would fall to 0, remove the item from the cart completely and stop the function
      }
    }

    refreshCartUI(); // is a helper function that updates the cart section of the page any time there’s a change
  });
};

// Remove an item from the cart & Switch that product back to "Add to cart"

let removeFromCart = (index) => {
  delete cart[index]; // remove the item from the cart

  let productWrapper = document.querySelector(
    `.product-item[data-index="${index}"]`
  ); // We are selecting a specific .product-item element based on its data-index value, and storing it in a variable named productWrapper.

  // This finds the .product-item div that has a data-index matching the one we just removed.
  // It lets us go back to the specific product card in the UI so we can update its “Add to Cart” button.

  if (productWrapper) {
    // This checks if that product item was successfully found.
    let parentRel = productWrapper.querySelector(".relative");
    // parentRel is  the parent container that holds the .added-to or .add-to buttons.

    let existingAdded = parentRel.querySelector(".added-to");
    // Now we check if there’s already an .added-to quantity button interface (i.e., with + / -).
    // We’re trying to replace it back with the original Add to Cart button.

    if (existingAdded) {
      // If the quantity selector is currently visible, we proceed to remove and replace it.

      let addDiv = document.createElement("div");
      addDiv.classList.add(
        // We create a new <div> in memory that will become the new “Add to Cart” button.

        "add-to",
        "bg-[var(--Rose50)]",
        "flex",
        "items-center",
        "justify-center",
        "gap-2",
        "py-2.5",
        "w-[160px]",
        "border",
        "border-[var(--Rose400)]",
        "rounded-3xl",
        "absolute",
        "left-[24%]",
        "right-[24%]",
        "bottom-[-21.5px]",
        "cursor-pointer",
        "sm:left-[15%]",
        "sm:right-[15%]"
      );

      addDiv.setAttribute("tabindex", "0"); // This makes the button focusable using the keyboard’s tab key
      addDiv.innerHTML = `<img src="./assets/images/icon-add-to-cart.svg" />
      <a href ="" class= "text-[14px] 
      font-semibold text-[var(--Rose900)]">Add to Cart</a>`;
      // This adds the actual content inside the new div: The cart icon <img> and the “Add to Cart” text <a>.

      parentRel.replaceChild(addDiv, existingAdded);
    } // It swaps out the quantity controls (.added-to) with the original add-to button.
  }

  refreshCartUI();
};

// Refreshing the cart on every change
// The purpose of refreshCartUI is to update the cart interface whenever the cart data changes.
// This includes showing or hiding the cart panel, updating total quantities, and listing out items in the cart.
let refreshCartUI = () => {
  // 1. Grab all the product indices in the "cart" object
  let keys = Object.keys(cart); // This creates an array of all the keys (which are product indices) from the cart object.

  // 2. if there are no keys, show empty cart
  if (keys.length === 0) {
    // Make the "empty cart" element visible
    emptyCartEl.classList.remove("hidden");

    // Hide the "filled cart" element
    filledCartEl.classList.add("hidden");

    filledCartHeading.textContent = "Your Cart (0)";
    return;
  }

  emptyCartEl.classList.add("hidden");
  filledCartEl.classList.remove("hidden");

  // 3. Compute the total price of all items in the cart

  let totalQuantity = keys.reduce((sum, key) => sum + cart[key].quantity, 0); //5

  // 4. Update the cart heading with the total quantity
  filledCartHeading.textContent = `Your Cart (${totalQuantity})`;

  // Clear previous line items
  cartItemsContainer.innerHTML = ""; // Clear previous items in the cart //6

  let grandTotal = 0;

  // loop through each product-index key in the cart
  keys.forEach((key) => {
    // Destructure the products objects and its quantity

    let { product, quantity } = cart[key];
    let lineTotal = product.price * quantity; // calculate the total price for this product
    grandTotal += lineTotal; // add to the grand total

    let lineDiv = document.createElement("div");
    lineDiv.classList.add(
      "flex",
      "justify-between",
      "items-center",
      "py-3",
      "border-b",
      "border-[var(--Rose100)]"
    );

    lineDiv.innerHTML = `<div class= "flex flex-col items-start gap-1.5">
      <P class= "text-[14px] font-semibold text[var(--Red)]">${product.name}</P>
      <div class="flex items-center gap-3">
       <P class= "text-[14px] text-[var(--Rose400)] font-normal">${quantity}x</P> 
        <div class= "flex items-center gap-2"> 
          <p class= "text-[14px] text-[var(--Rose400)] font-normal">@ ${formatCurrency(
            product.price
          )}</p> 
          <p class= "text-[14px] text-[var(--Rose500)] font-semibold">${formatCurrency(
            lineTotal
          )}</p> 
       </div> 
      </div>
    </div>
    
    <div class= "cart-del border-2 border-[var(--Rose300)] hover:border-[var(--Rose900) 
    w-[18px] h-[18px] rounded-full flex justify-center items-center cursor-pointer" 
    data-key= "${key}" tabindex="0">
    <img src="/assets/images/icon-remove-item.svg"  />    
    </div>`;

    cartItemsContainer.appendChild(lineDiv);
  });

  grandTotalEl.textContent = formatCurrency(grandTotal);

  // Attach listeners to each ".cart-del"

  cartItemsContainer.querySelectorAll(".cart-del").forEach((hex) => {
    hex.addEventListener("click", () => {
      let keyToRemove = hex.dataset.key;
      removeFromCart(keyToRemove);
    });
  });
};

// Populate the modal's inner <div>
let populateModalItems = () => {
  modalItemsContainer.innerHTML = "";

  let keys = Object.keys(cart);

  let totalOnModal = 0;

  keys.forEach((key) => {
    let { product, quantity } = cart[key];
    let lineTotal = product.price * quantity; // compute the total price for this product
    totalOnModal += lineTotal; // add to the grand total

    let modalItems = document.createElement("div");
    modalItems.classList.add(
      "flex",
      "items-center",
      "justify-between",
      "py-3",
      "border-b",
      "border-[var(--Rose300)]"
    );

    modalItems.innerHTML = `<div class="flex items-center gap-2">
     <img src= "${product.image.thumbnail}" class="rounded"/>

     <div class="flex flex-col items-start gap-1.5">
       <p class="text-[14px] font-semibold text-[var(--Rose900)]">${
         product.name
       }</p>
       <div class= "flex items-center gap-3">
         <p class= "text-[14px] font-semibold text-[var(--Red)]">${quantity}x</p>
         <p class="text-[14px] font-semibold text-[var(--Rose500)]">@ ${formatCurrency(
           product.price
         )}</p>
       </div>
     </div>
    </div>
    
    <p>
    ${formatCurrency(lineTotal)}
    </p>`;

    modalItemsContainer.appendChild(modalItems);
  });

  // Final "Order Total" row
  let totalDiv = document.createElement("div");
  totalDiv.classList.add("flex", "items-center", "justify-between", "pt-4");
  totalDiv.innerHTML = `<p class= "text-[14px] font-normal text-[var(--Rose900)]">Order Total</p>
  <h2 class="text-[24px] font-bold text-[var(--Rose900)]">${formatCurrency(
    totalOnModal
  )}</h2>`;

  modalItemsContainer.appendChild(totalDiv);
};

let backdropOverlay = null;

// Show/ hide the modal
let setupModalBehaviour = () => {
  confirmOrderBtn.addEventListener("click", () => {
    if (Object.keys(cart).length === 0) {
      return;
    }

    // Insert backdrop overlay
    backdropOverlay = document.createElement("div");
    backdropOverlay.id = "backdrop-overlay";

    Object.assign(backdropOverlay.style, {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0, 0.4)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
    });

    document.body.appendChild(backdropOverlay);

    populateModalItems();

    // un-hide the modal and apply positioning
    modalDesk.classList.remove("hidden");
    let isModalMobile = window.innerWidth <= 640;

    if (isModalMobile) {
      Object.assign(modalDesk.style, {
        display: "flex",
        position: "fixed",
        left: "0",
        right: "0",
        bottom: "-100%",
        transition: "bottom 0.3s ease-in-out",
        zIndex: 2000,
      });

      window.requestAnimationFrame(() => {
        modalDesk.style.bottom = "0";
      });
    } else {
      Object.assign(modalDesk.style, {
        display: "flex",
        position: "fixed",
        flexDirection: "column",
        left: "50%",
        right: "50%",
        bottom: "50%",
        transform: "translate(-50%, 50%)",
        zIndex: 2000,
      });
    }

    refreshCartUI();

    // START NEW ORDER BUTTON FUNCTIONALITY
    startNewOrderBtn.addEventListener("click", () => {
      // 1. Clear the in-memory cart
      cart = {};

      // 2. Refresh the cart UI (switches back to empty cart view)
      refreshCartUI();

      // 3. Hide the modal
      modalDesk.classList.add("hidden");

      // 4. Reset modal inline styles so it doesn't remain positioned
      modalDesk.style = "";

      // 5. Remove backdrop overlay if it exists
      if (backdropOverlay) {
        document.body.removeChild(backdropOverlay);
        backdropOverlay = null;
      }
    });
    startNewOrderBtn.addEventListener("click", () => {
      // 1. Clear the in-memory cart
      cart = {};

      // 2. Reset all product cards back to "Add to Cart"
      document.querySelectorAll(".product-item").forEach((productWrapper) => {
        let parentRel = productWrapper.querySelector(".relative");
        let existingAdded = parentRel.querySelector(".added-to");

        if (existingAdded) {
          // Create a new Add to Cart button
          let addDiv = document.createElement("div");
          addDiv.classList.add(
            "add-to",
            "bg-[var(--Rose50)]",
            "flex",
            "items-center",
            "justify-center",
            "gap-2",
            "py-2.5",
            "w-[160px]",
            "border",
            "border-[var(--Rose400)]",
            "rounded-3xl",
            "absolute",
            "left-[24%]",
            "right-[24%]",
            "bottom-[-21.5px]",
            "cursor-pointer",
            "sm:left-[15%]",
            "sm:right-[15%]"
          );
          addDiv.setAttribute("tabindex", "0");
          addDiv.innerHTML = `
        <img src="./assets/images/icon-add-to-cart.svg" />
        <a href="" class="text-[14px] font-semibold text-[var(--Rose900)]">Add to Cart</a>
      `;

          parentRel.replaceChild(addDiv, existingAdded);
        }
      });

      // 3. Refresh the cart UI (switches back to empty cart view)
      refreshCartUI();

      // 4. Hide the modal
      modalDesk.classList.add("hidden");
      modalDesk.style = "";

      // 5. Remove backdrop overlay
      if (backdropOverlay) {
        document.body.removeChild(backdropOverlay);
        backdropOverlay = null;
      }
    });
  });
};

console.log(cart);

renderProducts();
attachQuantityListeners();
refreshCartUI();
setupModalBehaviour();
