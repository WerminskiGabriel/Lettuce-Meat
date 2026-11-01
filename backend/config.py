import os
from pathlib import Path
from dotenv import load_dotenv


class Config:
    CONFIG_PATH = Path(__file__).resolve()
    ROOT = CONFIG_PATH.parent

    load_dotenv(ROOT / ".env")

    _DEFAULT_DB = ROOT / "lettuce.db"

    API_KEY = os.getenv("API_KEY")
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "SQLALCHEMY_DATABASE_URI",
        f"sqlite:///{_DEFAULT_DB.as_posix()}",
    )
    _track_mods = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS")
    SQLALCHEMY_TRACK_MODIFICATIONS = (
        _track_mods.lower() in ("1", "true", "yes") if _track_mods is not None else False
    )


class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


class BenchConfig(Config):
    TESTING = True
    BENCH_DB_PATH = Config.ROOT / "tests" / "bench.db"
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{BENCH_DB_PATH.as_posix()}"
