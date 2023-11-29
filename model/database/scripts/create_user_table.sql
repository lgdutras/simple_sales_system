CREATE TABLE estoque.vi_users (
  user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cpf CHAR(11) NOT NULL,
  user_registry NUMBER(10) NOT NULL,
  user_store NUMBER(3) NOT NULL,
  first_name varchar(25) not null,
  last_name varchar(25) not null,
  username VARCHAR2(25) NOT NULL,
  password VARCHAR2(255) NOT NULL
);