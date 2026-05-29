using DocuArchive.Data;
using DocuArchive.DTOs;
using DocuArchive.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocuArchive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories([FromQuery] string? search)
        {
            var query = _context.Categories
                .Where(c => c.Attiva)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var cleanSearch = search.Trim();

                query = query.Where(c => c.Nome.Contains(cleanSearch));
            }

            var categories = await query
                .OrderBy(c => c.Nome)
                .ToListAsync();

            return Ok(categories);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCategory(CategoryCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var nome = dto.Nome?.Trim();

            if (string.IsNullOrWhiteSpace(nome))
                return BadRequest("Il nome categoria è obbligatorio.");

            if (nome.Equals("string", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Nome categoria non valido.");

            var exists = await _context.Categories.AnyAsync(c =>
                c.Nome.ToLower() == nome.ToLower());

            if (exists)
                return BadRequest("Esiste già una categoria con questo nome.");

            var category = new Category
            {
                Nome = nome,
                Attiva = true
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, CategoryUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var nome = dto.Nome?.Trim();

            if (string.IsNullOrWhiteSpace(nome))
                return BadRequest("Il nome categoria è obbligatorio.");

            if (nome.Equals("string", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Nome categoria non valido.");

            var category = await _context.Categories.FindAsync(id);

            if (category == null)
                return NotFound("Categoria non trovata.");

            var duplicateExists = await _context.Categories.AnyAsync(c =>
                c.Id != id &&
                c.Nome.ToLower() == nome.ToLower());

            if (duplicateExists)
                return BadRequest("Esiste già un'altra categoria con questo nome.");

            category.Nome = nome;
            category.Attiva = dto.Attiva;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);

            if (category == null)
                return NotFound("Categoria non trovata.");

            var hasDocuments = await _context.Documents.AnyAsync(d => d.CategoriaId == id);

            if (hasDocuments)
            {
                category.Attiva = false;
                await _context.SaveChangesAsync();

                return Ok("Categoria disattivata perché associata a documenti esistenti.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}