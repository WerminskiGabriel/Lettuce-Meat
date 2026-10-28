import secrets
import hashlib


def generate_token() -> str:
    """
    :return: csrng(chacha20) - 16B seed token using secrets library
    """
    return secrets.token_urlsafe(16)


def hash_token(token: str) -> str:
    """

    :param token: url-safe token - use generate_token() from auth_tokens.py
    :return: token hashed with hashlib.sha256()
    """
    return hashlib.sha256(token.encode()).hexdigest()


def verify_token(token: str, hashed_token: str) -> bool:
    """

    :param token: url-safe token - use generate_token() from auth_tokens.py
    :param hashed_token: token hashed with hashlib.sha256()
    :return: comparison of token & hashed_token using secure secrets.compare_digets method
    """
    return secrets.compare_digest(hash_token(token), hashed_token)
