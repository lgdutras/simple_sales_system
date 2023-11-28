from flask import render_template, Blueprint

BP_register_users = Blueprint('register_users', __name__)
@BP_register_users.route('/users/register')
def register_users():
    return render_template('register_costumer.html')