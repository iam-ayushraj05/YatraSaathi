class ServiceError(Exception):
    """Base exception for all service-related errors."""
    pass


class NotFoundException(ServiceError):
    """Exception raised when a requested resource is not found."""
    pass


class ValidationError(ServiceError):
    """Exception raised when inputs fail service validation rules."""
    pass


class RoutingException(ServiceError):
    """Exception raised when routing or navigation fails."""
    pass


class DatabaseException(ServiceError):
    """Exception raised when a database operation fails under the hood."""
    pass
