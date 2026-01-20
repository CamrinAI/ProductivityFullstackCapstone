"""Global error handler utilities."""
from flask import jsonify
import logging

logger = logging.getLogger(__name__)

class APIError(Exception):
    """Base exception for API errors."""
    def __init__(self, message, status_code=400, error_code=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.error_code = error_code or 'UNKNOWN_ERROR'

class NotFoundError(APIError):
    """404 Not Found error."""
    def __init__(self, message="Resource not found"):
        super().__init__(message, 404, 'NOT_FOUND')

class UnauthorizedError(APIError):
    """401 Unauthorized error."""
    def __init__(self, message="Unauthorized"):
        super().__init__(message, 401, 'UNAUTHORIZED')

class ForbiddenError(APIError):
    """403 Forbidden error."""
    def __init__(self, message="Forbidden"):
        super().__init__(message, 403, 'FORBIDDEN')

class ValidationError(APIError):
    """400 Validation error."""
    def __init__(self, message="Validation failed"):
        super().__init__(message, 400, 'VALIDATION_ERROR')

class TimeoutError(APIError):
    """504 Timeout error."""
    def __init__(self, message="Request timeout"):
        super().__init__(message, 504, 'REQUEST_TIMEOUT')

def error_response(error_code, message, status_code, details=None):
    """Create a standardized error response."""
    response = {
        'error': {
            'code': error_code,
            'message': message,
        }
    }
    if details:
        response['error']['details'] = details
    return jsonify(response), status_code

def register_error_handlers(app):
    """Register all error handlers with Flask app."""
    
    @app.errorhandler(APIError)
    def handle_api_error(error):
        """Handle custom API errors."""
        logger.error(f"API Error: {error.error_code} - {error.message}")
        return error_response(error.error_code, error.message, error.status_code)
    
    @app.errorhandler(404)
    def handle_404(error):
        """Handle 404 Not Found."""
        logger.warning(f"404 Not Found: {error}")
        return error_response('NOT_FOUND', 'The requested resource was not found', 404)
    
    @app.errorhandler(500)
    def handle_500(error):
        """Handle 500 Internal Server Error."""
        logger.error(f"500 Internal Server Error: {error}")
        return error_response('INTERNAL_SERVER_ERROR', 'An internal server error occurred', 500)
    
    @app.errorhandler(405)
    def handle_405(error):
        """Handle 405 Method Not Allowed."""
        logger.warning(f"405 Method Not Allowed: {error}")
        return error_response('METHOD_NOT_ALLOWED', 'The request method is not allowed', 405)
    
    @app.errorhandler(Exception)
    def handle_generic_error(error):
        """Handle any unhandled exception."""
        logger.error(f"Unhandled exception: {type(error).__name__} - {str(error)}", exc_info=True)
        
        # Check if it's a timeout-like error
        if 'timeout' in str(error).lower():
            return error_response('REQUEST_TIMEOUT', 'Request timed out', 504)
        
        return error_response('INTERNAL_SERVER_ERROR', 'An unexpected error occurred', 500)
