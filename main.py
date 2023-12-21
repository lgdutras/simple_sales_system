from flask import Flask, render_template, request, redirect, url_for, session, Blueprint
from secrets import token_hex
from controller.routes import BP_login, BP_logout, BP_home, BP_register_products, BP_register_sales, BP_register_users, BP_view_sales

app = Flask(__name__, template_folder=r"view")
app.secret_key = token_hex(64)

app.static_folder = r"view/scripts"
#routes
app.register_blueprint(BP_logout)
app.register_blueprint(BP_login)
app.register_blueprint(BP_home)
app.register_blueprint(BP_register_products)
app.register_blueprint(BP_register_users)
app.register_blueprint(BP_register_sales)
app.register_blueprint(BP_view_sales)

#index
@app.route('/')
def index():
    if session.get('logged_in'):
        return redirect(url_for('home.homepage'))
    else:
        return redirect(url_for('login.login'))
    
if __name__ == '__main__':
    app.run()