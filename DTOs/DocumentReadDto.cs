namespace DocuArchive.DTOs
{
    public class DocumentReadDto
    {
        public int Id { get; set; }

        public string Titolo { get; set; } = string.Empty;

        public string? Descrizione { get; set; }

        public int CategoriaId { get; set; }

        public string CategoriaNome { get; set; } = string.Empty;

        public int ClienteId { get; set; }

        public string ClienteRagioneSociale { get; set; } = string.Empty;

        public string? NomeFile { get; set; }

        public string? PercorsoFile { get; set; }

        public string Stato { get; set; } = string.Empty;

        public DateTime DataCreazione { get; set; }

        public DateTime? DataUltimaModifica { get; set; }

        public int? WorkflowStatusId { get; set; }

        public string? WorkflowStatusNome { get; set; }

        public string? WorkflowStatusColore { get; set; }

        public string? AssignedToUserId { get; set; }

        public string? AssignedToUserFullName { get; set; }

        public DateTime? AssignedAt { get; set; }

        public string? AssignedByUserId { get; set; }

        public string? AssignedByUserFullName { get; set; }

        public string? LockedByUserId { get; set; }

        public string? LockedByUserFullName { get; set; }

        public DateTime? LockedAt { get; set; }
    }
}