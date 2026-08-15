"""
YatraSaathi — Alembic environment configuration.

- Uses async SQLAlchemy engine (asyncpg).
- Loads DATABASE_URL from .env via pydantic-settings.
- Imports all models so metadata is fully populated.
- Enables PostGIS support via GeoAlchemy2.
"""
import asyncio
import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

# ---------------------------------------------------------------------------
# Ensure backend/app is importable
# ---------------------------------------------------------------------------

# Add backend dir to sys.path so `app.*` imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ---------------------------------------------------------------------------
# Load settings (reads .env automatically)
# ---------------------------------------------------------------------------
from app.core.config import settings  # noqa: E402

# ---------------------------------------------------------------------------
# Import ALL models so SQLAlchemy metadata contains every table
# ---------------------------------------------------------------------------
import app.models  # noqa: F401 — side-effect: registers all mappers

from app.models.base import Base  # noqa: E402

# ---------------------------------------------------------------------------
# Alembic Config
# ---------------------------------------------------------------------------

config = context.config

# Override the sqlalchemy.url with the value from .env
# Convert asyncpg URL → sync for Alembic schema generation
sync_url = settings.database_url.replace(
    "postgresql+asyncpg://", "postgresql+psycopg2://"
).replace(
    "postgresql+asyncpg:", "postgresql:"
)
config.set_main_option("sqlalchemy.url", sync_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Object filtering to ignore PostGIS / TIGER system tables
# ---------------------------------------------------------------------------


def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table":
        return name in target_metadata.tables
    return True


# ---------------------------------------------------------------------------
# Offline migrations (generate SQL script without connecting)
# ---------------------------------------------------------------------------


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


# ---------------------------------------------------------------------------
# Online migrations (connect to the database)
# ---------------------------------------------------------------------------


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Use async engine for online migrations."""
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = sync_url

    connectable = async_engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    from sqlalchemy import create_engine

    sync_engine = create_engine(sync_url, poolclass=pool.NullPool)
    with sync_engine.connect() as connection:
        do_run_migrations(connection)
    sync_engine.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    from sqlalchemy import create_engine

    sync_engine = create_engine(sync_url, poolclass=pool.NullPool)
    with sync_engine.connect() as connection:
        do_run_migrations(connection)
    sync_engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
