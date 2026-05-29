using DocuArchive.Data;
using DocuArchive.DTOs;
using DocuArchive.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DocuArchive.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DocumentsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<DocumentsController> _logger;

        private const long MaxFileSize = 5 * 1024 * 1024;

        private static readonly string[] AllowedExtensions =
        {
            ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"
        };

        public DocumentsController(
            AppDbContext context,
            ILogger<DocumentsController> logger,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentReadDto>>> GetDocuments(
            [FromQuery] int? categoryId,
            [FromQuery] int? clientId,
            [FromQuery] int? workflowStatusId,
            [FromQuery] DocumentStatus? status,
            [FromQuery] string? search,
            [FromQuery] bool onlyMine = false)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var isSuperAdmin = User.IsInRole("SuperAdmin");
                var isAdmin = User.IsInRole("Admin");

                var query = _context.Documents
                    .Include(d => d.Categoria)
                    .Include(d => d.Cliente)
                    .Include(d => d.WorkflowStatus)
                    .Include(d => d.AssignedToUser)
                    .Include(d => d.AssignedByUser)
                    .Include(d => d.LockedByUser)
                    .AsQueryable();

                if (onlyMine && !string.IsNullOrWhiteSpace(currentUserId))
                    query = query.Where(d => d.AssignedToUserId == currentUserId);
                else if (!isSuperAdmin && !isAdmin && !string.IsNullOrWhiteSpace(currentUserId))
                    query = query.Where(d => d.AssignedToUserId == currentUserId);

                if (categoryId.HasValue)
                    query = query.Where(d => d.CategoriaId == categoryId.Value);

                if (clientId.HasValue)
                    query = query.Where(d => d.ClienteId == clientId.Value);

                if (workflowStatusId.HasValue)
                    query = query.Where(d => d.WorkflowStatusId == workflowStatusId.Value);

                if (status.HasValue)
                    query = query.Where(d => d.Stato == status.Value);

                if (!string.IsNullOrWhiteSpace(search))
                {
                    query = query.Where(d =>
                        d.Titolo.Contains(search) ||
                        (d.Descrizione != null && d.Descrizione.Contains(search)));
                }

                var documents = await query
                    .OrderByDescending(d => d.DataCreazione)
                    .Select(d => new DocumentReadDto
                    {
                        Id = d.Id,
                        Titolo = d.Titolo,
                        Descrizione = d.Descrizione,
                        CategoriaId = d.CategoriaId,
                        CategoriaNome = d.Categoria != null ? d.Categoria.Nome : string.Empty,
                        ClienteId = d.ClienteId,
                        ClienteRagioneSociale = d.Cliente != null ? d.Cliente.RagioneSociale : string.Empty,
                        NomeFile = d.NomeFile,
                        PercorsoFile = d.PercorsoFile,
                        Stato = d.Stato.ToString(),
                        WorkflowStatusId = d.WorkflowStatusId,
                        WorkflowStatusNome = d.WorkflowStatus != null ? d.WorkflowStatus.Nome : null,
                        WorkflowStatusColore = d.WorkflowStatus != null ? d.WorkflowStatus.Colore : null,

                        AssignedToUserId = d.AssignedToUserId,
                        AssignedToUserFullName = d.AssignedToUser != null
                            ? (d.AssignedToUser.Nome + " " + d.AssignedToUser.Cognome).Trim()
                            : null,
                        AssignedAt = d.AssignedAt,
                        AssignedByUserId = d.AssignedByUserId,
                        AssignedByUserFullName = d.AssignedByUser != null
                            ? (d.AssignedByUser.Nome + " " + d.AssignedByUser.Cognome).Trim()
                            : null,

                        LockedByUserId = d.LockedByUserId,
                        LockedByUserFullName = d.LockedByUser != null
                            ? (d.LockedByUser.Nome + " " + d.LockedByUser.Cognome).Trim()
                            : null,
                        LockedAt = d.LockedAt,

                        DataCreazione = d.DataCreazione,
                        DataUltimaModifica = d.DataUltimaModifica
                    })
                    .ToListAsync();

                return Ok(documents);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante il recupero dei documenti.");
                return StatusCode(500, "Errore interno durante il recupero dei documenti.");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentReadDto>> GetDocumentById(int id)
        {
            try
            {
                var document = await MapToReadDto(id);

                if (document == null)
                    return NotFound("Documento non trovato.");

                return Ok(document);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante il recupero del documento con ID {DocumentId}.", id);
                return StatusCode(500, "Errore interno durante il recupero del documento.");
            }
        }

        [HttpGet("{id}/logs")]
        public async Task<ActionResult<IEnumerable<DocumentActivityLogReadDto>>> GetDocumentLogs(int id)
        {
            var logs = await _context.DocumentActivityLogs
                .Include(l => l.Document)
                .Where(l => l.DocumentId == id)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new DocumentActivityLogReadDto
                {
                    Id = l.Id,
                    DocumentId = l.DocumentId,
                    DocumentTitle = l.Document != null ? l.Document.Titolo : string.Empty,
                    UserId = l.UserId,
                    UserFullName = l.UserFullName,
                    Action = l.Action,
                    Description = l.Description,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return Ok(logs);
        }

        [HttpGet("logs/my")]
        public async Task<ActionResult<IEnumerable<DocumentActivityLogReadDto>>> GetMyLogs()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrWhiteSpace(currentUserId))
                return Unauthorized("Utente non autenticato.");

            var logs = await _context.DocumentActivityLogs
                .Include(l => l.Document)
                .Where(l => l.UserId == currentUserId)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new DocumentActivityLogReadDto
                {
                    Id = l.Id,
                    DocumentId = l.DocumentId,
                    DocumentTitle = l.Document != null ? l.Document.Titolo : string.Empty,
                    UserId = l.UserId,
                    UserFullName = l.UserFullName,
                    Action = l.Action,
                    Description = l.Description,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return Ok(logs);
        }

        [Authorize(Roles = "SuperAdmin")]
        [HttpGet("logs/all")]
        public async Task<ActionResult<IEnumerable<DocumentActivityLogReadDto>>> GetAllLogs()
        {
            var logs = await _context.DocumentActivityLogs
                .Include(l => l.Document)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => new DocumentActivityLogReadDto
                {
                    Id = l.Id,
                    DocumentId = l.DocumentId,
                    DocumentTitle = l.Document != null ? l.Document.Titolo : string.Empty,
                    UserId = l.UserId,
                    UserFullName = l.UserFullName,
                    Action = l.Action,
                    Description = l.Description,
                    CreatedAt = l.CreatedAt
                })
                .ToListAsync();

            return Ok(logs);
        }

        [HttpPost]
        public async Task<ActionResult<DocumentReadDto>> CreateDocument(DocumentCreateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!Enum.IsDefined(typeof(DocumentStatus), dto.Stato))
                    return BadRequest("Stato documento non valido.");

                var validationResult = await ValidateCategoryClientAndWorkflowStatus(
                    dto.CategoriaId,
                    dto.ClienteId,
                    dto.WorkflowStatusId
                );

                if (validationResult != null)
                    return validationResult is ObjectResult objectResult
                        ? objectResult
                        : BadRequest();

                var document = new Document
                {
                    Titolo = dto.Titolo.Trim(),
                    Descrizione = dto.Descrizione,
                    CategoriaId = dto.CategoriaId,
                    ClienteId = dto.ClienteId,
                    WorkflowStatusId = dto.WorkflowStatusId,
                    NomeFile = dto.NomeFile,
                    PercorsoFile = dto.PercorsoFile,
                    Stato = dto.Stato,
                    DataCreazione = DateTime.Now
                };

                _context.Documents.Add(document);
                await _context.SaveChangesAsync();

                await AddDocumentLogAsync(
                    document.Id,
                    "Creazione documento",
                    $"Documento '{document.Titolo}' creato."
                );

                var createdDocument = await MapToReadDto(document.Id);

                return CreatedAtAction(nameof(GetDocumentById), new { id = document.Id }, createdDocument);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante la creazione del documento.");
                return StatusCode(500, "Errore interno durante la creazione del documento.");
            }
        }

        [HttpPost("upload")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<DocumentReadDto>> CreateDocumentWithUpload([FromForm] DocumentUploadCreateDto dto)
        {
            string? savedFilePath = null;

            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!Enum.IsDefined(typeof(DocumentStatus), dto.Stato))
                    return BadRequest("Stato documento non valido.");

                var validationResult = await ValidateCategoryClientAndWorkflowStatus(
                    dto.CategoriaId,
                    dto.ClienteId,
                    dto.WorkflowStatusId
                );

                if (validationResult != null)
                    return validationResult is ObjectResult objectResult
                        ? objectResult
                        : BadRequest();

                string? nomeFile = null;
                string? percorsoFile = null;

                if (dto.File != null)
                {
                    var fileValidationError = ValidateUploadedFile(dto.File);

                    if (fileValidationError != null)
                        return BadRequest(fileValidationError);

                    var extension = Path.GetExtension(dto.File.FileName).ToLowerInvariant();

                    var uploadsFolder = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot",
                        "documents");

                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    savedFilePath = Path.Combine(uploadsFolder, uniqueFileName);

                    await using var stream = new FileStream(savedFilePath, FileMode.Create);
                    await dto.File.CopyToAsync(stream);

                    nomeFile = Path.GetFileName(dto.File.FileName);
                    percorsoFile = $"/documents/{uniqueFileName}";
                }

                var document = new Document
                {
                    Titolo = dto.Titolo.Trim(),
                    Descrizione = dto.Descrizione,
                    CategoriaId = dto.CategoriaId,
                    ClienteId = dto.ClienteId,
                    WorkflowStatusId = dto.WorkflowStatusId,
                    NomeFile = nomeFile,
                    PercorsoFile = percorsoFile,
                    Stato = dto.Stato,
                    DataCreazione = DateTime.Now
                };

                _context.Documents.Add(document);
                await _context.SaveChangesAsync();

                await AddDocumentLogAsync(
                    document.Id,
                    "Creazione documento",
                    nomeFile != null
                        ? $"Documento '{document.Titolo}' creato con allegato '{nomeFile}'."
                        : $"Documento '{document.Titolo}' creato senza allegato."
                );

                var createdDocument = await MapToReadDto(document.Id);

                return CreatedAtAction(nameof(GetDocumentById), new { id = document.Id }, createdDocument);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante la creazione del documento con upload.");

                if (!string.IsNullOrWhiteSpace(savedFilePath) && System.IO.File.Exists(savedFilePath))
                    System.IO.File.Delete(savedFilePath);

                return StatusCode(500, "Errore interno durante il caricamento del documento.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, DocumentUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!Enum.IsDefined(typeof(DocumentStatus), dto.Stato))
                    return BadRequest("Stato documento non valido.");

                var document = await _context.Documents.FindAsync(id);

                if (document == null)
                    return NotFound("Documento non trovato.");

                var oldTitle = document.Titolo;

                var validationResult = await ValidateCategoryClientAndWorkflowStatus(
                    dto.CategoriaId,
                    dto.ClienteId,
                    dto.WorkflowStatusId
                );

                if (validationResult != null)
                    return validationResult;

                document.Titolo = dto.Titolo.Trim();
                document.Descrizione = dto.Descrizione;
                document.CategoriaId = dto.CategoriaId;
                document.ClienteId = dto.ClienteId;
                document.WorkflowStatusId = dto.WorkflowStatusId;
                document.NomeFile = dto.NomeFile;
                document.PercorsoFile = dto.PercorsoFile;
                document.Stato = dto.Stato;
                document.DataUltimaModifica = DateTime.Now;

                await _context.SaveChangesAsync();

                await AddDocumentLogAsync(
                    document.Id,
                    "Modifica documento",
                    $"Documento modificato. Titolo precedente: '{oldTitle}', nuovo titolo: '{document.Titolo}'."
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante l'aggiornamento del documento con ID {DocumentId}.", id);
                return StatusCode(500, "Errore interno durante l'aggiornamento del documento.");
            }
        }

        [HttpPut("{id}/upload")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdateDocumentWithFile(
            int id,
            [FromForm] DocumentUpdateWithFileDto dto)
        {
            string? newSavedFilePath = null;

            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (!Enum.IsDefined(typeof(DocumentStatus), dto.Stato))
                    return BadRequest("Stato documento non valido.");

                var document = await _context.Documents.FindAsync(id);

                if (document == null)
                    return NotFound("Documento non trovato.");

                var oldFileName = document.NomeFile;

                var validationResult = await ValidateCategoryClientAndWorkflowStatus(
                    dto.CategoriaId,
                    dto.ClienteId,
                    dto.WorkflowStatusId
                );

                if (validationResult != null)
                    return validationResult;

                var oldPhysicalFilePath = GetPhysicalFilePath(document.PercorsoFile);

                document.Titolo = dto.Titolo.Trim();
                document.Descrizione = dto.Descrizione;
                document.CategoriaId = dto.CategoriaId;
                document.ClienteId = dto.ClienteId;
                document.WorkflowStatusId = dto.WorkflowStatusId;
                document.Stato = dto.Stato;
                document.DataUltimaModifica = DateTime.Now;

                if (dto.RemoveFile)
                {
                    document.NomeFile = null;
                    document.PercorsoFile = null;
                }

                if (dto.File != null)
                {
                    var fileValidationError = ValidateUploadedFile(dto.File);

                    if (fileValidationError != null)
                        return BadRequest(fileValidationError);

                    var extension = Path.GetExtension(dto.File.FileName).ToLowerInvariant();

                    var uploadsFolder = Path.Combine(
                        Directory.GetCurrentDirectory(),
                        "wwwroot",
                        "documents");

                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    newSavedFilePath = Path.Combine(uploadsFolder, uniqueFileName);

                    await using var stream = new FileStream(newSavedFilePath, FileMode.Create);
                    await dto.File.CopyToAsync(stream);

                    document.NomeFile = Path.GetFileName(dto.File.FileName);
                    document.PercorsoFile = $"/documents/{uniqueFileName}";
                }

                await _context.SaveChangesAsync();

                if ((dto.RemoveFile || dto.File != null) &&
                    !string.IsNullOrWhiteSpace(oldPhysicalFilePath) &&
                    System.IO.File.Exists(oldPhysicalFilePath))
                {
                    System.IO.File.Delete(oldPhysicalFilePath);
                }

                var logDescription = "Documento aggiornato.";

                if (dto.RemoveFile)
                    logDescription = $"Allegato rimosso. File precedente: '{oldFileName ?? "nessun file"}'.";

                if (dto.File != null)
                    logDescription = $"Allegato sostituito. File precedente: '{oldFileName ?? "nessun file"}', nuovo file: '{document.NomeFile}'.";

                await AddDocumentLogAsync(document.Id, "Modifica documento", logDescription);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante l'aggiornamento con file del documento con ID {DocumentId}.", id);

                if (!string.IsNullOrWhiteSpace(newSavedFilePath) && System.IO.File.Exists(newSavedFilePath))
                    System.IO.File.Delete(newSavedFilePath);

                return StatusCode(500, "Errore interno durante l'aggiornamento del documento con file.");
            }
        }

        [Authorize(Roles = "SuperAdmin,Admin")]
        [HttpPut("{id}/assign")]
        public async Task<IActionResult> AssignDocument(int id, DocumentAssignDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var document = await _context.Documents
                    .Include(d => d.AssignedToUser)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (document == null)
                    return NotFound("Documento non trovato.");

                var assignedUser = await _userManager.FindByIdAsync(dto.AssignedToUserId);

                if (assignedUser == null || !assignedUser.Attivo)
                    return BadRequest("Utente assegnatario non valido o non attivo.");

                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrWhiteSpace(currentUserId))
                    return Unauthorized("Utente non autenticato.");

                var previousAssignedUser = document.AssignedToUser != null
                    ? $"{document.AssignedToUser.Nome} {document.AssignedToUser.Cognome}".Trim()
                    : "Nessuno";

                document.AssignedToUserId = assignedUser.Id;
                document.AssignedAt = DateTime.Now;
                document.AssignedByUserId = currentUserId;
                document.DataUltimaModifica = DateTime.Now;

                var notification = new Notification
                {
                    UserId = assignedUser.Id,
                    DocumentId = document.Id,
                    Title = "Nuova pratica assegnata",
                    Message = $"Ti è stata assegnata la pratica '{document.Titolo}'.",
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };

                _context.Notifications.Add(notification);

                await _context.SaveChangesAsync();

                await AddDocumentLogAsync(
                    document.Id,
                    "Assegnazione pratica",
                    $"Pratica assegnata a {assignedUser.Nome} {assignedUser.Cognome}. Assegnazione precedente: {previousAssignedUser}."
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante l'assegnazione del documento con ID {DocumentId}.", id);
                return StatusCode(500, "Errore interno durante l'assegnazione del documento.");
            }
        }

        [HttpPut("{id}/take")]
        public async Task<IActionResult> TakeDocument(int id)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (string.IsNullOrWhiteSpace(currentUserId))
                    return Unauthorized("Utente non autenticato.");

                var document = await _context.Documents
                    .Include(d => d.LockedByUser)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (document == null)
                    return NotFound("Documento non trovato.");

                if (!string.IsNullOrWhiteSpace(document.LockedByUserId) &&
                    document.LockedByUserId != currentUserId)
                {
                    var lockedBy = document.LockedByUser != null
                        ? $"{document.LockedByUser.Nome} {document.LockedByUser.Cognome}".Trim()
                        : "un altro utente";

                    return Conflict($"Pratica già in lavorazione da {lockedBy}.");
                }

                document.LockedByUserId = currentUserId;
                document.LockedAt = DateTime.Now;
                document.DataUltimaModifica = DateTime.Now;

                await _context.SaveChangesAsync();

                await AddDocumentLogAsync(
                    document.Id,
                    "Presa in carico",
                    "La pratica è stata presa in carico."
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante la presa in carico del documento con ID {DocumentId}.", id);
                return StatusCode(500, "Errore interno durante la presa in carico della pratica.");
            }
        }

        [HttpPut("{id}/release")]
        public async Task<IActionResult> ReleaseDocument(int id)
        {
            try
            {
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var isSuperAdmin = User.IsInRole("SuperAdmin");
                var isAdmin = User.IsInRole("Admin");

                if (string.IsNullOrWhiteSpace(currentUserId))
                    return Unauthorized("Utente non autenticato.");

                var document = await _context.Documents.FindAsync(id);

                if (document == null)
                    return NotFound("Documento non trovato.");

                if (string.IsNullOrWhiteSpace(document.LockedByUserId))
                    return BadRequest("La pratica non è attualmente presa in carico.");

                if (document.LockedByUserId != currentUserId && !isSuperAdmin && !isAdmin)
                    return Forbid();

                document.LockedByUserId = null;
                document.LockedAt = null;
                document.DataUltimaModifica = DateTime.Now;

                await _context.SaveChangesAsync();

                await AddDocumentLogAsync(
                    document.Id,
                    "Rilascio pratica",
                    "La pratica è stata rilasciata."
                );

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante il rilascio del documento con ID {DocumentId}.", id);
                return StatusCode(500, "Errore interno durante il rilascio della pratica.");
            }
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadDocumentFile(int id)
        {
            try
            {
                var document = await _context.Documents.FindAsync(id);

                if (document == null)
                    return NotFound("Documento non trovato.");

                if (string.IsNullOrWhiteSpace(document.PercorsoFile))
                    return NotFound("Nessun file associato a questo documento.");

                var relativePath = document.PercorsoFile.TrimStart('/');
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

                if (!System.IO.File.Exists(filePath))
                    return NotFound("File fisico non trovato sul server.");

                await AddDocumentLogAsync(
                    document.Id,
                    "Download allegato",
                    $"File scaricato: '{document.NomeFile ?? Path.GetFileName(filePath)}'."
                );

                var contentType = GetContentType(filePath);
                var fileName = document.NomeFile ?? Path.GetFileName(filePath);

                return PhysicalFile(filePath, contentType, fileName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante il download del documento con ID {DocumentId}.", id);
                return StatusCode(500, "Errore interno durante il download del file.");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            try
            {
                var document = await _context.Documents.FindAsync(id);

                if (document == null)
                    return NotFound("Documento non trovato.");

                var title = document.Titolo;
                var physicalFilePath = GetPhysicalFilePath(document.PercorsoFile);

                await AddDocumentLogAsync(
                    document.Id,
                    "Eliminazione documento",
                    $"Documento '{title}' eliminato."
                );

                _context.Documents.Remove(document);
                await _context.SaveChangesAsync();

                if (!string.IsNullOrWhiteSpace(physicalFilePath) && System.IO.File.Exists(physicalFilePath))
                    System.IO.File.Delete(physicalFilePath);

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Errore durante l'eliminazione del documento con ID {DocumentId}.", id);
                return StatusCode(500, "Errore interno durante l'eliminazione del documento.");
            }
        }

        private async Task AddDocumentLogAsync(
            int documentId,
            string action,
            string description)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userFullName = "Utente non identificato";

            if (!string.IsNullOrWhiteSpace(currentUserId))
            {
                var user = await _userManager.FindByIdAsync(currentUserId);

                if (user != null)
                {
                    userFullName = $"{user.Nome} {user.Cognome}".Trim();

                    if (string.IsNullOrWhiteSpace(userFullName))
                        userFullName = user.Email ?? "Utente";
                }
            }

            var log = new DocumentActivityLog
            {
                DocumentId = documentId,
                UserId = currentUserId,
                UserFullName = userFullName,
                Action = action,
                Description = description,
                CreatedAt = DateTime.Now
            };

            _context.DocumentActivityLogs.Add(log);
            await _context.SaveChangesAsync();
        }

        private async Task<IActionResult?> ValidateCategoryClientAndWorkflowStatus(
            int categoriaId,
            int clienteId,
            int? workflowStatusId)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == categoriaId && c.Attiva);

            if (!categoryExists)
                return BadRequest("Categoria non valida o non attiva.");

            var clientExists = await _context.ClientCompanies
                .AnyAsync(c => c.Id == clienteId && c.Attivo);

            if (!clientExists)
                return BadRequest("Cliente/Azienda non valido o non attivo.");

            if (workflowStatusId.HasValue)
            {
                var workflowStatusExists = await _context.DocumentWorkflowStatuses
                    .AnyAsync(s => s.Id == workflowStatusId.Value && s.Attivo);

                if (!workflowStatusExists)
                    return BadRequest("Stato pratica non valido o non attivo.");
            }

            return null;
        }

        private static string? ValidateUploadedFile(IFormFile file)
        {
            if (file.Length == 0)
                return "Il file è vuoto.";

            if (file.Length > MaxFileSize)
                return "Il file non può superare i 5 MB.";

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
                return "Formato file non consentito. Sono ammessi: PDF, DOC, DOCX, JPG, JPEG, PNG.";

            return null;
        }

        private static string? GetPhysicalFilePath(string? percorsoFile)
        {
            if (string.IsNullOrWhiteSpace(percorsoFile))
                return null;

            var relativePath = percorsoFile.TrimStart('/');

            return Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                relativePath);
        }

        private static string GetContentType(string filePath)
        {
            var extension = Path.GetExtension(filePath).ToLowerInvariant();

            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ".jpg" => "image/jpeg",
                ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                _ => "application/octet-stream"
            };
        }

        private async Task<DocumentReadDto?> MapToReadDto(int documentId)
        {
            return await _context.Documents
                .Include(d => d.Categoria)
                .Include(d => d.Cliente)
                .Include(d => d.WorkflowStatus)
                .Include(d => d.AssignedToUser)
                .Include(d => d.AssignedByUser)
                .Include(d => d.LockedByUser)
                .Where(d => d.Id == documentId)
                .Select(d => new DocumentReadDto
                {
                    Id = d.Id,
                    Titolo = d.Titolo,
                    Descrizione = d.Descrizione,
                    CategoriaId = d.CategoriaId,
                    CategoriaNome = d.Categoria != null ? d.Categoria.Nome : string.Empty,
                    ClienteId = d.ClienteId,
                    ClienteRagioneSociale = d.Cliente != null ? d.Cliente.RagioneSociale : string.Empty,
                    NomeFile = d.NomeFile,
                    PercorsoFile = d.PercorsoFile,
                    Stato = d.Stato.ToString(),
                    WorkflowStatusId = d.WorkflowStatusId,
                    WorkflowStatusNome = d.WorkflowStatus != null ? d.WorkflowStatus.Nome : null,
                    WorkflowStatusColore = d.WorkflowStatus != null ? d.WorkflowStatus.Colore : null,

                    AssignedToUserId = d.AssignedToUserId,
                    AssignedToUserFullName = d.AssignedToUser != null
                        ? (d.AssignedToUser.Nome + " " + d.AssignedToUser.Cognome).Trim()
                        : null,
                    AssignedAt = d.AssignedAt,
                    AssignedByUserId = d.AssignedByUserId,
                    AssignedByUserFullName = d.AssignedByUser != null
                        ? (d.AssignedByUser.Nome + " " + d.AssignedByUser.Cognome).Trim()
                        : null,

                    LockedByUserId = d.LockedByUserId,
                    LockedByUserFullName = d.LockedByUser != null
                        ? (d.LockedByUser.Nome + " " + d.LockedByUser.Cognome).Trim()
                        : null,
                    LockedAt = d.LockedAt,

                    DataCreazione = d.DataCreazione,
                    DataUltimaModifica = d.DataUltimaModifica
                })
                .FirstOrDefaultAsync();
        }
    }
}