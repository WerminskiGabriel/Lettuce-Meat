from flask import Flask
import os
from flask_cors import CORS
from config import Config, TestConfig
from db import DB
import models
from views.meeting import bp


def create_app(config_class=Config) -> Flask:
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config_class)
    db = DB()
    db.init_app(app)

    with app.app_context():
        db.db.create_all()

    app.register_blueprint(bp)
    return app
