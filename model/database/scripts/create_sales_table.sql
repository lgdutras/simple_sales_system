CREATE TABLE estoque.vi_receipts (
    RECEIPT_ID NUMBER(7,0) GENERATED ALWAYS AS IDENTITY NOT NULL,
	DATETIME DATE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    SELLER_REGISTRY NUMBER(10,0) NOT NULL, 
	SELLER_STORE NUMBER(3,0) NOT NULL,
    COSTUMER_REGISTRY NUMBER(10,0) NOT NULL, 
	COSTUMER_STORE NUMBER(3,0) NOT NULL,
	RECEIPT_STATUS CHAR(1) NOT NULL,
    PRIMARY KEY (RECEIPT_ID)
);

CREATE TABLE estoque.vi_receipt_products (
  	RECEIPT_ID NUMBER(7,0) NOT NULL,
	DATETIME DATE DEFAULT CURRENT_TIMESTAMP,
	ITEM_ID NUMBER(13,0) NOT NULL,
	QUANTITY NUMBER(4,0) NOT NULL, 
	UNIT_PRICE NUMBER(5,2) NOT NULL,
  	PRIMARY KEY (RECEIPT_ID, DATETIME, ITEM_ID),
  	FOREIGN KEY(RECEIPT_ID) REFERENCES ESTOQUE.VI_RECEIPTS(RECEIPT_ID)
);