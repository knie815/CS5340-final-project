"""Library of Things — Flask API (step 1).

Serves the read-only catalog data the React frontend needs to render the home,
results, and item-detail screens. Reservations, auth, and SQLite persistence
come in later steps.

Run locally:
    flask --app app run --debug --port 5000
"""

from flask import Flask, jsonify, abort
from flask_cors import CORS

from data import LIBRARIES, ITEMS, CATEGORIES

app = Flask(__name__)
# Allow the Vite dev server (localhost:5173) to call the API during development.
# The Vite proxy also handles this, but CORS keeps direct calls working too.
CORS(app)


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/libraries")
def get_libraries():
    return jsonify(LIBRARIES)


@app.get("/api/categories")
def get_categories():
    return jsonify(CATEGORIES)


@app.get("/api/items")
def get_items():
    return jsonify(ITEMS)


@app.get("/api/items/<item_id>")
def get_item(item_id):
    item = next((i for i in ITEMS if i["id"] == item_id), None)
    if item is None:
        abort(404, description=f"No item with id {item_id!r}")
    return jsonify(item)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
