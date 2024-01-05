
let itemCounter = 2; // for addNewItemFiled function
let costumer_cpf = ""; // Costumer identification data that will be saved on sale registry

function addItem() { // Add Items

    const dynamicFields = document.getElementById("items");
    const newItem = `
    <div id="item${itemCounter}" class="form-row d-inline-flex row mb-1">
        <label for="barcode${itemCounter}" display: block>EAN:</label>
        <input type="text" name="barcode${itemCounter}" id="barcode${itemCounter}" class="form-control mr-1" onchange= "getItem('${itemCounter}')" required>

        <input id="itemDescription${itemCounter}" placeholder="Item Description" class="form-control mr-1" required disabled></p>

        <label for="quantity${itemCounter}" display: block>Quantity:</label>
        <input type="number" name="quantity${itemCounter}" id="quantity${itemCounter}" class="form-control mr-1" required disabled>
        
        <label for="price${itemCounter}" display: block>Price:</label>
        <input type="number" name="price${itemCounter}" id="price${itemCounter}" class="form-control mr-1" required disabled>
        
        <button type="button" class="btn btn-danger form-control" onclick="removeItem(${itemCounter})" > X </button>
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
    var user_registry_field = document.getElementById('costumerRegistry').value;
    var costumerNameField = document.getElementById('costumerName');

    xhr.open('POST', '/sales/register/getCostumer', true);
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // On sucessfull response
            
            // Clear costumer name
            costumerNameField.value = ""

            // Handle the response from the server
            var response = JSON.parse(xhr.responseText);
            costumer_cpf = response.costumer_cpf;
            costumer_name = response.costumer_name;
            costumer_store = response.costumer_store;
            costumerNameField.value = costumer_name;
            costumerNameField.placeholder = costumer_name;
            
                } else if (xhr.readyState === 4 && xhr.status === 404) {
                    // 404 if costumer not found
                    if (costumerNameField.value) {

                        costumerNameField.value = ''
                        costumerNameField.placeholder = 'Invalid Costumer'
                        alert('Costumer not found. Please, type a valid costumer')

                    } else {

                    costumerNameField.placeholder = 'Invalid Costumer'
                    alert('Costumer not found. Please, type a valid costumer')

                    }
                }
            }    // Send the POST request with the costumerRegistryField as data
    xhr.send(user_registry_field);
}

function getItem(item) {

    const itemDesc = document.getElementById("itemDescription"+item)
    const itemPrice = document.getElementById("price"+item)
    const itemQuantity = document.getElementById("quantity"+item)

    var xhr = new XMLHttpRequest();
    var barcode = document.getElementById('barcode'+item).value;

    xhr.open('POST', '/sales/register/getItem', true);
    xhr.setRequestHeader('Content-Type', 'text/plain')

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {

            var response = JSON.parse(xhr.responseText);

            itemDesc.value = response.itemDescription;
            itemDesc.placeholder = response.itemDescription

            itemQuantity.disabled = false;
            itemPrice.disabled = false;

            itemPrice.placeholder = response.suggestedPrice;
            itemQuantity.placeholder = response.AvaliableQuantity; 

            } else if (xhr.readyState === 4 && xhr.status === 404) {
                // 404 Item not found
                alert('Item not found, please, try a valid item!')

                // Check if field is open then close
                if (itemPrice.disabled === false) {
                    
                    itemPrice.disabled = true;
                    itemQuantity.disabled = true;

                    itemDesc.placeholder = 'Invalid Item';
                    itemPrice.placeholder = itemQuantity.placeholder = '';
                    itemDesc.value = itemPrice.value = itemQuantity.value = '';

                } else {

                    itemDesc.placeholder = 'Invalid Item';
                    itemPrice.placeholder = itemQuantity.placeholder = '';
                    itemDesc.value = itemPrice.value = itemQuantity.value = '';

                }
            }
        }
    xhr.send(barcode)
}

function validFields() {
    const form = document.getElementById("saleForm");
    const inputs = form.querySelectorAll("input");
    const ps = form.querySelectorAll("p")

    let costumerNameValue = document.getElementById('costumerName').value
    let barcodeValue;
    let itemDescriptionValue;
    let quantityValue;
    let priceValue;
    let allFieldsFilled = true;

    if (costumerNameValue) {
           
        inputs.forEach((input) => {
            switch (input.name) {
                case input.name.startsWith("barcode"):
                    barcodeValue = input.value;
                    break;
                case input.name.startsWith("itemDescription"):
                    itemDescriptionValue = input.value;
                    break;
                case input.name.startsWith("quantity"):
                    quantityValue = input.value;
                    break;
                case input.name.startsWith("price"):
                    priceValue = input.value;
                    break;
            }
            if (input.required && !input.value.trim()) {
                allFieldsFilled = false;
                console.log(input.value)
            }
        });

        if (!allFieldsFilled) {
            alert("Please, fill all required fields.");
            return;
        } else {
            registerSale()
        }

} else {
    alert("Set a costumer to complete the sale!");
    return;
}
    }
     

function registerSale() {

    // Header data to input sale
    let formData_costumerRegistry = document.getElementById('costumerRegistry').value
    let formData_costumerName = document.getElementById('costumerName').value
    let formData_cpf = costumer_cpf
    let formData_costumerStore = costumer_store

    header_data = {
        'costumerRegistry': formData_costumerRegistry,
        'costumerName': formData_costumerName,
        'costumerCPF': formData_cpf,
        'costumerStore': formData_costumerStore
    }

    // Items data to input sale
    itemsDiv = document.getElementById('items')

    items_data = { // create a json to populate it with form data to send to backend
    }

    for (let itemNumber = 0; itemNumber < itemsDiv.children.length; itemNumber++) {
        // This loop will populate the json items_data with the values of each form filed on each item div that exists on items div
        
        // 1. First get item number. Remove and Add items can make the item number not be on sequence, like in case of user add 3 items, remove item 2 then submit
        let item = itemsDiv.children[itemNumber].id;
        let item_id = item.substring(4); // Drop the word "item" to get only the id number of item to iterate
        
        // 2. Then declare to a variable each form field on selected item
        formData_barcode = document.getElementById('barcode'+item_id).value
        formData_itemDescription = document.getElementById('itemDescription'+item_id).value
        formData_quantity = document.getElementById('quantity'+item_id).value
        formData_price = document.getElementById('price'+item_id).value
        
        // 3. Now populate the items_data json to send to backend
        itemAppend = {
            'barcode':formData_barcode,
            'itemDescription':formData_itemDescription,
            'quantity':formData_quantity,
            'price':formData_price
        }

        items_data[item] = itemAppend

    } // Sending the sale data to register on database and retrieving sale_id
        xhr = new XMLHttpRequest();

        xhr.open('POST', '/sales/register/registerSale', true);
        xhr.setRequestHeader('Content-Type', 'application/json')

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            response = JSON.parse(xhr.responseText);
            PDFContainer = document.getElementById("receiptContainer");
            PDFContainer.style.visibility = "visible";
            // Sending header data to receipt the sale data to create a pdf
            document.getElementById('RsaleStore').innerText = response.sale_store
            document.getElementById('RsellerName').innerText = response.seller_name
            document.getElementById('RsaleId').innerText = response.sale_id
            document.getElementById('RsaleDate').innerText = response.datetime

            document.getElementById('RcostumerRegistry').innerText = response.costumer_registry
            document.getElementById('RcostumerName').innerText = response.costumer_name
            document.getElementById('RcostumerCPF').innerText = response.costumer_cpf
            document.getElementById('RcostumerStore').innerText = response.costumer_store
            }

        }

        // Cleaning all rows from table
        rows = document.getElementById('itemsPDF');

        while (rows.firstChild) {
            rows.removeChild(rows.firstChild)
        }

// Sending items data to receipt the sale data to create a pdf
        var saleTotal = 0
    for (item in items_data) {
        var barcode = items_data[item]['barcode']
        var itemDescription = items_data[item]['itemDescription']
        var quantity = items_data[item]['quantity']
        var price = items_data[item]['price']
        var itemTotal = price * quantity
        var row = ` <tr id='row+${item}'>
                        <td id='barcode+${item}'>${barcode}</td>
                        <td id='name+${item}'>${itemDescription}</td>
                        <td id='quantity+${item}'>${quantity}</td>
                        <td id='price+${item}'>R$ ${price}</td>
                        <td id='total+${item}'>R$ ${itemTotal}</td>
                    </tr>`
        tableToAppend = document.getElementById('itemsPDF')
        tableToAppend.insertAdjacentHTML("beforeend", row);
        var saleTotal = saleTotal + itemTotal
    }
    document.getElementById('totalValue').innerText = saleTotal

        header_json = JSON.stringify(header_data);
        items_json = JSON.stringify(items_data);
        sale_data = JSON.stringify({
                'header': header_json,
                'items': items_json
        })
        xhr.send(sale_data);
        setTimeout(printReceipt, 1000);

}

// Trying to print converting on a pdf
function printReceipt() {

            // Creating a copy of receipt then printing
            receiptContainer = document.getElementById('receiptContainer')
            if (receiptContainer.children.length === 1) {
                receiptContainer.insertAdjacentHTML("beforeend", document.getElementById('receiptContainer').innerHTML)
            } else {
                // Do nothing
            }
            if (receiptContainer.style.visibility = 'collapse') {
                receiptContainer.style.visibility = 'visible'
            } else {
                // Do nothing
            }

            // Create a new jsPDF instance
            const pdf = new window.jspdf.jsPDF({
                unit: 'mm',
                format: 'a4',
                autoPrint: true
            });

            const contentToPrint = document.getElementById("receiptContainer");

            html2canvas(contentToPrint).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                
                pdf.addImage(imgData, 'PNG', 0, 0, 210, 0);
                
                // Convert the PDF to a Blob
                const pdfBlob = pdf.output('blob');
                // Create a URL for the Blob
                const fileURL = URL.createObjectURL(pdfBlob);
                // Open the PDF in a new tab
                window.open(fileURL);
                // To do - Remove the copy of receipt used to print of the user screen
            });
            receiptContainer.removeChild(receiptContainer.lastChild)
            receiptContainer.style.visibility = 'collapse'
}

function cleanForm() {
    receiptContainer = document.getElementById('receiptContainer')
    receiptContainer.innerHTML = `
    <div id="receipt" name="receipt" class="receipt_container bg-white">
    <div class="header">
        <h2>Receipt</h2>
        <div id="sale_info">
            <p class="header_item">Sale Store: <span id="RsaleStore"></span></p>
            <p class="header_item">Sale ID: <span id="RsaleId"></span></p>
            <p class="header_item">Seller Name: <span id="RsellerName"></span></p>
            <p class="header_item">Sale Date: <span id="RsaleDate"></span></p>
        </div>
        <div id="costumer_info">
            <p class="header_item">Costumer Registry: <span id="RcostumerRegistry"></span></p>
            <p class="header_item">Costumer Name: <span id="RcostumerName"></span></p>
            <p class="header_item">Costumer CPF: <span id="RcostumerCPF"></span></p>
            <p class="header_item">Costumer Store: <span id="RcostumerStore"></span></p>
        </div>
    </div>

    <div class="body">
        <table id="items_info">
            <thead>
                <tr>
                    <th>Barcode</th>
                    <th>Item Description</th>
                    <th>Item Quantity</th>
                    <th>Price</th>
                    <th>Value</th>
                </tr>
            </thead>
            <tbody id="itemsPDF">
                <!-- Add dynamic rows for each item in the sale -->

                <!-- Add more rows as needed -->
            </tbody>
        </table>
    </div>
    `
    receiptContainer.style.visibility = 'collapse'
    itemsForm = document.getElementById('items')
    while (itemsForm.children.length > 1) {
        itemsForm.removeChild(itemsForm.lastChild)
        document.getElementById('itemDescription1').placeholder = 'Item Description'
        document.getElementById('quantity1').placeholder = ''
        document.getElementById('price1').placeholder = ''
        document.getElementById('costumerName').placeholder = 'Costumer Name'
    }
    itemCounter = 2
}