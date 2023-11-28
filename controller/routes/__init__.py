# Importing routes from route files

from .home import BP_home
from .login import BP_login, BP_logout
from .products_control import BP_register_products
from .sales_control import BP_register_sales, BP_view_sales
from .users_control import BP_register_users
from ...controller import connection