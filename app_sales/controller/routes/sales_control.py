from flask import request, session, render_template, Blueprint

BP_register_sales = Blueprint('register_sales', __name__)
@BP_register_sales.route('/sales/register', methods = ['Post', 'Get'])
def register_sales():
    if request.method == 'POST':
        # Get header
        itemCounter = int(request.form['itemCounter'])
        userRegistry = str(request.form['userRegistry'])
        employee = str(request.form['employee'])
        # Get items
        items = []
        input = [] #this object gonna call a input action on database
        for item in range(1, itemCounter+1):
            item = {
                'item': request.form['item%s' % item],
                'quantity': request.form['quantity%s' % item],
                'price': request.form['price%s' % item]
            }
            items.append(item)
        for item in items:
            # string to test if the parameters are being right called on main.py to after insert on database
            insert = "insert into is_sales values (%s, %s, %s, %s, %s)" % (session.get('username'), userRegistry, item['item'], item['quantity'], item['price'])
            input.append(insert)
        return input
    
    return render_template('register_sale.html')

BP_view_sales = Blueprint('view_sales', __name__)
@BP_view_sales.route('/sales/view_sales')
def view_sales():
    return render_template('view_sales.html')


BP_cancel_sales = Blueprint('view_sales', __name__)
@BP_cancel_sales.route('/sales/view_sales')
def view_sales():
    return render_template('view_sales.html')