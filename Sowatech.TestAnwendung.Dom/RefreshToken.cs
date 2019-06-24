using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Sowatech.TestAnwendung.Dom
{
	[Table("RefreshTokens")]
	public class RefreshToken
	{
		[Key]
		[MaxLength(50)]
		public string id { get; set; }

		[Required]
		[MaxLength(50)]
		public string username { get; set; }

		//[Required]
		//[MaxLength(50)]
		//public string clientId { get; set; }

		public DateTimeOffset issuedUtc { get; set; }

		public DateTimeOffset expiresUtc { get; set; }

		[Required]
		public string protectedTicket { get; set; }
	}
}
