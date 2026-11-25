import hashlib
import secrets
import bcrypt


def hash_password(plain_password: str) -> str:
    """Hash a password using bcrypt with automatic salt generation."""
    pwd_bytes = plain_password.encode("utf-8")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def hash_token(token: str) -> str:
    """Create a SHA-256 digest of a refresh or reset token for safe database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_secure_token(length: int = 32) -> str:
    """Generate a cryptographically strong URL-safe token."""
    return secrets.token_urlsafe(length)
