from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DECIMAL
from model.database.dbconfig import engine
from sqlalchemy.ext.declarative import declarative_base

sss_database = declarative_base()
class Costumers(sss_database):
    __tablename__ = 'vi_users'
    user_id = Column(Integer, primary_key=True)
    user_registry = Column(String)
    user_store = Column(String)
    cpf = Column(String(11))
    username = Column(String)
    password = Column(String)
    first_name = Column(String)
    last_name = Column(String)

class Sales(sss_database):
    __tablename__ = 'vi_sales'
    sale_id = Column(Integer, primary_key=True)
    seller_registry = Column(Integer)
    seller_store = Column(Integer)
    costumer_registry = Column(Integer)
    costumer_store = Column(Integer)
    item_id = Column(Integer)
    quantity = Column(Integer)
    unit_price = Column(DECIMAL(5,2))

class Items(sss_database):
    __tablename__ = 'vi_items'
    barcode = Column(String, primary_key=True)
    store = Column(String)
    price = Column(DECIMAL(4,2))
    quantity = Column(Integer)

engine = engine
Session = sessionmaker(bind=engine)


