"""Shared Flask extensions, kept in their own module to avoid circular imports."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
