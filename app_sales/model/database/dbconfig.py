from sqlalchemy import create_engine

class connection:
    login = 'x'
    password = 'x'
    hostname = 'x'
    conn_string = 'oracle+cx_oracle://%s:%s@%s' % (login, password, hostname)
    engine = create_engine(conn_string)


print(connection.conn_string)