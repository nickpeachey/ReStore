using API.Data;
using API.DTOs;
using API.Entities;
using API.Entities.OrderAggregate;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;

namespace API.Controllers;

[Authorize]
public class OrdersController : BaseApiController
{
    private readonly StoreContext _context;

    public OrdersController(StoreContext context)
    {
        this._context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<Order>>> GetOrders()
    {
        return await _context.Orders
            .Include(o => o.OrderItems)
            .Where(x => x.BuyerId == User.Identity.Name)
            .ToListAsync();

    }

    [HttpGet("{id}", Name = "GetOrder")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        return await _context.Orders
            .Include(x => x.OrderItems)
            .Where(x => x.BuyerId == User.Identity.Name && x.Id == id)
            .FirstOrDefaultAsync();
    }

    [HttpPost]
    public async Task<ActionResult<int>> CreateOrder(CreateOrderDto orderDto)
    {
        var basket = await _context.Baskets
            .RetrieveBasketWithItems(User.Identity.Name).FirstOrDefaultAsync();
        if (basket == null) return BadRequest(new ProblemDetails {Title = "Could not locate basket"});
        var items = new List<OrderItem>();

        foreach (var item in basket.Items)
        {
            var productItem = await _context.Products.FindAsync(item.ProductId);
            var itemOrdered = new ProductItemOrdered
            {
                ProductId = productItem.Id,
                Name = productItem.Name,
                PictureUrl = productItem.PictureUrl
            };

            var orderItem = new OrderItem
            {
                ItemOrdered = itemOrdered,
                Price = productItem.Price,
                Quantity = item.Quantity
            };

            items.Add(orderItem);
            // TODO: would not do this here, would more like be best placed for an offline order processor depending on if payment auth was successful and stock counts where correct
            // productItem.QuantityInStock -= item.Quantity;
        }

        var subTotal = items.Sum(item => item.Price * item.Quantity);
        var deliveryFee = subTotal > 10000 ? 0 : 500;

        var order = new Order
        {
            OrderItems = items,
            BuyerId = User.Identity.Name,
            ShippingAddress = orderDto.ShippingAddress,
            Subtotal = subTotal,
            DeliveryFee = deliveryFee
        };
        _context.Orders.Add(order);
        _context.Baskets.Remove(basket);


        if (orderDto.SaveAddress)
        {
            var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName == User.Identity.Name);
            user.Address = new UserAddress
            {
                Fullname = orderDto.ShippingAddress.Fullname,
                Address1 = orderDto.ShippingAddress.Address1,
                Address2 = orderDto.ShippingAddress.Address2,
                City = orderDto.ShippingAddress.City,
                Postcode = orderDto.ShippingAddress.Postcode,
                County = orderDto.ShippingAddress.County,
                Country = orderDto.ShippingAddress.Country
            };
            _context.Update(user);
        }
        
        var result = await _context.SaveChangesAsync() > 0;
        if (result) return CreatedAtRoute("GetOrder", new {id = order.Id}, order.Id);
        return BadRequest("Problem creating order");
    }
}
