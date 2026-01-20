import os
from datetime import timedelta

class Config:
    """Base configuration."""
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-prod')
    SESSION_COOKIE_SECURE = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # API timeouts
    API_TIMEOUT = 10
    MONITOR_PING_TIMEOUT = 5

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_ECHO = True
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///sonic_speedometer.db')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_ECHO = False
    DATABASE_URL = os.getenv('DATABASE_URL')
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SESSION_COOKIE_SECURE = True

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
}
