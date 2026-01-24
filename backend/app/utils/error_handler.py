from flask import jsonify

class APIError(Exception):
    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code

class ValidationError(APIError):
    def __init__(self, message):
        super().__init__(message, 400)

def error_response(error, status_code):
    return jsonify({'success': False, 'error': error}), status_code

def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(error):
        return error_response(error.message, error.status_code)
    
    @app.errorhandler(404)
    def handle_404(error):
        return error_response('Not found', 404)
    
    @app.errorhandler(500)
    def handle_500(error):
        return error_response('Internal server error', 500)
