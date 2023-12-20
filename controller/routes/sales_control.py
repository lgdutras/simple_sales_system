from flask import request, session, render_template, Blueprint, jsonify
from model.database.dbsales import engine, Session, Costumers, Sales, Items

BP_register_sales = Blueprint('register_sales', __name__)
@BP_register_sales.route('/sales/register', methods = ['Post', 'Get'])
def register_sales():
    if request.method == 'POST':
        # Get header
        itemCounter = int(request.form['itemCounter'])
        form_costumer_registry = str(request.form['userRegistry'])
        form_costumer_name = str(request.form['employee'])
        # Get items
        items = []
        for item in range(1, itemCounter+1):
            item = {
                'item': request.form['item%s' % item],
                'quantity': request.form['quantity%s' % item],
                'price': request.form['price%s' % item]
            }
            items.append(item)

        for item in items:
            session_sale = Session()
            new_item = Sales(seller_registry = session.get('user_registry'), seller_store = session.get('user_store'), costumer_registry = form_costumer_registry, costumer_store = form_costumer_name, item_id = item['item'], quantity = item['quantity'], unit_price = item['price'])
            session_sale.add(new_item)
            session_sale.commit
            session_sale.close
        return "Venda Registrada com sucesso!"
    
    return render_template('register_sale.html')

@BP_register_sales.route('/sales/register/getCostumer', methods=['Post'])
def get_costumer():
        costumer_registry = request.data.decode('utf-8')
        session_costumer = Session()
        costumer_data = session_costumer.query(Costumers).filter_by(user_registry=costumer_registry).first()
        costumer_name = costumer_data.first_name +' '+costumer_data.last_name
        costumer_cpf = costumer_data.cpf
        #sql_query
        return jsonify({'costumer_name': costumer_name, 'costumer_cpf': costumer_cpf})

@BP_register_sales.route('/sales/register/getItem', method=['Post'])
def get_item():
     store = session['user_store']
     barcode = request.data.decode('utf-8')
     session_item = Session()
     item_data = session_item.query(Items).filter_by(barcode=barcode, store=store)
     item_description = item_data.column_descriptions
     item_price_suggested = float(item_data.price, 4) / 2
     
     item_quantity_avaliable = item_data.stock

@BP_register_sales.route('/sales/register/setPrint', methods=['Post'])
def set_print():
        sale_ToPrint = {'seller_registry': '5997'}
        #sql_query
        return jsonify(sale_ToPrint)

BP_view_sales = Blueprint('view_sales', __name__)
@BP_view_sales.route('/sales/view_sales')
def view_sales():
    return render_template('view_sales.html')


BP_cancel_sales = Blueprint('view_sales', __name__)
@BP_cancel_sales.route('/sales/view_sales')
def view_sales():
    return render_template('view_sales.html')