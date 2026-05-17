from flask import jsonify

def api_response(success, message, data=None, status_code=200):
    """
    Standardized API response structure.
    Returns: JSON response matching standard structure requested.
    """
    response = {
        "success": success,
        "message": message,
        "data": data if data is not None else {}
    }
    return jsonify(response), status_code

def error_response(message, data=None, status_code=400):
    """
    Standardized error response structure.
    """
    return api_response(success=False, message=message, data=data, status_code=status_code)
