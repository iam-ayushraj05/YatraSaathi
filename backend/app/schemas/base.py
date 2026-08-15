"""
YatraSaathi — Base API schemas and generic response wrappers.
"""
from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class MetaInfo(BaseModel):
    page: Optional[int] = None
    page_size: Optional[int] = None
    total: Optional[int] = None


class ResponseWrapper(BaseModel, Generic[T]):
    """Successful response wrapper."""
    data: T
    meta: Optional[dict] = Field(default_factory=dict)


class ListResponseWrapper(BaseModel, Generic[T]):
    """Successful list response wrapper."""
    data: list[T]
    meta: MetaInfo


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[dict] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Error response wrapper."""
    error: ErrorDetail
