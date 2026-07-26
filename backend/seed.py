"""One-time seed of the catalog from seed_data.py into the database.

Idempotent: does nothing if the catalog is already present. A handful of demo
reservations (under a "community" user) are also seeded so the calendar shows
some already-booked / grayed-out periods out of the box.
"""

from datetime import date, timedelta

import seed_data
from extensions import db
from models import Availability, Category, Item, Library, Reservation

# Reservations booked by "other people" — they consume capacity (and so gray out
# calendar dates) but don't appear in the current user's My Reservations list.
COMMUNITY_EMAIL = "community@demo"

# (item, library with capacity 1, days from today, loan length) -> fully-booked range.
DEMO_RESERVATIONS = [
    ("pressure", "medford", 0, 4),
    ("carpet", "medford", 1, 3),
    ("soldering", "central", 2, 5),
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


def _seed_demo_reservations():
    today = date.today()
    for i, (item_id, lib, offset, days) in enumerate(DEMO_RESERVATIONS):
        pickup = today + timedelta(days=offset)
        return_ = pickup + timedelta(days=days)
        db.session.add(
            Reservation(
                code=f"BI-{item_id[:3].upper()}-{900 + i}",
                item_id=item_id, lib_key=lib,
                pickup_date=pickup.isoformat(), days=days, return_date=return_.isoformat(),
                reminders=False, status="reserved", user_email=COMMUNITY_EMAIL,
            )
        )
    db.session.commit()
