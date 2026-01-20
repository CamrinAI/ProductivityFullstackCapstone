"""Utility functions for the application."""

def get_current_user_id(session):
    """Extract user ID from session."""
    return session.get('user_id')

def is_authenticated(session):
    """Check if user is authenticated."""
    return 'user_id' in session
