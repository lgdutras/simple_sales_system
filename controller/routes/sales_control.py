from flask import request, session, render_template, Blueprint, jsonify, url_for, redirect, abort
from model.database.dbsales import engine, Session, Costumers, Sales, Items
import json
from datetime import datetime

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

    sale_datetime = session_sale.query(Sales).filter_by(sale_id=newSaleID, seller_registry=int(session.get('user_registry'))).first().datetime.strftime('%d/%m/%Y')
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

BP_view_sales = Blueprint('view_sales', __name__)
@BP_view_sales.route('/sales/view_sales')
def view_sales():
    return render_template('view_sales.html')