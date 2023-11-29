from sqlalchemy.orm import sessionmaker
from sqlalchemy import Column, Integer, String
from model.database.dbconfig import engine
from sqlalchemy.ext.declarative import declarative_base


sss_database = declarative_base()
class getUser(sss_database):
    __tablename__ = 'vi_users'
    user_id = Column(Integer, primary_key=True)
    user_registry = Column(String)
    user_store = Column(String)
    username = Column(String)
    password = Column(String)
    first_name = Column(String)

engine = engine
Session = sessionmaker(bind=engine)