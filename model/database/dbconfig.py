from sqlalchemy import create_engine

login = 'X'
password = 'X'
hostname = 'X'
conn_string = 'oracle+cx_oracle://%s:%s@%s' % (login, password, hostname)
engine = create_engine(conn_string)