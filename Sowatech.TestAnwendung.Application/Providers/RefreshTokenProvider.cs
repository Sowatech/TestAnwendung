using Sowatech.TestAnwendung.Dal;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.Infrastructure;
using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Application.Providers
{
    /// <summary>
    /// Beim erzeugen eines Access_Tokens kommt er hier in die "CreateAsync" funktion die für das
    /// erzeugen eines RefreshTokens zu ständeig ist. In der Funktion erzeugen wir uns eine
    /// refreshTokenId und ein RefreshToken, dass RefreshToken wird in der DB gespeichert und als Id
    /// wird die refreshTokenId (die wir Hashen) benutzt. An den Client wird jetzt nicht das
    /// RefreshToken sondern die refreshTokenId (die nicht gehached ist) gesendet.
    /// </summary>
    public class RefreshTokenProvider : IAuthenticationTokenProvider
    {
        private static RNGCryptoServiceProvider rnd = new RNGCryptoServiceProvider();
        private static byte[] pepper = new byte[] { 139, 6, 134, 151, 7, 108, 130, 27, 190, 87, 207, 182, 1, 114, 36, 218 };

        public async Task CreateAsync(AuthenticationTokenCreateContext context)
        {
            byte[] randomBytes = new byte[16];
            rnd.GetBytes(randomBytes);
            var refreshTokenId = Convert.ToBase64String(randomBytes);
            var refreshTokenIdHashed = HashTokenId(refreshTokenId);

            var refreshTokenProperties = new AuthenticationProperties(context.Ticket.Properties.Dictionary)
            {
                IssuedUtc = context.Ticket.Properties.IssuedUtc,
                ExpiresUtc = DateTime.UtcNow.AddYears(1) //DateTime.UtcNow.AddYears(1)
            };
            var refreshTokenTicket = new AuthenticationTicket(context.Ticket.Identity, refreshTokenProperties);

            using (EntityFrameworkContext efContext = new EntityFrameworkContext())
            {
                Dom.RefreshToken rt = new Dom.RefreshToken()
                {
                    id = refreshTokenIdHashed, //als Tipp gelesen, dass man diese am besten Hashen sollte
                                               //clientId = "",
                    username = context.Ticket.Identity.Name,
                    issuedUtc = refreshTokenProperties.IssuedUtc.Value,
                    expiresUtc = refreshTokenProperties.ExpiresUtc.Value,
                    protectedTicket = context.SerializeTicket()
                };
                efContext.RefreshTokens.Add(rt);
                efContext.SaveChanges();
            }

            context.SetToken(refreshTokenId);
        }

        public static string HashTokenId(string tokenId)
        {
            byte[] tokenIdBytes = Convert.FromBase64String(tokenId);
            byte[] peppered = tokenIdBytes.Concat(pepper).ToArray();
            byte[] hashed;
            using (var hash = new SHA256Managed())
            {
                hashed = hash.ComputeHash(peppered);
            }

            return Convert.ToBase64String(hashed);
        }

        public void Create(AuthenticationTokenCreateContext context)
        {
            throw new NotImplementedException();
        }

        public void Receive(AuthenticationTokenReceiveContext context)
        {
            throw new NotImplementedException();
        }

        public async Task ReceiveAsync(AuthenticationTokenReceiveContext context)
        {
            string header = context.OwinContext.Request.Headers["Authorization"];
            context.OwinContext.Response.Headers.Add("Access-Control-Allow-Origin", new[] { "*" });

            var token = Uri.UnescapeDataString(context.Token);

            var tokenIdHashed = HashTokenId(token);

            using (EntityFrameworkContext efContext = new EntityFrameworkContext())
            {
                var refreshToken = efContext.RefreshTokens.SingleOrDefault(rt => rt.id == tokenIdHashed); //&& rt.clientId == ""
                if (refreshToken != null)
                {
                    efContext.RefreshTokens.Remove(refreshToken);
                    efContext.SaveChanges();
                    context.DeserializeTicket(refreshToken.protectedTicket);
                }
                else
                {
                    context.Response.StatusCode = 400;
                    context.Response.ContentType = "application/json";
                    context.Response.ReasonPhrase = "invalid token";
                    return;
                }
            }
        }
    }
}