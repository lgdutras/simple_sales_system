from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String, DECIMAL, Date, DateTime, ForeignKey, update
from model.database.dbconfig import engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import func

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

class Items(sss_database):
    __tablename__ = 'vi_items'
    barcode = Column(String, primary_key=True)
    store = Column(String)
    description = Column(String)
    quantity = Column(DECIMAL(4,2))
    price = Column(DECIMAL(4,2))

class Receipts(sss_database):
    __tablename__ = 'vi_receipts'
    receipt_id = Column(Integer, primary_key=True, autoincrement=True)
    datetime = Column(DateTime)
    seller_registry = Column(Integer)
    seller_store = Column(Integer)
    costumer_registry = Column(Integer)
    costumer_store = Column(Integer)
    receipt_status = Column(String(1))


class Receipt_Products(sss_database):
    __tablename__ = 'vi_receipt_products'
    receipt_id = Column(Integer)
    datetime = Column(DateTime, autoincrement=True)
    item_id = Column(Integer, primary_key=True)
    quantity = Column(Integer)
    unit_price = Column(DECIMAL(5,2))

# Connection Parameters
engine = engine
Session = sessionmaker(bind=engine)