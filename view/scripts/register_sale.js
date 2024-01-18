
let itemCounter = 2; // for addNewItemFiled function
let costumer_cpf = ""; // Costumer identification data that will be saved on sale registry
let receipt_id = '';
/*
Receipt Id is set null on load and is used on function OpenReceipt to check if is one receipt opened.
The check is done on backend in openReceipt Endpoint.

Current receipt Id is passed and if exists with opened status is deleted on database.
Existing or not, the code procedes to open a new receipt
*/

function addItem() { // Add Items

    const dynamicFields = document.getElementById("items");
    const newItem = `
    <div id="item${itemCounter}" class="form-row d-inline-flex row my-1">
        <input type="text" name="barcode${itemCounter}" id="barcode${itemCounter}" placeholder="Barcode" class="form-control mr-1 col-md-2" onchange= "getItem('${itemCounter}')" required>
        <input id="itemDescription${itemCounter}" placeholder="Item Description" class="form-control mr-1 col-md" required disabled>
        <input type="number" name="quantity${itemCounter}" id="quantity${itemCounter}" placeholder="Quantity" class="form-control mr-1 col-md-2" required disabled>
        <input type="number" name="price${itemCounter}" id="price${itemCounter}" placeholder="Price Ex. 5.99" class="form-control mr-1 col-md-2" required disabled>
        <button type="button" name="lock${itemCounter}" id="lock${itemCounter}" class="btn btn-info form-control pt-2 mr-1" onclick="LockUnlockItem(${itemCounter})">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lock-fill" viewBox="0 0 16 16">
            <path id='icoLock${itemCounter}' value="unlocked" d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2"/>
        </svg>
    </button>
    
    <button type="button" class="btn btn-danger form-control pt-2" onclick="removeItem(${itemCounter})" >
        <span id='pass-ico' class='mb-0'>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
            </svg>
        </span>
    </button>
    </div>
    `;

    document.getElementById("itemCounter").value = itemCounter;
    dynamicFields.insertAdjacentHTML("beforeend", newItem);
    itemCounter++;
}

function removeItem(item) {
    console.log('removing item '+item)
    const dynamicFields = document.getElementById("items");
    const itemToRemove = document.getElementById("item"+item)

    barcodeDel = document.getElementById('barcode'+item).value

    xhr = new XMLHttpRequest()
    xhr.open('POST', '/sales/register/removeItem')
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.onreadystatechange = function() {

        if (xhr.readyState == 4 && xhr.status == 200) {

            response = JSON.parse(xhr.responseText)
            if (itemToRemove) {
                dynamicFields.removeChild(itemToRemove);
            }
        }
    }

    deletionItem = JSON.stringify({
        'barcode': barcodeDel,
        'receipt_id': receipt_id
    })
    xhr.send(deletionItem)

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
            openReceipt(user_registry_field)
            
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

function openReceipt(costumer_registry) {
    xhr = new XMLHttpRequest();
    
    xhr.open('POST', '/sales/register/openReceipt', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    receiptHeader = {
        'costumer_registry': costumer_registry,
        'costumer_store': costumer_store,
        'receipt_id': receipt_id
    }

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            receipt_id = response.receipt_id
            console.log('The new receipt id is ' + receipt_id)
        }
    }

    jsonReceiptHeader = JSON.stringify(receiptHeader)
    xhr.send(jsonReceiptHeader);
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

function holdItem(item) {
    // This function will write the requested item on database where getItem returns positive

    row_id = item
    barcode = document.getElementById('barcode'+row_id)
    quantity = document.getElementById('quantity'+row_id)
    price = document.getElementById('price'+row_id)

    xhr = new XMLHttpRequest();
    xhr.open('POST', '/sales/register/holdItem')
    xhr.setRequestHeader('Content-Type', 'application/json')


    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {

            response = JSON.parse(xhr.responseText);
            barcode.disabled = true
        }
    }

    item = {
        'receipt_id': receipt_id,
        'barcode': barcode.value,
        'quantity': quantity.value,
        'price': price.value
    }

    xhr.send(JSON.stringify(item))
}

