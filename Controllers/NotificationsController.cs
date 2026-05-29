using DocuArchive.Data;
using DocuArchive.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DocuArchive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            AppDbContext context,
            ILogger<NotificationsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<NotificationReadDto>>> GetMyNotifications()
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrWhiteSpace(currentUserId))
                    return Unauthorized("Utente non autenticato.");

                var notifications = await _context.Notifications
                    .Include(n => n.Document)
                    .Where(n => n.UserId == currentUserId)
                    .OrderByDescending(n => n.CreatedAt)
                    .Select(n => new NotificationReadDto
                    {
                        Id = n.Id,
                        Title = n.Title,
                        Message = n.Message,
                        DocumentId = n.DocumentId,
                        DocumentTitle = n.Document != null ? n.Document.Titolo : null,
                        IsRead = n.IsRead,
                        CreatedAt = n.CreatedAt
                    })
                    .ToListAsync();

                return Ok(notifications);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante il recupero notifiche.");
                return StatusCode(500, "Errore interno durante il recupero notifiche.");
            }
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrWhiteSpace(currentUserId))
                    return Unauthorized("Utente non autenticato.");

                var notification = await _context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == id && n.UserId == currentUserId);

                if (notification == null)
                    return NotFound("Notifica non trovata.");

                notification.IsRead = true;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante aggiornamento notifica {NotificationId}.", id);
                return StatusCode(500, "Errore interno durante aggiornamento notifica.");
            }
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrWhiteSpace(currentUserId))
                    return Unauthorized("Utente non autenticato.");

                var notifications = await _context.Notifications
                    .Where(n => n.UserId == currentUserId && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante aggiornamento notifiche.");
                return StatusCode(500, "Errore interno durante aggiornamento notifiche.");
            }
        }
    }
}