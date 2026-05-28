from sqlalchemy.orm import Session
import models, schemas

# ── Products ──────────────────────────────────────────────────────────────────

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def get_product_by_sku(db: Session, sku: str):
    return db.query(models.Product).filter(models.Product.sku == sku).first()

def get_products(db: Session):
    return db.query(models.Product).order_by(models.Product.id.desc()).all()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product: schemas.ProductUpdate):
    db_product = get_product(db, product_id)
    update_data = product.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    db.delete(db_product)
    db.commit()

# ── Customers ─────────────────────────────────────────────────────────────────

def get_customer(db: Session, customer_id: int):
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customer_by_email(db: Session, email: str):
    return db.query(models.Customer).filter(models.Customer.email == email).first()

def get_customers(db: Session):
    return db.query(models.Customer).order_by(models.Customer.id.desc()).all()

def create_customer(db: Session, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    db.delete(db_customer)
    db.commit()

# ── Orders ────────────────────────────────────────────────────────────────────

def get_order(db: Session, order_id: int):
    return db.query(models.Order).filter(models.Order.id == order_id).first()

def get_orders(db: Session):
    return db.query(models.Order).order_by(models.Order.id.desc()).all()

def create_order(db: Session, order: schemas.OrderCreate):
    total = 0.0
    items_data = []
    for item in order.items:
        product = get_product(db, item.product_id)
        subtotal = product.price * item.quantity
        total += subtotal
        items_data.append((product, item.quantity, product.price))

    db_order = models.Order(customer_id=order.customer_id, total_amount=total)
    db.add(db_order)
    db.flush()

    for product, qty, price in items_data:
        order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=qty,
            unit_price=price
        )
        db.add(order_item)
        product.quantity -= qty

    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    # Restore stock
    for item in db_order.items:
        item.product.quantity += item.quantity
    db.delete(db_order)
    db.commit()

# ── Dashboard ─────────────────────────────────────────────────────────────────

def get_dashboard(db: Session):
    total_products = db.query(models.Product).count()
    total_customers = db.query(models.Customer).count()
    total_orders = db.query(models.Order).count()
    low_stock = db.query(models.Product).filter(models.Product.quantity <= 10).all()
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_products": [
            {"id": p.id, "name": p.name, "sku": p.sku, "quantity": p.quantity}
            for p in low_stock
        ]
    }