function LockUnlockItem(item) {

    row_id = item
    unlockedIco = "M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2"
    lockedIco = "M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2m3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"

    lockIco = document.getElementById('icoLock'+row_id)
    lockBtn = document.getElementById('lock'+row_id)
    icoPath = lockIco.getAttribute('d')
    icoValue = lockIco.getAttribute('value')
    
    // Fields to manage
    barcode = document.getElementById('barcode'+row_id)
    quantity = document.getElementById('quantity'+row_id)
    price = document.getElementById('price'+row_id)


    if (icoValue == 'unlocked') {
        // Set locked then change ico
        lockIco.setAttribute("value", "locked")
        lockBtn.setAttribute("value", "locked")
        lockBtn.setAttribute("value", "locked")
        lockIco.setAttribute("d", lockedIco)

        // Call hold items to register item on database in a opened receipt or update the current value
        holdItem(item)

        // Lock Fields
        barcode.disabled =  true
        quantity.disabled = true
        price.disabled = true
		lockBtn.classList.remove("btn-info");
		lockBtn.classList.add("btn-secondary");

    } else {
     
        // Set locked then change ico
        lockIco.setAttribute("value", "unlocked")
        lockBtn.setAttribute("value", "unlocked")
        lockIco.setAttribute("d", unlockedIco)

        // Unlock Fields
        barcode.disabled =  false
        quantity.disabled = false
        price.disabled = false	
		
		lockBtn.classList.remove("btn-secondary");
		lockBtn.classList.add("btn-info");
    }
}

function validFields() {
    const form = document.getElementById("saleForm");
    const inputs = form.querySelectorAll("input");
    const buttons = form.querySelectorAll("button")
    const ps = form.querySelectorAll("p")

    let costumerNameValue = document.getElementById('costumerName').value
    let barcodeValue;
    let itemDescriptionValue;
    let quantityValue;
    let priceValue;
    let lockValue;
    let allFieldsFilled = true;
    let allFieldsLocked = true;

    if (costumerNameValue) {
          
        buttons.forEach((button) => {
            if (button.id.startsWith('lock')) {
                if(button.value == 'locked') {
                    // Do nothing
                } else {
                    // Set validation false
                    allFieldsLocked = false
                }
            }
        })

        if (allFieldsLocked == true) {
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
            alert("Lock all fields to complete the sale");
            return;
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
        'receipt_id': receipt_id,
        'costumerRegistry': formData_costumerRegistry,
        'costumerName': formData_costumerName,
        'costumerCPF': formData_cpf,
        'costumerStore': formData_costumerStore
    }

    // Items data to input sale
    itemsDiv = document.getElementById('items')

    items_data = { } // create a json to populate it with form data to send to backend

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

    } // Sending the sale data to register on database and retrieving receipt_id
        xhr = new XMLHttpRequest();

        xhr.open('POST', '/sales/register/closeReceipt', true);
        xhr.setRequestHeader('Content-Type', 'application/json')

        xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            response = JSON.parse(xhr.responseText);
            PDFContainer = document.getElementById("receiptContainer");
            PDFContainer.style.visibility = "visible";

            // Sending header data to receipt the sale data to create a pdf
            document.getElementById('RsaleStore').innerText = response.sale_store
            document.getElementById('RsellerName').innerText = response.seller_name
            document.getElementById('RsaleId').innerText = response.receipt_id
            document.getElementById('RsaleDate').innerText = response.datetime

            document.getElementById('RcostumerRegistry').innerText = response.costumer_registry
            document.getElementById('RcostumerName').innerText = response.costumer_name
            document.getElementById('RcostumerCPF').innerText = response.costumer_cpf
            document.getElementById('RcostumerStore').innerText = response.costumer_store
            }

            receipt_id = ''

        }

        // Cleaning all rows from table
        rows = document.getElementById('itemsPDF');
        receiptContainer = document.getElementById('receiptContainer')
        
        if (receiptContainer.style == 'collapse') {
            receiptContainer.style = 'visible';
        }

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

    <div id="footer" class="footer">
        <p class="header_item">Customer Signature: ___________________________</p>
        <p class="header_item">Total Value of Purchase: $<span id="totalValue">00.00</span></p>
    </div>
    `
    receiptContainer.style.visibility = 'collapse'
    itemsForm = document.getElementById('items')

    if (itemsForm.children.length > 1) {
        while (itemsForm.children.length > 1) {
            itemsForm.removeChild(itemsForm.lastChild)
            }
        }
    LockUnlockItem(1)
    document.getElementById('itemDescription1').placeholder = 'Item Description'
    document.getElementById('quantity1').placeholder = ''
    document.getElementById('price1').placeholder = ''
    document.getElementById('costumerName').placeholder = 'Costumer Name'
    
    itemCounter = 2
}