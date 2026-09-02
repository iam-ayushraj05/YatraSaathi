"""
yatrasaathi — Photo Storage Service.
Saves uploaded live evidence photos to local static directory or S3 bucket.
"""
import os
import uuid
import hashlib
from typing import Tuple
from fastapi import UploadFile

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


async def save_barrier_photo(photo: UploadFile) -> Tuple[str, str, int, str]:
    """
    Saves an uploaded photo to local storage and returns (storage_key, photo_url, file_size, sha256_hash).
    """
    contents = await photo.read()
    file_size = len(contents)
    sha256_hash = hashlib.sha256(contents).hexdigest()

    ext = os.path.splitext(photo.filename or "")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    photo.file.seek(0)
    
    storage_key = f"uploads/{filename}"
    photo_url = f"/static/uploads/{filename}"
    return storage_key, photo_url, file_size, sha256_hash
