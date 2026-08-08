"""One-time seed of the catalog from seed_data.py into the database.

Idempotent: does nothing if the catalog is already present. A handful of demo
reservations (under a "community" user) are also seeded so the calendar shows
some already-booked / grayed-out periods out of the box.
"""

from datetime import date, timedelta

from werkzeug.security import generate_password_hash

import seed_data
from extensions import db
from models import Availability, Category, Item, Library, Reservation, User

# The single demo account. Its card number also owns the demo reservations below.
DEMO_CARD = "1001"

# Seeded as this account's reservations so My Reservations shows one of each
# lifecycle state on first run.
# (item, library, pickup offset from today, loan days, status)
DEMO_RESERVATIONS = [
    ("laminator", "central", -2, 5, "reserved"),   # currently borrowed (started, not yet returned)
    ("carpet", "medford", 3, 3, "reserved"),        # upcoming
    ("telescope", "newton", 9, 6, "reserved"),      # upcoming
    ("soldering", "central", 2, 4, "cancelled"),    # cancelled
]

# Demo library-card logins: (card_number, password, name, library).
DEMO_USERS = [
    (DEMO_CARD, "borrow123", "Katherine Nie", "central"),
]


def seed_if_empty():
    if Library.query.first() is not None:
        return

    for i, (key, l) in enumerate(seed_data.LIBRARIES.items()):
        db.session.add(Library(key=key, name=l["name"], dist=l["dist"], hours=l["hours"], order=i))

    for i, c in enumerate(seed_data.CATEGORIES):
        db.session.add(Category(key=c["key"], name=c["name"], em=c["em"], order=i))

    for i, it in enumerate(seed_data.ITEMS):
        db.session.add(
            Item(
                id=it["id"], name=it["name"], em=it["em"], cat=it["cat"], category=it["category"],
                desc=it["desc"], fee=it["fee"], max_loan=it["maxLoan"], deposit=it["deposit"], order=i,
            )
        )
        for a in it["avail"]:
            db.session.add(Availability(item_id=it["id"], lib_key=a["lib"], count=a["count"]))

    db.session.commit()
    _seed_demo_reservations()
    _seed_demo_users()


def _seed_demo_reservations():
    today = date.today()
    for i, (item_id, lib, offset, days, status) in enumerate(DEMO_RESERVATIONS):
        pickup = today + timedelta(days=offset)
        return_ = pickup + timedelta(days=days)
        db.session.add(
            Reservation(
                code=f"BI-{item_id[:3].upper()}-{900 + i}",
                item_id=item_id, lib_key=lib,
                pickup_date=pickup.isoformat(), days=days, return_date=return_.isoformat(),
                reminders=False, status=status, user_email=DEMO_CARD,
            )
        )
    db.session.commit()


def _seed_demo_users():
    for card, password, name, lib in DEMO_USERS:
        db.session.add(
            User(
                card_number=card, password_hash=generate_password_hash(password),
                name=name, lib_key=lib,
            )
        )
    db.session.commit()
