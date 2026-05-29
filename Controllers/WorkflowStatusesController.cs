using DocuArchive.Data;
using DocuArchive.DTOs;
using DocuArchive.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace DocuArchive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WorkflowStatusesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<WorkflowStatusesController> _logger;

        public WorkflowStatusesController(
            AppDbContext context,
            ILogger<WorkflowStatusesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetWorkflowStatuses([FromQuery] string? search)
        {
            try
            {
                var query = _context.DocumentWorkflowStatuses.AsQueryable();

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(s => s.Nome.Contains(search));
                }

                var statuses = await query
                    .OrderBy(s => s.Ordine)
                    .ThenBy(s => s.Nome)
                    .ToListAsync();

                return Ok(statuses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante il recupero degli stati pratica.");
                return StatusCode(500, "Errore interno durante il recupero degli stati pratica.");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateWorkflowStatus(DocumentWorkflowStatusCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var exists = await _context.DocumentWorkflowStatuses
                    .AnyAsync(s => s.Nome.ToLower() == dto.Nome.ToLower());

                if (exists)
                    return BadRequest("Esiste già uno stato pratica con questo nome.");

                var status = new DocumentWorkflowStatus
                {
                    Nome = dto.Nome.Trim(),
                    Colore = dto.Colore,
                    Ordine = dto.Ordine,
                    Attivo = true
                };

                _context.DocumentWorkflowStatuses.Add(status);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetWorkflowStatuses), new { id = status.Id }, status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante la creazione dello stato pratica.");
                return StatusCode(500, "Errore interno durante la creazione dello stato pratica.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkflowStatus(
            int id,
            DocumentWorkflowStatusUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var status = await _context.DocumentWorkflowStatuses.FindAsync(id);

                if (status == null)
                    return NotFound("Stato pratica non trovato.");

                var duplicateExists = await _context.DocumentWorkflowStatuses.AnyAsync(s =>
                    s.Id != id &&
                    s.Nome.ToLower() == dto.Nome.ToLower());

                if (duplicateExists)
                    return BadRequest("Esiste già un altro stato pratica con questo nome.");

                status.Nome = dto.Nome.Trim();
                status.Colore = dto.Colore;
                status.Ordine = dto.Ordine;
                status.Attivo = dto.Attivo;

                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante l'aggiornamento dello stato pratica con ID {StatusId}.", id);
                return StatusCode(500, "Errore interno durante l'aggiornamento dello stato pratica.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkflowStatus(int id)
        {
            try
            {
                var status = await _context.DocumentWorkflowStatuses.FindAsync(id);

                if (status == null)
                    return NotFound("Stato pratica non trovato.");

                var hasDocuments = await _context.Documents
                    .AnyAsync(d => d.WorkflowStatusId == id);

                if (hasDocuments)
                {
                    status.Attivo = false;
                    await _context.SaveChangesAsync();

                    return Ok("Stato pratica disattivato perché associato a documenti esistenti.");
                }

                _context.DocumentWorkflowStatuses.Remove(status);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante l'eliminazione dello stato pratica con ID {StatusId}.", id);
                return StatusCode(500, "Errore interno durante l'eliminazione dello stato pratica.");
            }
        }
    }
}