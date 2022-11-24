namespace API.Entities.OrderAggregate;

public enum OrderStatus
{
    Pending,
    PaymentReceived,
    PaymentFailed,
    Shipped,
    Cancelled
}