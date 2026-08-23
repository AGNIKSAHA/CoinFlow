from sqlmodel import create_engine, Session, SQLModel
from typing import Generator
from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

def get_db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
