from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DECIMAL, Date
from model.database.dbconfig import engine
from sqlalchemy.ext.declarative import declarative_base

sss_database = declarative_base()
class Costumers(sss_database):
    __tablename__ = 'vi_costumers'
    costumer_id = Column(Integer, primary_key=True)
    costumer_registry = Column(String)
    costumer_store = Column(String)
    cpf = Column(String(11))
    first_name = Column(String)
    last_name = Column(String)
    admission_date = Column(Date)
    active_status = Column(String(1))

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
    description = Column(String)
    quantity = Column(DECIMAL(4,2))
    price = Column(DECIMAL(4,2))

engine = engine
Session = sessionmaker(bind=engine)


