
let itemCounter = 2; // for addNewItemFiled function
let costumer_cpf = ""; // Costumer identification data that will be saved on sale registry

function addItem() { // Add Items
    const dynamicFields = document.getElementById("items");
    const newItem = `
    <div id="item${itemCounter}" class="form-group d-inline-flex row">
        <label for="barcode${itemCounter}">EAN:</label>
        <input type="text" name="barcode${itemCounter}" id="barcode${itemCounter}" class="form-control" onchange= "getItem('${itemCounter}')" required><br><br>

        <p id="itemDescription${itemCounter}"></p>

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
    var user_registry_field = document.getElementById('costumerRegistry').value;

    xhr.open('POST', '/sales/register/getCostumer', true);
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // On sucessfull response

            // Clear costumer name
            document.getElementById('costumerName').innerHTML = ""

            // Handle the response from the server
            var response = JSON.parse(xhr.responseText);
            costumer_cpf = response.costumer_cpf;
            costumer_name = response.costumer_name;
            costumer_store = response.costumer_store;
            document.getElementById('costumerName').innerHTML = costumer_name;
            
                } else if (xhr.readyState === 4 && xhr.status === 404) {
                    // 404 if costumer not found
                    
                    alert('Costumer not found. Please, type a valid costumer');
                    document.getElementById('costumerName').innerHTML = '';

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
            itemDesc.innerHTML = response.itemDescription;
            itemPrice.placeholder = response.suggestedPrice;
            itemQuantity.placeholder = response.AvaliableQuantity; 

            } else if (xhr.readyState === 4 && xhr.status === 404) {

                // 404 Item not found
                alert('Item not found, please, try a valid item!');
            }
        }
    xhr.send(barcode)
}

function validFields() {
    const form = document.getElementById("saleForm");
    const inputs = form.querySelectorAll("input");
    const ps = form.querySelectorAll("p")

    let costumerNameValue = document.getElementById('costumerName').innerText
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

        // Treating innerText null values on form fields
        if (!allFieldsFilled) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        } else {
            ps.forEach((p) => {
                ps.name.startsWith("itemDescription")
                    itemDescriptionValue = ps.innerText;
                    if (input.required && itemDescriptionValue.trim() === '') {
                        allFieldsFilled = false;
                        alert("Item description cannot be empty.");
                })
            break;
            if (!allFieldsFilled) {
                registerSale()
            }

        }

} else {
    alert("Set a costumer to complete the sale!");
    return;
}
    }
     

function registerSale() {

    // Header data to input sale
    let formData_costumerRegistry = document.getElementById('costumerRegistry').value
    let formData_costumerName = document.getElementById('costumerName').textContent
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
        formData_itemDescription = document.getElementById('itemDescription'+item_id).textContent
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
            PDFContainer = document.getElementById("receipt");
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
                receiptContainer.removeChild(receiptContainer.lastChild)
                // To do - Remove the copy of receipt used to print of the user screen
            });
}