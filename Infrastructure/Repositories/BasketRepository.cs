using Core.Entities;
using Core.Interfaces;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Repositories
{
    public class BasketRepository : IBasketRepository
    {
        private readonly IConnectionMultiplexer _redis;

        public BasketRepository(IConnectionMultiplexer redis)
        {
            _redis = redis;
        }

        public async Task<bool> DeleteBasketAsync(string basketId)
        {
            var _database = _redis.GetDatabase();
            return await _database.KeyDeleteAsync(basketId);
        }

        public async Task<CustomerBasket> GetBasketAsync(string basketId)
        {
            var _database = _redis.GetDatabase();
            var data = await _database.StringGetAsync(basketId);
            return data.IsNullOrEmpty ? null : JsonSerializer.Deserialize<CustomerBasket>(data);
        }

        public async Task<CustomerBasket> UpdateBasketAsync(CustomerBasket basket)
        {
            var _database = _redis.GetDatabase();
            var created = await _database.StringSetAsync(basket.Id, JsonSerializer.Serialize(basket), TimeSpan.FromDays(30));
            if (!created) return null;

            return await GetBasketAsync(basket.Id);
        }
    }
}
