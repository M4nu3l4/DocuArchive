using DocuArchive.DTOs;
using DocuArchive.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace DocuArchive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ILogger<UsersController> _logger;

        public UsersController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ILogger<UsersController> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _logger = logger;
        }

        [HttpGet]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var users = _userManager.Users
                    .OrderBy(u => u.Cognome)
                    .ThenBy(u => u.Nome)
                    .ToList();

                var result = new List<UserReadDto>();

                foreach (var user in users)
                {
                    var roles = await _userManager.GetRolesAsync(user);

                    result.Add(new UserReadDto
                    {
                        Id = user.Id,
                        Nome = user.Nome,
                        Cognome = user.Cognome,
                        Email = user.Email ?? string.Empty,
                        Attivo = user.Attivo,
                        PreferredLanguage = user.PreferredLanguage,
                        PreferredTheme = user.PreferredTheme,
                        Roles = roles.ToList()
                    });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante il recupero degli utenti.");
                return StatusCode(500, "Errore interno durante il recupero degli utenti.");
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "SuperAdmin,Admin")]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);

                if (user == null)
                    return NotFound("Utente non trovato.");

                var roles = await _userManager.GetRolesAsync(user);

                var dto = new UserReadDto
                {
                    Id = user.Id,
                    Nome = user.Nome,
                    Cognome = user.Cognome,
                    Email = user.Email ?? string.Empty,
                    Attivo = user.Attivo,
                    PreferredLanguage = user.PreferredLanguage,
                    PreferredTheme = user.PreferredTheme,
                    Roles = roles.ToList()
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante il recupero dell'utente con ID {UserId}.", id);
                return StatusCode(500, "Errore interno durante il recupero dell'utente.");
            }
        }

        [HttpPut("{id}/role")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> UpdateUserRole(string id, UserRoleUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var allowedRoles = new[] { "SuperAdmin", "Admin", "Operatore" };

                if (!allowedRoles.Contains(dto.Role))
                    return BadRequest("Ruolo non valido.");

                var roleExists = await _roleManager.RoleExistsAsync(dto.Role);

                if (!roleExists)
                    return BadRequest("Il ruolo richiesto non esiste.");

                var user = await _userManager.FindByIdAsync(id);

                if (user == null)
                    return NotFound("Utente non trovato.");

                var currentRoles = await _userManager.GetRolesAsync(user);

                if (currentRoles.Any())
                {
                    var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);

                    if (!removeResult.Succeeded)
                        return BadRequest(removeResult.Errors.Select(e => e.Description));
                }

                var addResult = await _userManager.AddToRoleAsync(user, dto.Role);

                if (!addResult.Succeeded)
                    return BadRequest(addResult.Errors.Select(e => e.Description));

                _logger.LogInformation(
                    "Ruolo utente aggiornato. UserId: {UserId}, Nuovo ruolo: {Role}.",
                    id,
                    dto.Role
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante l'aggiornamento ruolo utente con ID {UserId}.", id);
                return StatusCode(500, "Errore interno durante l'aggiornamento del ruolo utente.");
            }
        }

        [HttpPut("{id}/active")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> UpdateUserActive(string id, UserActiveUpdateDto dto)
        {
            try
            {
                var user = await _userManager.FindByIdAsync(id);

                if (user == null)
                    return NotFound("Utente non trovato.");

                user.Attivo = dto.Attivo;

                var result = await _userManager.UpdateAsync(user);

                if (!result.Succeeded)
                    return BadRequest(result.Errors.Select(e => e.Description));

                _logger.LogInformation(
                    "Stato attivo utente aggiornato. UserId: {UserId}, Attivo: {Attivo}.",
                    id,
                    dto.Attivo
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante l'aggiornamento stato utente con ID {UserId}.", id);
                return StatusCode(500, "Errore interno durante l'aggiornamento dello stato utente.");
            }
        }
    }
}