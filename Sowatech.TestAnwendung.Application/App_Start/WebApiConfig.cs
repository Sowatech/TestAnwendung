using Microsoft.Owin.Security.OAuth;
using Sowatech.ServiceLocation;
using Sowatech.WebApi;
using System.Web.Http;
using System.Web.Http.Cors;

namespace Sowatech.TestAnwendung.Application
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web-API-Konfiguration und -Dienste
            // Web-API für die ausschließliche Verwendung von Trägertokenauthentifizierung konfigurieren.
            config.SuppressDefaultHostAuthentication();
            config.Filters.Add(new HostAuthenticationFilter(OAuthDefaults.AuthenticationType));

            var cors = new EnableCorsAttribute("*", "*", "*");
            config.EnableCors(cors);

            // Web-API-Routen
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            dependencyResolver = new MefDependencyResolver(
               new MefCatalogBuilder()
               .Assembly<Startup>()
               .Assembly<Sowatech.TestAnwendung.Dal.EntityFrameworkContext>()
               .Assembly<Sowatech.TestAnwendung.Dom.ObjectWithIntId>()
               .Build()
           );
            config.DependencyResolver = dependencyResolver;
            WebApiApplication.logger = dependencyResolver.Logger;
        }

        public static MefDependencyResolver dependencyResolver;
    }
}