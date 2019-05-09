// ======================
// VARIABLES
// ======================

// pull budgetItems array from localStorage and parse it from a string into an array
var budgetItems = JSON.parse(localStorage.getItem("budgetItems"));
// pull lastID number from localStorage; if not available, start lastID at 0
var lastID = localStorage.getItem("lastID") || 0;

// if budgetItems is NOT an array (if no budgetItems were stored in localStorage), create 
// an empty array instead
if (!Array.isArray(budgetItems)) {
    budgetItems = [];
}


// ======================
// FUNCTIONS
// ======================

// function to update latest budgetItems and lastID values in localStorage (we turn budgetItems 
// into a string first to placate localStorage)
function updateStorage() {
    localStorage.setItem("budgetItems", JSON.stringify(budgetItems));
    localStorage.setItem("lastID", lastID);
}

// takes in an array (optional) and renders each budget item into a row on the table, also updates
// the total amount spent based on the array provided or the full list from budgetItems, if no
// array is passed in
function renderItems(items) {
    // if no specific array is passed in, use the full budgetItems array
    if (!items) {
        items = budgetItems;
    }

    // saving reference to tbody
    var tbody = $("#budgetItems tbody");
    // emptying out previous budget items before rendering newest budget items
    tbody.empty();

    // looping through budget items
    items.forEach(function(item) {
        // creating a new row for each, and putting a 'data-id' attribute on the row (we'll use this 
        // later to know which budget item to delete on click of the delete 'x')
        var row = `<tr data-id=${item.id}><td>${item.date}</td><td>${item.name}</td><td>${item.category}</td><td>$${parseFloat(item.amount).toFixed(2)}</td><td>${item.notes}</td><td class="delete"><span>x</span></td></tr>`
        // prepending each row (created above) to the tbody element
        tbody.prepend(row);
    });

    // using a reduce to get a total amount spent for all budget items in either the passed-in
    // array OR the default budgetItems array
    var total = items.reduce(function(accum, item) {
        return accum + parseFloat(item.amount);
    }, 0);
    // printing that total on the page, and using '.toFixed(2)' to print out exactly two decimal points
    $("#total").text(`$${total.toFixed(2)}`);
}


// ======================
// MAIN PROCESS
// ======================

// rendering the initial budgetItems on the page
renderItems();

// click event for the 'Enter New Budget Item' button and 'Hide Form' button/link
$("#toggleFormButton, #hideForm").on("click", function() {
    var form = $("#addItemForm");
    var button = $("#toggleFormButton");

    // toggling the visibility of the form
    form.toggle("slow", function() {
        // ...and changing the text of the button to reflect the current visiblity state of the form
        if (form.is(":visible")) {
            button.text("Hide Form");
        } else {
            button.text("Enter New Budget Item");
        }
    });
})

// click event for the 'Add Budget Item' button
$("#addItem").on("click", function(event) {
    event.preventDefault();

    // gather user input into an object, adding in the current date/timestamp and a unique id
    var newItem = {
        id: ++lastID,
        date: moment().format("lll"),
        name: $("#name").val().trim(),
        category: $("#category").val(),
        amount: $("#amount").val().trim() || 0, // if no amount is specified, default to '0'
        notes: $("#notes").val().trim()
    }

    budgetItems.push(newItem);
    // updating localStorage with latest budgetItems/lastID values
    updateStorage(); 
    // rendering the updated budget items to the page
    renderItems(); 
    // clearing out the input fields to allow easier user input of new budget items
    $("#addItemForm input, #addItemForm select").val("");
});

// click event to watch value changes in the category select dropdown
$("#categoryFilter").on("change", function() {
    // grabbing selected category
    var category = $(this).val();

    // if a valid category is chosen...
    if (category) {
        // filter budgetItems array to get array of items matching that category
        var categoryItems = budgetItems.filter(function(item) {
            return item.category === category;
        });

        // ...and render just those items in the table
        renderItems(categoryItems);
    // else render all budget items
    } else {
        renderItems();
    }
})

// click event for the delete buttons... note the event delegation syntax, which is necessary to
// make it so our delete button clicks work on all rows, even after the items are rerendered due
// to the selected category changing or an item being added or deleted 
$("#budgetItems").on("click", ".delete", function() {
    // grabbing the 'data-id' of the row containing the delete 'x' that was clicked;
    // converting it from a string to an integer
    var id = parseInt($(this).parent("tr").attr("data-id"));
    // filtering budgetItems to get an array of all budget items BUT the one we want to delete
    var remainingItems = budgetItems.filter(function(item) {
        return item.id !== id
    });
    
    // updating the budgetItems variable to store the filtered version created aboce
    budgetItems = remainingItems;
    // updating localStorage with the latest budgetItems array
    updateStorage();
    // rendering the updated budget items in the table
    renderItems();
    // resetting the category filter to the default
    $("#categoryFilter").val("");
});