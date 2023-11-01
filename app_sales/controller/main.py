from flask import Flask, render_template, request, redirect, url_for, session
from secrets import token_hex

app = Flask(__name__, template_folder=r"C:projetos/controle_venda_interna/app_venda/view")
app.secret_key = token_hex(64)

@app.route('/')
def index():
    if session.get('logged_in'):
        return redirect(url_for('homepage'))
    else:
        return redirect(url_for('login'))

@app.route('/login', methods = ['Post', 'Get'])
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
    
@app.route('/logout', methods = ['Post', 'Get'])
def logout():
    session.pop('logged_in', None)
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run()