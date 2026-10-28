import os
from pathlib import Path
from dotenv import load_dotenv


class Config:
    CONFIG_PATH = Path(__file__).resolve()
    ROOT = CONFIG_PATH.parent

    load_dotenv(ROOT / ".env")

    API_KEY = os.getenv("API_KEY")
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS")


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
