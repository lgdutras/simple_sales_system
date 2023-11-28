from flask import Flask, render_template, request, redirect, url_for, session, Blueprint
from secrets import token_hex
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, Sequence, create_engine
from sqlalchemy.ext.declarative import declarative_base
from bcrypt import checkpw

# Database Connection to Login
db = declarative_base()
class user_data(db):
    __tablename__ = 'vi_users'
    user_id = Column(Integer, primary_key=True)
    user_registry = Column(String(10))
    username = Column(String)
    password = Column(String)
    first_name = Column(String)

Session = sessionmaker(bind=connection)

BP_login = Blueprint('login', __name__)

BP_login.secret_key = token_hex(64)

@BP_login.route('/login', methods = ['Post', 'Get'])
def login():
    if request.method == 'POST':
        form_username = request.form['username'].upper()
        form_password = str(request.form['pw']).encode('utf-8')
        sessiondb = Session()
        user_data_validation = sessiondb.query(user_data).filter_by(username=form_username).first()
        hashed_pw = str(user_data_validation.password).encode('utf-8')

        if form_username == user_data_validation.username and checkpw(form_password, hashed_pw) == True:
            session['logged_in'] = True
            session['username'] = form_username
            session['firstname'] = user_data_validation.first_name
            session['user_registry'] = user_data_validation.user_registry
            sessiondb.close
            return redirect(url_for('home.homepage'))
        else:
            return 'Usuário ou Senha incorretos, tente novamente.'
    return render_template('login.html')


BP_logout = Blueprint('logout', __name__)

@BP_logout.route('/logout', methods = ['Post', 'Get'])
def logout():
    session.pop('logged_in', None)
    session.clear()
    return redirect(url_for('login'))