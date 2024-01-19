from flask import Flask, render_template, request, redirect, url_for, session, Blueprint, abort, jsonify, flash
from secrets import token_hex
from flask_sqlalchemy import SQLAlchemy
from model.database.dblogin import engine, Session, User
from bcrypt import checkpw, hashpw, gensalt
from sqlalchemy.exc import SQLAlchemyError


BP_login = Blueprint('login', __name__)
BP_login.secret_key = token_hex(64)

@BP_login.route('/login', methods = ['Post', 'Get'])
def login():
    if request.method == 'POST':
        form_username = str(request.form['username'].upper())
        form_password = str(request.form['pw']).encode('utf-8')
        session_login = Session()
        user_data_validation = session_login.query(User).filter_by(username=form_username).first()

        if user_data_validation:
            user_group = user_data_validation.user_group

            if user_group == 0:
                return render_template('login.html', message='User not authorized, wait administration validation')

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
                return render_template('login.html', message='Incorrect password, try again', mt_var=1)
        else:

            return render_template('login.html', message='User not exists, check your username', mt_var=1)

    return render_template('login.html', mt_var=5)

@BP_login.route('/signin', methods = ['Post', 'Get'])
def signin():
    if request.method == 'POST':

        formUsername = request.form['username'].upper()
        formPassword = request.form['pw']
        formFirstName = request.form['first-name'].title()
        formLastName = request.form['last-name'].title()
        formUserRegistry = request.form['user-registry']
        formCPF = request.form['user-CPF']
        formStore = request.form['store-id']

        newUser = User(
            user_registry = formUserRegistry,
            user_store = formStore,
            username = formUsername,
            password = hashpw(formPassword.encode('utf-8'), gensalt()).decode('utf-8'),
            first_name = formFirstName,
            last_name = formLastName,
            CPF = formCPF,
            user_group = 0
        )

        try:
            session_signin = Session()
            checkUsernameExists = session_signin.query(User).filter_by(username = formUsername).first()

            if checkUsernameExists:
                return render_template('signin.html', message='Username already exists, use another username.', msg_class='danger', mt_var=1)
            
            else:
                session_signin.add(newUser)
                session_signin.commit()
                return render_template('signin.html', message='User created, wait for admin validation', msg_class='success', mt_var=1)
        
        except SQLAlchemyError as e:
            return abort(500, f"Error on request a new user {e}")

    return render_template('signin.html', mt_var=5)

BP_logout = Blueprint('logout', __name__)

@BP_logout.route('/logout', methods = ['Post', 'Get'])
def logout():
    session.pop('logged_in', None)
    session.clear()
    return redirect(url_for('login.login'))