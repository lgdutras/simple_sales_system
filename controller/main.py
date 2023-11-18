from flask import Flask, render_template, request, redirect, url_for, session
from secrets import token_hex

app = Flask(__name__, template_folder=r"C:/dev/app_sales/view")
app.secret_key = token_hex(64)


# ROTAS
@app.route('/')
def index():
    if session.get('logged_in'):
        return redirect(url_for('homepage'))
    else:
        return redirect(url_for('login'))

@app.route('/login', methods = ['Post', 'Get']) # Login Page/System
def login():
    if request.method == 'POST':
        usuario = request.form['username']
        senha = request.form['pw']

        if usuario == 'Luiz' and senha == '20':
            session['logged_in'] = True
            session['username'] = usuario
            return redirect(url_for('homepage'))
        else:
            return 'Usuário ou Senha incorretos, tente novamente.'
    return render_template('login.html')

@app.route('/homepage', methods = ['Post', 'Get'])
def homepage():
    if session.get('logged_in'):
        return render_template('homepage.html')
    else:
        print('Acesso Negado!')
        return redirect(url_for('login'))
    
@app.route('/register_product')
def register_product():
    return render_template('register_product.html')
    
@app.route('/logout', methods = ['Post', 'Get'])
def logout():
    session.pop('logged_in', None)
    session.clear()
    return redirect(url_for('login'))

@app.route('/register_sale', methods = ['Post', 'Get'])
def register_sale():
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

@app.route('/view_sales')
def view_sales():
    return render_template('view_sales.html')

@app.route('/register_costumer')
def register_costumer():
    return render_template('register_costumer.html')

if __name__ == '__main__':
    app.run()