from sqlalchemy import create_engine

class connection:
    login = 'estoque'
    password = '3st0que2022'
    hostname = 'bigmais'
    conn_string = 'oracle+cx_oracle://%s:%s@%s' % (login, password, hostname)
    engine = create_engine(conn_string)