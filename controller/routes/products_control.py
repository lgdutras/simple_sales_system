from flask import render_template, Blueprint

BP_register_products = Blueprint('register_products', __name__)
@BP_register_products.route('/products/register')
def register_products():
    return render_template('register_product.html')

BP_remove_products = Blueprint('remove_products', __name__)
@BP_remove_products.route('/products/remove')
def remove_products():
    return render_template('register_product.html')