from flask import render_template, session, redirect, url_for, Blueprint

BP_home = Blueprint('home', __name__)

@BP_home.route('/homepage', methods = ['Post', 'Get'])
def homepage():
    if session.get('logged_in'):
        return render_template('homepage.html')
    else:
        print('Acesso Negado!')
        return redirect(url_for('login'))