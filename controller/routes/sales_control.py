from flask import request, session, render_template, Blueprint, jsonify, url_for, redirect, abort
from model.database.dbsales import engine, Session, Costumers, Sales, Items, Receipts, Recepit_Products, update, func
import json
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

BP_register_sales = Blueprint('register_sales', __name__)
@BP_register_sales.route('/sales/register', methods = ['Post', 'Get'])
def register_sales():
    if session.get('logged_in'):
         
        return render_template('register_sale.html')
    else:
        return redirect(url_for('login.login'))

@BP_register_sales.route('/sales/register/getCostumer', methods=['Post'])
def get_costumer():

    costumer_registry = request.data.decode('utf-8')
    if costumer_registry:
        # Use a context manager for the session
        with Session() as session_costumer:
            costumer_data = session_costumer.query(Costumers).filter_by(costumer_registry=costumer_registry).first()

            if costumer_data:
                costumer_name = costumer_data.first_name + ' ' + costumer_data.last_name
                costumer_cpf = costumer_data.cpf
                costumer_store = costumer_data.costumer_store
                return jsonify({'costumer_name': costumer_name, 'costumer_cpf': costumer_cpf, 'costumer_store': costumer_store})
            else:
                abort(404, "Customer not found")
    else:
        abort(400, "Missing 'costumer_registry' in the request data")

@BP_register_sales.route('/sales/register/getItem', methods=['Post'])
def get_item():

    barcode = request.data.decode('utf-8')
    if barcode:
        sale_store = str(session['user_store'])
        session_item = Session()
        item_data = session_item.query(Items).filter_by(barcode=barcode, store=sale_store).first()

        if item_data:
            item_description = item_data.description
            item_price_suggested = float(item_data.price) / 2
            item_quantity_avaliable = item_data.quantity
                
            return jsonify({'itemDescription': item_description,
                            'suggestedPrice': item_price_suggested,
                            'AvaliableQuantity': item_quantity_avaliable})
        else: abort(404, 'Item not found')
    else:
        return abort(400, 'Invalid Barcode')

@BP_register_sales.route('/sales/register/setPrint', methods=['Post', 'Get'])
def set_print():
        
        # Requesting sale data to assembly 
        sale_data = request.get_json()
        header_data = json.loads(sale_data['header'])
        # Set Header to input on database
        costumerRegistry = header_data['costumerRegistry']
        costumerStore = header_data['costumerStore']
        # Get items to input on database
        items_data = json.loads(sale_data['items'])

        # Getting from database the last sale ID to incremment then define next
        session_SaleID = Session()
        lastSale = session_SaleID.query(Sales).order_by(Sales.sale_id.desc()).first().sale_id
        newSaleID = int(lastSale) + 1
        print(newSaleID)
        header_data.update({'saleID': newSaleID})
        sale_data = json.dumps({'header': header_data,
                                'items':items_data})
        print(sale_data)
        return jsonify(sale_data)

@BP_register_sales.route('/sales/register/registerSale', methods=['Post'])
def registerSale():
    # Get full sale data
    sale_data = request.get_json()

    header_data = json.loads(sale_data['header'])
    # Set Header to input on database
    costumerRegistry = header_data['costumerRegistry']
    costumerStore = header_data['costumerStore']
    costumerName = header_data['costumerName']
    costumerCPF = header_data['costumerCPF']
    
    # Get items to input on database
    items_data = json.loads(sale_data['items'])

    session_SaleID = Session()
    lastSale = session_SaleID.query(Sales).order_by(Sales.sale_id.desc()).first()
    newSaleID = lastSale.sale_id + 1
    session_SaleID.close

    for item in items_data.items():
        session_sale = Session()
        new_item = Sales(
                        sale_id = int(newSaleID),
                        seller_registry = int(session.get('user_registry')),
                        seller_store = int(session.get('user_store')),
                        costumer_registry = int(costumerRegistry),
                        costumer_store = int(costumerStore),
                        item_id = int(item[1]['barcode']),
                        quantity = int(item[1]['quantity']),
                        unit_price = float(item[1]['price'])
                        )
        session_sale.add(new_item)
        session_sale.commit()
        session_sale.close()

    session_sale = Session()

    sale_datetime = session_sale.query(Sales).filter_by(sale_id=newSaleID, seller_registry=int(session.get('user_registry'))).first().datetime.strftime('%d/%m/%Y %H:%M:%S')
    seller_name = session.get('firstname') + ' ' + session.get('lastname')
    sale_status = 'This sale was registered sucessfully!'
    return jsonify({'status': sale_status,
                    'sale_id': newSaleID,
                    'seller_name': str(seller_name),
                    'sale_store': session.get('user_store'),
                    'datetime': sale_datetime,
                    'costumer_registry': int(costumerRegistry),
                    'costumer_name': str(costumerName),
                    'costumer_store': int(costumerStore),
                    'costumer_cpf': str(costumerCPF)
                    })

