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
    public class ClientsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ClientsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetClients([FromQuery] string? search)
        {
            var query = _context.ClientCompanies.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c =>
                    c.RagioneSociale.Contains(search) ||
                    (c.Email != null && c.Email.Contains(search)));
            }

            var clients = await query
                .OrderBy(c => c.RagioneSociale)
                .ToListAsync();

            return Ok(clients);
        }

        [HttpPost]
        public async Task<IActionResult> CreateClient(ClientCompanyCreateDto dto)
        {
            var exists = await _context.ClientCompanies.AnyAsync(c =>
                c.RagioneSociale.ToLower() == dto.RagioneSociale.ToLower());

            if (exists)
                return BadRequest("Esiste già un'azienda con questa ragione sociale.");

            var client = new ClientCompany
            {
                RagioneSociale = dto.RagioneSociale,
                Email = dto.Email,
                Attivo = true
            };

            _context.ClientCompanies.Add(client);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetClients), new { id = client.Id }, client);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateClient(int id, ClientCompanyUpdateDto dto)
        {
            var client = await _context.ClientCompanies.FindAsync(id);

            if (client == null)
                return NotFound("Azienda non trovata.");

            var duplicateExists = await _context.ClientCompanies.AnyAsync(c =>
                c.Id != id &&
                c.RagioneSociale.ToLower() == dto.RagioneSociale.ToLower());

            if (duplicateExists)
                return BadRequest("Esiste già un'altra azienda con questa ragione sociale.");

            client.RagioneSociale = dto.RagioneSociale;
            client.Email = dto.Email;
            client.Attivo = dto.Attivo;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteClient(int id)
        {
            var client = await _context.ClientCompanies.FindAsync(id);

            if (client == null)
                return NotFound("Azienda non trovata.");

            var hasDocuments = await _context.Documents.AnyAsync(d => d.ClienteId == id);

            if (hasDocuments)
            {
                client.Attivo = false;
                await _context.SaveChangesAsync();

                return Ok("Azienda disattivata perché associata a documenti esistenti.");
            }

            _context.ClientCompanies.Remove(client);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}