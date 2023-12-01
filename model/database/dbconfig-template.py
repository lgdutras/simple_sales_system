#This file show how the dbconfig.py must be in this project
from sqlalchemy import create_engine

#Fill the fields bellow with yours database credentials
login = '' 
password = ''
hostname = ''

conn_string = 'oracle+cx_oracle://%s:%s@%s' % (login, password, hostname)
engine = create_engine(conn_string)