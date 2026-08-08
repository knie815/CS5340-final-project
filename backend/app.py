"""Library of Things — Flask API (SQLite-backed, time-based availability).

Stock is modelled as fixed capacity per (item, library). Availability is
computed per calendar day by subtracting reservations that overlap that day, so
an item that is fully booked today can still be reserved for a later range once
copies are returned (Airbnb-style). Occupancy is [pickup_date, return_date):
the return day is free again.

Run locally:
    flask --app app run --debug --port 5000
"""

import os
from datetime import date, timedelta

from flask import Flask, abort, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models import Availability, Category, Item, Library, NotifyRequest, Reservation, User
from seed import seed_if_empty

AVAILABILITY_HORIZON_DAYS = 120  # how far ahead the calendar computes availability

basedir = os.path.abspath(os.path.dirname(__file__))


def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(basedir, "borrowit.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    CORS(app)
    db.init_app(app)

    with app.app_context():
        db.create_all()
        seed_if_empty()

    register_routes(app)
    return app


# ---- availability helpers ----

def active_reservations(item_id, lib=None):
    q = Reservation.query.filter_by(item_id=item_id, status="reserved")
    if lib is not None:
        q = q.filter_by(lib_key=lib)
    return q.all()


def occupancy_end(pickup_iso, return_iso):
    """The exclusive end of the days a loan physically holds the item.

    A loan occupies [pickup, return). A same-day loan (return == pickup) still
    holds the item for that one day, so its occupancy end is the next day.
    """
    if return_iso > pickup_iso:
        return return_iso
    return (date.fromisoformat(pickup_iso) + timedelta(days=1)).isoformat()


def covers(resv, day_iso):
    """True if a reservation occupies the given day: pickup <= day < occupancy_end.

    ISO yyyy-mm-dd strings compare chronologically, so string comparison is fine.
    """
    return resv.pickup_date <= day_iso < occupancy_end(resv.pickup_date, resv.return_date)


def capacity_of(item_id, lib):
    a = Availability.query.filter_by(item_id=item_id, lib_key=lib).first()
    return a.count if a else 0


def serialize_item(item):
    """Item dict with `count` = copies available *today* (plus fixed `capacity`)."""
    today = date.today().isoformat()
    resvs = active_reservations(item.id)
    avail = []
    for a in item.availabilities:
        used = sum(1 for r in resvs if r.lib_key == a.lib_key and covers(r, today))
        avail.append({"lib": a.lib_key, "count": max(0, a.count - used), "capacity": a.count})
    return {
        "id": item.id, "name": item.name, "em": item.em, "cat": item.cat,
        "category": item.category, "desc": item.desc, "fee": item.fee,
        "maxLoan": item.max_loan, "deposit": item.deposit, "avail": avail,
    }


def register_routes(app):
    # Return API errors as JSON so the frontend can surface the message
    # (abort(...) otherwise renders an HTML error page).
    @app.errorhandler(HTTPException)
    def handle_http_exception(e):
        return jsonify({"error": e.name, "description": e.description}), e.code

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    # ---- auth (library-card login) ----

    @app.post("/api/login")
    def login():
        body = request.get_json(silent=True) or {}
        card = (body.get("card_number") or "").strip()
        password = body.get("password") or ""
        user = User.query.filter_by(card_number=card).first()
        if user is None or not check_password_hash(user.password_hash, password):
            abort(401, description="Invalid library card number or password")
        return jsonify(user.to_public())

    @app.post("/api/register")
    def register():
        body = request.get_json(silent=True) or {}
        card = (body.get("card_number") or "").strip()
        password = body.get("password") or ""
        name = (body.get("name") or "").strip()
        lib = body.get("lib")

        if not card or not password or not name or not lib:
            abort(400, description="Name, library, card number, and password are all required")
        if db.session.get(Library, lib) is None:
            abort(400, description="Choose a valid library")
        if User.query.filter_by(card_number=card).first() is not None:
            abort(409, description="That library card is already registered — try signing in")

        user = User(
            card_number=card, password_hash=generate_password_hash(password), name=name, lib_key=lib,
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_public()), 201

    @app.get("/api/libraries")
    def get_libraries():
        libs = Library.query.order_by(Library.order).all()
        return jsonify({l.key: {"name": l.name, "dist": l.dist, "hours": l.hours} for l in libs})

    @app.get("/api/categories")
    def get_categories():
        cats = Category.query.order_by(Category.order).all()
        return jsonify([{"key": c.key, "name": c.name, "em": c.em} for c in cats])

    @app.get("/api/items")
    def get_items():
        items = Item.query.order_by(Item.order).all()
        return jsonify([serialize_item(i) for i in items])

    @app.get("/api/items/<item_id>")
    def get_item(item_id):
        item = db.session.get(Item, item_id)
        if item is None:
            abort(404, description=f"No item with id {item_id!r}")
        return jsonify(serialize_item(item))

    @app.get("/api/items/<item_id>/availability")
    def get_availability(item_id):
        """Which upcoming days are fully booked at a library (for the calendar)."""
        item = db.session.get(Item, item_id)
        if item is None:
            abort(404, description="Unknown item")
        lib = request.args.get("lib")
        if not lib:
            abort(400, description="lib query parameter is required")
        horizon = request.args.get("days", AVAILABILITY_HORIZON_DAYS, type=int)

        capacity = capacity_of(item_id, lib)
        resvs = active_reservations(item_id, lib)
        today = date.today()
        unavailable = []
        for i in range(max(0, horizon)):
            d = (today + timedelta(days=i)).isoformat()
            used = sum(1 for r in resvs if covers(r, d))
            if capacity - used <= 0:
                unavailable.append(d)
        return jsonify({
            "item_id": item_id, "lib": lib, "capacity": capacity,
            "today": today.isoformat(), "maxLoan": item.max_loan,
            "unavailable": unavailable,
        })

    @app.get("/api/reservations")
    def list_reservations():
        # A user's own reservations (by their library-card number). Other users'
        # bookings still affect availability but aren't listed here.
        user = request.args.get("user")
        if not user:
            return jsonify([])
        q = Reservation.query.filter_by(user_email=user)
        status = request.args.get("status")
        if status:
            q = q.filter_by(status=status)
        resvs = q.order_by(Reservation.created_at.desc(), Reservation.id.desc()).all()
        return jsonify([r.to_dict() for r in resvs])

    @app.post("/api/reservations")
    def create_reservation():
        body = request.get_json(silent=True) or {}
        item_id = body.get("item_id")
        lib = body.get("lib")
        pickup_date = body.get("pickup_date")
        days = body.get("days")
        reminders = bool(body.get("reminders", True))
        user = (body.get("user") or "").strip()

        # Must be a real, signed-in library card.
        if not user or User.query.filter_by(card_number=user).first() is None:
            abort(401, description="Please sign in with your library card to reserve")

        item = db.session.get(Item, item_id)
        if item is None:
            abort(404, description="Unknown item")
        if not lib or not pickup_date:
            abort(400, description="lib and pickup_date are required")

        try:
            pickup = date.fromisoformat(pickup_date)
        except (TypeError, ValueError):
            abort(400, description="pickup_date must be ISO yyyy-mm-dd")
        if pickup < date.today():
            abort(400, description="Pickup date cannot be in the past")

        try:
            days = int(days)
        except (TypeError, ValueError):
            abort(400, description="days must be an integer")
        # 0 = same-day (day-use) loan; otherwise 1..max_loan.
        days = max(0, min(days, item.max_loan))
        return_ = pickup + timedelta(days=days)

        capacity = capacity_of(item_id, lib)
        if capacity <= 0:
            abort(409, description="This library does not carry that item")

        # Every day the item is held (at least the pickup day) must have a free copy.
        occ_end = date.fromisoformat(occupancy_end(pickup.isoformat(), return_.isoformat()))
        resvs = active_reservations(item_id, lib)
        d = pickup
        while d < occ_end:
            diso = d.isoformat()
            used = sum(1 for r in resvs if covers(r, diso))
            if capacity - used <= 0:
                abort(409, description=f"No availability on {diso} at this library")
            d += timedelta(days=1)

        resv = Reservation(
            code="PENDING", item_id=item_id, lib_key=lib, pickup_date=pickup.isoformat(),
            days=days, return_date=return_.isoformat(), reminders=reminders,
            status="reserved", user_email=user,
        )
        db.session.add(resv)
        db.session.flush()
        resv.code = f"BI-{item_id[:3].upper()}-{1000 + resv.id}"
        db.session.commit()
        return jsonify(resv.to_dict()), 201

    @app.post("/api/reservations/<code>/cancel")
    def cancel_reservation(code):
        resv = Reservation.query.filter_by(code=code).first()
        if resv is None:
            abort(404, description="Unknown reservation code")
        # Cancelling just deactivates it; availability recomputes automatically.
        if resv.status != "cancelled":
            resv.status = "cancelled"
            db.session.commit()
        return jsonify(resv.to_dict())

    @app.post("/api/notify")
    def notify():
        body = request.get_json(silent=True) or {}
        item_id = body.get("item_id")
        lib = body.get("lib")
        if db.session.get(Item, item_id) is None:
            abort(404, description="Unknown item")
        req = NotifyRequest(item_id=item_id, lib_key=lib, email=body.get("email"))
        db.session.add(req)
        db.session.commit()
        return jsonify({"ok": True}), 201


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
