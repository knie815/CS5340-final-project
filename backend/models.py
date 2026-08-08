"""SQLAlchemy models for BorrowIt.

The catalog (libraries, categories, items) plus live stock (availabilities) and
user-generated reservations / notify requests. Stock lives in the Availability
table so reservations can decrement it and cancellations can restore it.
"""

from datetime import datetime

from extensions import db


class Library(db.Model):
    key = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    dist = db.Column(db.Float, nullable=False)
    hours = db.Column(db.String, nullable=False)
    order = db.Column(db.Integer, nullable=False, default=0)


class Category(db.Model):
    key = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    em = db.Column(db.String)
    order = db.Column(db.Integer, nullable=False, default=0)


class Item(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    em = db.Column(db.String)
    cat = db.Column(db.String)  # display label, e.g. "Office"
    category = db.Column(db.String, db.ForeignKey("category.key"))
    desc = db.Column(db.Text)
    fee = db.Column(db.String)
    max_loan = db.Column(db.Integer)
    deposit = db.Column(db.String)
    order = db.Column(db.Integer, nullable=False, default=0)

    # Ordered by insertion (id) so avail matches the original authoring order.
    availabilities = db.relationship(
        "Availability", backref="item", cascade="all, delete-orphan", order_by="Availability.id"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "em": self.em,
            "cat": self.cat,
            "category": self.category,
            "desc": self.desc,
            "fee": self.fee,
            "maxLoan": self.max_loan,
            "deposit": self.deposit,
            "avail": [a.to_dict() for a in self.availabilities],
        }


class Availability(db.Model):
    # `count` is the fixed number of physical copies this library holds for the
    # item (its capacity). Per-date availability is computed at request time by
    # subtracting overlapping reservations — copies are never mutated here.
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.String, db.ForeignKey("item.id"), nullable=False)
    lib_key = db.Column(db.String, db.ForeignKey("library.key"), nullable=False)
    count = db.Column(db.Integer, nullable=False, default=0)  # capacity

    __table_args__ = (db.UniqueConstraint("item_id", "lib_key", name="uix_item_lib"),)

    def to_dict(self):
        return {"lib": self.lib_key, "count": self.count, "capacity": self.count}


class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, unique=True, nullable=False)
    item_id = db.Column(db.String, db.ForeignKey("item.id"), nullable=False)
    lib_key = db.Column(db.String, db.ForeignKey("library.key"), nullable=False)
    pickup_date = db.Column(db.String, nullable=False)  # ISO yyyy-mm-dd
    days = db.Column(db.Integer, nullable=False)
    return_date = db.Column(db.String, nullable=False)  # ISO yyyy-mm-dd
    reminders = db.Column(db.Boolean, default=True)
    status = db.Column(db.String, nullable=False, default="reserved")  # reserved | cancelled
    user_email = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    item = db.relationship("Item")

    def to_dict(self):
        return {
            "code": self.code,
            "item": self.item.to_dict(),
            "lib": self.lib_key,
            "date": self.pickup_date,
            "days": self.days,
            "returnBy": self.return_date,
            "reminders": self.reminders,
            "status": self.status,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
        }


class User(db.Model):
    # A login is a library card: you must have a card at some library to sign up.
    # `card_number` is the username; passwords are stored hashed.
    id = db.Column(db.Integer, primary_key=True)
    card_number = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    name = db.Column(db.String, nullable=False)
    lib_key = db.Column(db.String, db.ForeignKey("library.key"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    library = db.relationship("Library")

    def initials(self):
        words = [w for w in self.name.replace("-", " ").split() if w]
        letters = (words[0][0] if words else "") + (words[1][0] if len(words) > 1 else "")
        return letters.upper() or "?"

    def to_public(self):
        """Safe, non-sensitive fields for the client (never the password hash)."""
        return {
            "card_number": self.card_number,
            "name": self.name,
            "lib": self.lib_key,
            "libraryName": self.library.name if self.library else None,
            "initials": self.initials(),
        }


class NotifyRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.String, db.ForeignKey("item.id"), nullable=False)
    lib_key = db.Column(db.String, db.ForeignKey("library.key"), nullable=False)
    email = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
