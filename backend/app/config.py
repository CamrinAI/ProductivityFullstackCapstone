import os
from datetime import timedelta

class Config:
    """Base configuration."""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    API_BEARER_TOKEN = os.getenv('API_BEARER_TOKEN')
    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'dev-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)

class DevelopmentConfig(Config):
    """Development environment."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'sqlite:///trade_tracker.db'
    )

class ProductionConfig(Config):
    """Production environment."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///trade_tracker.db')

class TestingConfig(Config):
    """Testing environment."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
