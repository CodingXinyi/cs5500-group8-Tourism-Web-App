from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status
from typing import Any, Optional, Union
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import NotAuthenticated, AuthenticationFailed
from rest_framework.views import exception_handler

class ApiResponse:
    """
    API response format class
    """
    @staticmethod
    def success(data: Any = None, message: str = "Success", status_code: int = status.HTTP_200_OK) -> Response:
        response_data = {
            "success": True,
            "message": message,
            "data": data
        }
        return Response(response_data, status=status_code)

    @staticmethod
    def error(message: str, status_code: int = status.HTTP_400_BAD_REQUEST, errors: Optional[Any] = None) -> Response:
        response_data = {
            "success": False,
            "message": message,
            "errors": errors
        }
        return Response(response_data, status=status_code)

class ExceptionHandler:
    """
    Exception Handling Class
    """
    @staticmethod
    def handle(func):
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except ObjectDoesNotExist as e:
                return ApiResponse.error(str(e), status.HTTP_404_NOT_FOUND)
            except ValidationError as e:
                return ApiResponse.error("Validation error", errors=e.detail)
            except Exception as e:
                return ApiResponse.error(str(e), status.HTTP_500_INTERNAL_SERVER_ERROR)
        return wrapper

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None and isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        return Response({
            "success": False,
            "message": "Authentication invalid.",
            "errors": None
        }, status=status.HTTP_401_UNAUTHORIZED)
    return response


