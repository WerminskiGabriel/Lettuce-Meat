from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from flask_migrate import Migrate
from sqlalchemy import event, Engine

class Base(DeclarativeBase):
    pass


class DB():
    db = SQLAlchemy(model_class=Base)
    migrate = Migrate()

    def init_app(self, app):
        self.db.init_app(app)

    @staticmethod
    @event.listens_for(Engine, "connect")
    def set_sqlite(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
