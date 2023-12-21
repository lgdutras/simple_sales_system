let itemCounter = 2; // for addNewItemFiled function
let costumer_cpf = ""; // Costumer identification data that will be saved on sale registry

function addItem() { // Add Items
    const dynamicFields = document.getElementById("items");
    const newItem = `
    <div id="item${itemCounter}" class="form-group d-inline-flex row">
        <label for="barcode${itemCounter}">EAN:</label>
        <input type="text" name="barcode${itemCounter}" id="barcode${itemCounter}" class="form-control" onchange= "getItem('${itemCounter}')" required><br><br>

        <p id="ItemDescription${itemCounter}">Item Description</p>

        <label for="item">Quantity:</label>
        <input type="number" name="quantity${itemCounter}" id="quantity${itemCounter}" class="form-control" required><br><br>
        
        <label for="item">Price:</label>
        <input type="number" name="price${itemCounter}" id="price${itemCounter}" class="form-control" required><br><br>
        
        <button type="button" class="btn btn-danger" onclick="removeItem(${itemCounter})" > X </button>
    </div>
    `;
    document.getElementById("itemCounter").value = itemCounter;
    dynamicFields.insertAdjacentHTML("beforeend", newItem);
    itemCounter++;
}

function removeItem(item) {
    const dynamicFields = document.getElementById("items");
    const itemToRemove = document.getElementById("item"+item)

    if (itemToRemove) {
        dynamicFields.removeChild(itemToRemove);
    }
}

function getCostumer() {
    var xhr = new XMLHttpRequest();
    var user_registry_field = document.getElementById('userRegistry').value;

    xhr.open('POST', '/sales/register/getCostumer', true);
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
        // Handle the response from the server
        var response = JSON.parse(xhr.responseText);
        document.getElementById('costumer').innerHTML = response.costumer_name;
        costumer_cpf = response.costumer_cpf;
}}    // Send the POST request with the userRegistryField as data
    xhr.send(user_registry_field);
}

function getItem(item) {

    const itemDesc = document.getElementById("ItemDescription"+item)
    const itemPrice = document.getElementById("price"+item)
    const itemQuantity = document.getElementById("quantity"+item)

    console.log(itemDesc)

    var xhr = new XMLHttpRequest();
    var barcode = document.getElementById('barcode'+item).value;

    xhr.open('POST', '/sales/register/getItem', true);
    xhr.setRequestHeader('Content-Type', 'text/plain')

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            itemDesc.innerHTML = response.itemDescription;
            itemPrice.placeholder = response.suggestedPrice;
            itemQuantity.placeholder = response.AvaliableQuantity; 
        }
    }
    xhr.send(barcode)
}