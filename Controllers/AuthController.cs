using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DocuArchive.DTOs;
using DocuArchive.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authorization;

namespace DocuArchive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
   
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _logger = logger;
        }

        [Authorize(Roles = "SuperAdmin")]

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var existingUser = await _userManager.FindByEmailAsync(dto.Email);

                if (existingUser != null)
                    return BadRequest("Esiste già un utente con questa email.");

                var allowedRoles = new[] { "SuperAdmin", "Admin", "Operatore" };

                if (!allowedRoles.Contains(dto.Role))
                    return BadRequest("Ruolo non valido.");

                var user = new ApplicationUser
                {
                    Nome = dto.Nome.Trim(),
                    Cognome = dto.Cognome.Trim(),
                    UserName = dto.Email,
                    Email = dto.Email,
                    EmailConfirmed = true,
                    Attivo = true,
                    PreferredLanguage = "it",
                    PreferredTheme = "light"
                };

                var result = await _userManager.CreateAsync(user, dto.Password);

                if (!result.Succeeded)
                    return BadRequest(result.Errors.Select(e => e.Description));

                await _userManager.AddToRoleAsync(user, dto.Role);

                _logger.LogInformation(
                    "Nuovo utente registrato: {Email} con ruolo {Role}.",
                    user.Email,
                    dto.Role
                );

                return Ok("Utente registrato correttamente.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante la registrazione utente.");
                return StatusCode(500, "Errore interno durante la registrazione.");
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = await _userManager.FindByEmailAsync(dto.Email);

                if (user == null || !user.Attivo)
                    return Unauthorized("Email o password non validi.");

                var result = await _signInManager.CheckPasswordSignInAsync(
                    user,
                    dto.Password,
                    false
                );

                if (!result.Succeeded)
                    return Unauthorized("Email o password non validi.");

                var roles = await _userManager.GetRolesAsync(user);

                var tokenExpiration = DateTime.UtcNow.AddMinutes(
                    Convert.ToDouble(_configuration["Jwt:DurationInMinutes"])
                );

                var token = GenerateJwtToken(user, roles.ToList(), tokenExpiration);

                var response = new AuthResponseDto
                {
                    Token = token,
                    Expiration = tokenExpiration,
                    Email = user.Email ?? string.Empty,
                    Nome = user.Nome,
                    Cognome = user.Cognome,
                    Roles = roles.ToList(),
                    PreferredLanguage = user.PreferredLanguage,
                    PreferredTheme = user.PreferredTheme
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante il login.");
                return StatusCode(500, "Errore interno durante il login.");
            }
        }

        [Authorize]
        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferences(UserPreferencesUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var allowedLanguages = new[] { "it", "en" };
                var allowedThemes = new[] { "light", "dark" };

                if (!allowedLanguages.Contains(dto.PreferredLanguage))
                    return BadRequest("Lingua non valida.");

                if (!allowedThemes.Contains(dto.PreferredTheme))
                    return BadRequest("Tema non valido.");

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrWhiteSpace(userId))
                    return Unauthorized("Utente non autenticato.");

                var user = await _userManager.FindByIdAsync(userId);

                if (user == null)
                    return NotFound("Utente non trovato.");

                user.PreferredLanguage = dto.PreferredLanguage;
                user.PreferredTheme = dto.PreferredTheme;

                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                    return BadRequest(result.Errors.Select(e => e.Description));

                return Ok("Preferenze aggiornate correttamente.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante l'aggiornamento preferenze utente.");
                return StatusCode(500, "Errore interno durante l'aggiornamento preferenze.");
            }
        }

        private string GenerateJwtToken(
            ApplicationUser user,
            List<string> roles,
            DateTime expiration)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name, $"{user.Nome} {user.Cognome}".Trim()),
                new Claim("nome", user.Nome),
                new Claim("cognome", user.Cognome)
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: expiration,
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}