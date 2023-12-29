from flask import request, session, render_template, Blueprint, jsonify, url_for, redirect
from model.database.dbsales import engine, Session, Costumers, Sales, Items
import json

BP_register_sales = Blueprint('register_sales', __name__)
@BP_register_sales.route('/sales/register', methods = ['Post', 'Get'])
def register_sales():
    return render_template('register_sale.html')

@BP_register_sales.route('/sales/register/getCostumer', methods=['Post'])
def get_costumer():
        costumer_registry = request.data.decode('utf-8')
        session_costumer = Session()
        costumer_data = session_costumer.query(Costumers).filter_by(costumer_registry=costumer_registry).first()
        costumer_name = costumer_data.first_name+' '+costumer_data.last_name
        costumer_cpf = costumer_data.cpf
        costumer_store = costumer_data.costumer_store
        return jsonify({'costumer_name': costumer_name, 'costumer_cpf': costumer_cpf, 'costumer_store': costumer_store})

@BP_register_sales.route('/sales/register/getItem', methods=['Post'])
def get_item():
     sale_store = str(session['user_store'])
     barcode = request.data.decode('utf-8')
     session_item = Session()
     item_data = session_item.query(Items).filter_by(barcode=barcode, store=sale_store).first()
     item_description = item_data.description
     item_price_suggested = float(item_data.price) / 2
     item_quantity_avaliable = item_data.quantity

     return jsonify({'itemDescription': item_description,
                     'suggestedPrice': item_price_suggested,
                     'AvaliableQuantity': item_quantity_avaliable})

@BP_register_sales.route('/sales/register/setPrint', methods=['Post', 'Get'])
def set_print():
        
        # Requesting sale data to assembly 
        sale_data = request.get_json()
        header_data = json.loads(sale_data['header'])
        print(sale_data)
        # Set Header to input on database
        costumerRegistry = header_data['costumerRegistry']
        costumerStore = header_data['costumerStore']
        # Get items to input on database
        items_data = json.loads(sale_data['items'])
        print(header_data)
        print(items_data)

        # Getting from database the last sale ID to incremment then define next
        session_SaleID = Session()
        lastSale = session_SaleID.query(Sales).order_by(Sales.sale_id.desc()).first().sale_id
        newSaleID = int(lastSale) + 1
        sale_data = json.dumps(sale_data)
        return jsonify(sale_data)

@BP_register_sales.route('/sales/register/registerSale', methods=['Post'])
def registerSale():
    # Get full sale data
    sale_data = request.get_json()
    print(sale_data)
    header_data = json.loads(sale_data['header'])
    # Set Header to input on database
    costumerRegistry = header_data['costumerRegistry']
    costumerStore = header_data['costumerStore']
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
                        unit_price = int(item[1]['price'])
                        )
        session_sale.add(new_item)
        session_sale.commit()
        session_sale.close()

    session_sale = Session()

    sale_datetime = session_sale.query(Sales).filter_by(sale_id=newSaleID, seller_registry=int(session.get('user_registry'))).first().datetime
    seller_name = session.get('firstname') + ' ' + session.get('lastname')
    sale_status = 'This sale was registered sucessfully!'
    return jsonify({'status': sale_status,
                    'sale_id': newSaleID,
                    'seller_name': seller_name,
                    'sale_store': session.get('user_store'),
                    'datetime': sale_datetime})

BP_view_sales = Blueprint('view_sales', __name__)
@BP_view_sales.route('/sales/view_sales')
def view_sales():
    return render_template('view_sales.html')