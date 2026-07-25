"""Seed data for the Library of Things API.

Lifted verbatim from the prototype (prototype/library-of-things.html). This is
the in-memory source of truth for step 1; it will be replaced by SQLite +
SQLAlchemy once the read endpoints are wired to the React frontend.

availability: list of {lib, count} -> count > 1 ok, == 1 warn (last one), == 0 out
"""

LIBRARIES = {
    "central":  {"name": "Cambridge Central Library", "dist": 0.8, "hours": "Open · closes 9pm"},
    "somerv":   {"name": "Somerville Public Library",  "dist": 1.9, "hours": "Open · closes 8pm"},
    "bostonpl": {"name": "Boston Public Library",      "dist": 3.4, "hours": "Open · closes 6pm"},
    "medford":  {"name": "Medford Tool Library",       "dist": 4.7, "hours": "Closed · opens 10am"},
    "newton":   {"name": "Newton Free Library",        "dist": 6.1, "hours": "Open · closes 9pm"},
}

ITEMS = [
    {"id": "laminator", "name": "Laminator (A3)", "em": "📇", "cat": "Office", "category": "office",
     "desc": "Thermal A3 laminator with adjustable temperature. Great for classroom materials, signage, and preserving documents. Warms up in about 4 minutes.",
     "fee": "Max 7-day loan", "maxLoan": 7, "deposit": "No deposit",
     "avail": [{"lib": "central", "count": 2}, {"lib": "somerv", "count": 1}, {"lib": "newton", "count": 0}]},
    {"id": "carpet", "name": "Carpet Cleaner", "em": "🧼", "cat": "Home", "category": "home",
     "desc": "Deep-clean carpet and upholstery washer with two tanks and a stair attachment. Includes a sample of cleaning solution.",
     "fee": "Max 3-day loan", "maxLoan": 3, "deposit": "$20 deposit",
     "avail": [{"lib": "somerv", "count": 3}, {"lib": "medford", "count": 1}]},
    {"id": "sewing", "name": "Sewing Machine", "em": "🧵", "cat": "Craft", "category": "craft",
     "desc": "Beginner-friendly sewing machine with 20 stitch patterns, foot pedal, and a starter kit of bobbins and needles.",
     "fee": "Max 14-day loan", "maxLoan": 14, "deposit": "No deposit",
     "avail": [{"lib": "central", "count": 1}, {"lib": "bostonpl", "count": 2}, {"lib": "newton", "count": 2}]},
    {"id": "drill", "name": "Cordless Drill Kit", "em": "🔩", "cat": "Tools", "category": "tools",
     "desc": "18V cordless drill/driver with two batteries, charger, and a 40-piece bit set in a hard case.",
     "fee": "Max 7-day loan", "maxLoan": 7, "deposit": "No deposit",
     "avail": [{"lib": "medford", "count": 4}, {"lib": "central", "count": 0}, {"lib": "somerv", "count": 0}]},
    {"id": "projector", "name": "Portable Projector", "em": "📽️", "cat": "Electronics", "category": "electronics",
     "desc": "1080p portable projector with HDMI, USB-C, and built-in speaker. Ideal for movie nights and presentations.",
     "fee": "Max 5-day loan", "maxLoan": 5, "deposit": "No deposit",
     "avail": [{"lib": "bostonpl", "count": 1}, {"lib": "newton", "count": 1}]},
    {"id": "telescope", "name": "Telescope", "em": "🔭", "cat": "Outdoors", "category": "outdoors",
     "desc": "70mm refractor telescope with tripod and two eyepieces. Comes with a beginner star-gazing guide.",
     "fee": "Max 14-day loan", "maxLoan": 14, "deposit": "No deposit",
     "avail": [{"lib": "newton", "count": 2}, {"lib": "central", "count": 0}]},
    {"id": "pressure", "name": "Pressure Washer", "em": "💦", "cat": "Tools", "category": "tools",
     "desc": "Electric 2000 PSI pressure washer for patios, decks, and driveways. Includes three nozzle tips.",
     "fee": "Max 3-day loan", "maxLoan": 3, "deposit": "$20 deposit",
     "avail": [{"lib": "medford", "count": 1}]},
    {"id": "soldering", "name": "Soldering Station", "em": "🔌", "cat": "Electronics", "category": "electronics",
     "desc": "Temperature-controlled soldering station with stand, sponge, and spare tips for electronics repair and hobby projects.",
     "fee": "Max 7-day loan", "maxLoan": 7, "deposit": "No deposit",
     "avail": [{"lib": "central", "count": 1}, {"lib": "medford", "count": 2}]},
    {"id": "gopro", "name": "Action Camera", "em": "📸", "cat": "Electronics", "category": "electronics",
     "desc": "Waterproof 4K action camera with chest and helmet mounts and two batteries. Great for trips and events.",
     "fee": "Max 5-day loan", "maxLoan": 5, "deposit": "$30 deposit",
     "avail": [{"lib": "bostonpl", "count": 0}, {"lib": "newton", "count": 0}]},
]

CATEGORIES = [
    {"key": "tools", "name": "Tools", "em": "🔧"},
    {"key": "home", "name": "Home & Garden", "em": "🏡"},
    {"key": "craft", "name": "Craft & Sewing", "em": "🧵"},
    {"key": "electronics", "name": "Electronics", "em": "🔊"},
    {"key": "office", "name": "Office", "em": "🖇️"},
    {"key": "outdoors", "name": "Outdoors", "em": "⛺"},
]
