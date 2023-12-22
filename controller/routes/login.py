from flask import Flask, render_template, request, redirect, url_for, session, Blueprint
from secrets import token_hex
from flask_sqlalchemy import SQLAlchemy
from model.database.dblogin import engine, Session, getUser
from bcrypt import checkpw

BP_login = Blueprint('login', __name__)
BP_login.secret_key = token_hex(64)
@BP_login.route('/login', methods = ['Post', 'Get'])
def login():
    if request.method == 'POST':
        form_username = request.form['username'].upper()
        form_password = str(request.form['pw']).encode('utf-8')
        session_login = Session()
        user_data_validation = session_login.query(getUser).filter_by(username=form_username).first()
        hashed_pw = str(user_data_validation.password).encode('utf-8')

        if form_username == user_data_validation.username and checkpw(form_password, hashed_pw) == True:
            session['logged_in'] = True
            session['username'] = form_username
            session['firstname'] = user_data_validation.first_name
            session['lastname'] = user_data_validation.last_name
            session['user_registry'] = user_data_validation.user_registry
            session['user_store'] = user_data_validation.user_store
            session_login.close
            return redirect(url_for('home.homepage'))
        else:
            return 'Usuário ou Senha incorretos, tente novamente.'
    return render_template('login.html')


BP_logout = Blueprint('logout', __name__)

@BP_logout.route('/logout', methods = ['Post', 'Get'])
def logout():
    session.pop('logged_in', None)
    session.clear()
    return redirect(url_for('login.login'))