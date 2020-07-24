// ======================
// VARIABLES
// ======================

// pulls budgetItems array from localStorage and parses it from a string into an array... if falsy, set to []
let budgetItems = JSON.parse(localStorage.getItem("budgetItems_demo")) || [];
// pulls lastID number from localStorage; if falsy, set to 0
let lastID = parseInt(localStorage.getItem("lastID_demo")) || 0;


// ======================
// FUNCTIONS
// ======================

// function to update latest budgetItems and lastID values in localStorage (we convert budgetItems into a string first to placate localStorage)
const updateStorage = () => {
    localStorage.setItem("budgetItems_demo", JSON.stringify(budgetItems));
    localStorage.setItem("lastID_demo", lastID);
}

// takes in an optional array and renders each budget item into a row on the table; also updates the total amount spent based on the array provided or the full list from budgetItems, if no array is passed in
const renderItems = items => {
    // if no specific array is passed in, uses the full budgetItems array
    if (!items) items = budgetItems;
    // saves reference to tbody (to reuse later)
    const tbody = $("#budgetItems tbody");
    // empties out previous budget items before rendering newest budget items
    tbody.empty();

    // loops through budget items (using object destructuring!)
    for (const { id, date, name, category, amount, notes } of items) {
        // creates a new row for each item, and puts 'data-id' attribute on the row (we'll use this later to know which budget item to delete on click of the delete 'x')
        const row = `<tr data-id=${id}><td>${date}</td><td>${name}</td><td>${category}</td><td>$${parseFloat(amount).toFixed(2)}</td><td>${notes}</td><td class="delete"><span>x</span></td></tr>`;
        // appends each row (created above) to the tbody element
        tbody.append(row);        
    }

    // using a reduce to get a total amount spent for all budget items in either the passed-in array OR the default budgetItems array
    const total = items.reduce((accum, { amount }) => accum + parseFloat(amount), 0);
    // prints that total on the page, and using '.toFixed(2)' to print out exactly two decimal points
    $("#total").text(`$${total.toFixed(2)}`);
}


// ======================
// MAIN PROCESS
// ======================

// renders the initial budgetItems on the page
renderItems();

// click event for the 'Enter New Budget Item' button and 'Hide Form' button/link
$("#toggleFormButton, #hideForm").on("click", function() {
    // toggles the visibility of the form
    $("#addItemForm").toggle("slow", function() {
        // ...and changes the text of the button to reflect the current visiblity state of the form
        $("#toggleFormButton").text($(this).is(":visible") ? "Hide Form" : "Enter New Budget Item");
    });
});

// click event for the 'Add Budget Item' button
$("#addItem").on("click", function(event) {
    event.preventDefault();

    // gather suser input into an object, adding in the current date/timestamp and a unique id
    const newItem = {
        id: ++lastID,
        date: moment().format("lll"),
        name: $("#name").val().trim(),
        category: $("#category").val(),
        amount: $("#amount").val().trim(),
        notes: $("#notes").val().trim()
    }

    // destructures name, category, and amount for easy access
    const { name, category, amount } = newItem;
    // if either name, category, or amount are NOT specified, alerts the user/break out of function
    if (!name || !category || !amount) return alert("Each budget item must have a valid item name, category, and amount!");

    // else adds newest item to budgetItems array
    budgetItems.push(newItem);
    // updates localStorage with latest budgetItems/lastID values
    updateStorage();
    // renders the updated budget items to the page
    renderItems();
    // resets the form to allow easier user input of new budget items
    $("#addItemForm form")[0].reset();
    // resets the category filter to the default
    $("#categoryFilter").val("");
});

// click event to watch for value changes in the category select dropdown
$("#categoryFilter").on("change", function() {
    // grabbing selected category
    const category = $(this).val();

    // if a valid category is chosen...
    if (category) {
        // filters budgetItems array to get array of items matching that category
        const filteredItems = budgetItems.filter(item => item.category === category);
        // ...and renders just those items in the table
        renderItems(filteredItems);
    // else renders all budget items
    } else {
        renderItems();
    }
});

// click event for the delete buttons... note the event delegation syntax, which is necessary to make it so our delete button clicks work on all rows, even after the items are rerendered due to the selected category changing or an item being added or deleted 
$("#budgetItems").on("click", ".delete span", function() {
    // grabs the 'data-id' of the row containing the delete 'x' that was clicked
    const id = $(this).parents("tr").data("id");
    // filters budgetItems to get an array of all budget items BUT the one we want to delete
    const remainingItems = budgetItems.filter(item => item.id !== id);
    // updates the budgetItems variable to store the filtered version created above
    budgetItems = remainingItems;
    // updates localStorage with the latest budgetItems array
    updateStorage();
    // renders the updated budget items in the table
    renderItems();
    // resets the category filter to the default
    $("#categoryFilter").val("");
});