@BP_register_sales.route('/sales/register/openReceipt', methods=['Post'])
def openReceipt():

    # Setting variable that will fill receipts table on open receipt
    receiptHeader = request.get_json()

    receipt_id = receiptHeader['receipt_id']
    costumer_registry = receiptHeader['costumer_registry']
    costumer_store = receiptHeader['costumer_store']
    seller_registry = session['user_registry']
    seller_store = session['user_store']

    # Complete receiptHeader JSON to open it creating on database
    receiptHeader.update({
        'seller_registry': seller_registry,
        'seller_store': seller_store,
        'receipt_status': '1'
    })

    
    if receipt_id: #In case of request already has a receipt_id. Update it changing costumer_registry and costumer_store.
        session_remakeReceipt = Session()
        print(f"Receipt Exists: {receipt_id}")
        previousReceipt = session_remakeReceipt.query(Receipts).get(receipt_id)
        if previousReceipt: #In case of the receipt_id passed on receiptHeader exists on database to this user with opened status (1)
            try:
                previousReceipt.costumer_registry = costumer_registry
                previousReceipt.costumer_store = costumer_store
                session_remakeReceipt.commit()
                
                # Sending header data to front-end
                return jsonify(receiptHeader)
            except SQLAlchemyError as e:
                error_message = str(e)
                session_remakeReceipt.rollback()
                return abort(500, f"Error on update previous receipt: {error_message}")
            except AttributeError as e:
                error_message = str(e)
                session_remakeReceipt.rollback()
                return abort(500, f"Error on update previous receipt: {error_message}")
        else:
            #In this case, there's no receipt opened. The code will proced to open a new one
            pass
    else: #Otherwise, In case of request has not a receipt_id. Create one.
        try:
            # Create receipt row on database
            session_openReceipt = Session()
            receipt = session_openReceipt.add(Receipts(
                seller_registry = seller_registry,
                datetime = func.to_date(datetime.now().strftime('%d/%m/%Y %H:%M:%S'), 'DD/MM/YYYY HH24:MI:SS'),
                seller_store = seller_store,
                costumer_registry = receiptHeader['costumer_registry'],
                costumer_store = receiptHeader['costumer_store'],
                receipt_status = '1',
            ))
            session_openReceipt.commit()

            # Retrieving receipt ID from primary key auto increment 'receipt_id' and registering it on receiptHeader
            receipt_id = session_openReceipt.query(Receipts).filter_by(seller_registry = seller_registry).order_by(Receipts.receipt_id.desc()).first().receipt_id
            receiptHeader.update({'receipt_id': receipt_id})

            # Sending header data to front-end
            return jsonify(receiptHeader)
        except SQLAlchemyError as e:
            error_message = str(e)
            print(f"Error on open a new receipt: {error_message}")
            session_openReceipt.rollback()
            return abort(500, f"Error on open a new receipt: {error_message}")

@BP_register_sales.route('/sales/register/holdItem', methods=['Post'])
def holdItem():

    # Get item data to save on receipt
    item = request.get_json()
    receipt_id = int(item['receipt_id'])
    barcode = int(item['barcode'])
    quantity = int(item['quantity'])
    price = int(item['price'])

    if item:

        sessionHoldItem = Session()
        checkItemExists = sessionHoldItem.query(Recepit_Products).filter(Recepit_Products.item_id == barcode, Recepit_Products.receipt_id == barcode).first()
        receiptStatus = sessionHoldItem.query(Receipts).get(receipt_id).receipt_status
        
        if receiptStatus == str(1):
            if checkItemExists:
                #Update quantity and price on item
                checkItemExists.quantity = quantity
                checkItemExists.unit_price = price
                sessionHoldItem.commit()
                return jsonify({
                    'itemAdded': 'yes'
                    })
            else:
                # Declare a new item on Receipt_Products class to input on database
                newItem = Recepit_Products(
                    receipt_id = receipt_id,
                    item_id = barcode,
                    quantity = quantity,
                    unit_price = price
                    )

                #Insert new item on database
                sessionHoldItem.add(newItem)
                sessionHoldItem.commit()
                return jsonify({
                    'itemAdded': 'yes'
                    })

        else:
            abort(500, f'Receipt {receipt_id} is closed. Cannot include items on closed receipt. Please, start a new sale.')

@BP_register_sales.route('/sales/register/removeItem', methods=['Post'])
def removeItem():
    print('Activated')
    deletionItem = request.get_json()
    barcodeDel = deletionItem['barcode']
    receipt_idDel = deletionItem['receipt_id']

    try:
        sessionDelete = Session()
        itemToDelete = sessionDelete.query(Recepit_Products).filter(item_id = barcodeDel,
                                                                    receipt_id = receipt_idDel)
        itemToDelete.delete()
        sessionDelete.commit()

    except SQLAlchemyError as e:
        error = str(e)
        abort(500, f'Error: {e}')

BP_view_sales = Blueprint('view_sales', __name__)
@BP_view_sales.route('/sales/view_sales')
def view_sales():
    return render_template('view_sales.html')